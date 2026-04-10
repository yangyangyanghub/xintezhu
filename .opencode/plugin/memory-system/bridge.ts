import { createHash } from 'node:crypto';
import type { ServiceLauncher } from './launcher.js';
import type {
  BridgeDeliveryResult,
  EventStatusResult,
  HookEvent,
  IngestDeliveryResponse,
  IngestionEventInput,
  OutboxStats,
} from './types.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:37777';
const DEFAULT_PORT = 37777;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

interface BridgeOptions {
  baseUrl?: string;
  workspace?: string;
  launcher: Pick<ServiceLauncher, 'ensureReady'>;
  runtimeRoot?: string;
  port?: number;
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: FetchLike;
  enableLegacyFallback?: boolean;
  legacyFallback?: (event: HookEvent) => Promise<void>;
  outbox?: {
    append(event: IngestionEventInput): Promise<void>;
    getStats?(): Promise<OutboxStats>;
  };
}

interface NormalizedHookEvent {
  sourceRef: string;
  payload: Record<string, unknown>;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    return Object.keys(objectValue)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortValue(objectValue[key]);
        return result;
      }, {});
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function createDigest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex').slice(0, 16);
}

function getMessageContent(info: HookEvent extends never ? never : Record<string, unknown>): string {
  const typedInfo = info as {
    content?: string;
    summary?: { title?: string; body?: string };
  };
  return typedInfo.content ?? typedInfo.summary?.body ?? typedInfo.summary?.title ?? '';
}

function normalizeHookEvent(event: HookEvent): NormalizedHookEvent {
  switch (event.type) {
    case 'session.created':
      return {
        sourceRef: event.properties.info.id,
        payload: {
          sessionId: event.properties.info.id,
        },
      };
    case 'message.updated': {
      const info = event.properties.info;
      return {
        sourceRef: info.id,
        payload: {
          messageId: info.id,
          role: info.role,
          content: getMessageContent(info),
          ...(info.summary ? { summary: info.summary } : {}),
          ...(info.tokens ? { tokens: info.tokens } : {}),
        },
      };
    }
    case 'session.idle':
      return {
        sourceRef: event.properties.sessionID,
        payload: {
          sessionId: event.properties.sessionID,
          ...(event.properties.duration !== undefined ? { duration: event.properties.duration } : {}),
        },
      };
    case 'session.compacted':
      return {
        sourceRef: event.properties.sessionID,
        payload: {
          sessionId: event.properties.sessionID,
        },
      };
    case 'file.edited':
      return {
        sourceRef: event.properties.filePath,
        payload: {
          filePath: event.properties.filePath,
          changeType: event.properties.changeType,
        },
      };
  }
}

function buildEventId(event: HookEvent, normalized: NormalizedHookEvent): string {
  return `opencode-${event.type}-${createDigest({
    sourceRef: normalized.sourceRef,
    payload: normalized.payload,
  })}`;
}

function buildBatchId(event: HookEvent, normalized: NormalizedHookEvent): string {
  return `opencode-batch-${event.type}-${createDigest({ sourceRef: normalized.sourceRef })}`;
}

async function postIngestionEvent(
  ingestionEvent: IngestionEventInput,
  options: Required<Pick<BridgeOptions, 'baseUrl' | 'fetchImpl' | 'retries'>>
): Promise<IngestDeliveryResponse> {
  let attempt = 0;
  let lastError = 'unknown ingest error';
  let lastStatus: number | undefined;

  while (attempt <= options.retries) {
    attempt += 1;

    try {
      const response = await options.fetchImpl(`${options.baseUrl}/api/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingestionEvent),
      });

      if (response.ok) {
        return { success: true, status: response.status };
      }

      lastStatus = response.status;
      lastError = await response.text();

      if (response.status < 500 || attempt > options.retries) {
        return { success: false, status: response.status, error: lastError || `HTTP ${response.status}` };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt > options.retries) {
        return { success: false, status: lastStatus, error: lastError };
      }
    }
  }

  return { success: false, status: lastStatus, error: lastError };
}

async function getEventStatus(
  eventId: string,
  options: Required<Pick<BridgeOptions, 'baseUrl' | 'fetchImpl'>>
): Promise<EventStatusResult> {
  try {
    const response = await options.fetchImpl(
      `${options.baseUrl}/api/ingest/status?eventId=${encodeURIComponent(eventId)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return { found: false, eventId };
    }

    const body = await response.json() as Record<string, unknown> | null;
    if (body && typeof body.eventId === 'string') {
      return {
        found: true,
        eventId: body.eventId,
        status: typeof body.status === 'string' ? body.status : undefined,
      };
    }
  } catch (error) {
    console.debug(`[MemoryBridge] Failed to query ingest status for ${eventId}`, error);
  }

  return { found: false, eventId };
}

export function createBridgeIngestClient(
  options: Pick<BridgeOptions, 'baseUrl' | 'fetchImpl' | 'retries'>
): {
  deliver(event: IngestionEventInput): Promise<IngestDeliveryResponse>;
  getStatus(eventId: string): Promise<EventStatusResult>;
} {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;
  const retries = options.retries ?? DEFAULT_RETRIES;

  return {
    deliver: async (event) => postIngestionEvent(event, { baseUrl, fetchImpl, retries }),
    getStatus: async (eventId) => getEventStatus(eventId, { baseUrl, fetchImpl }),
  };
}

export async function queryBridgeStatus(
  options: Pick<BridgeOptions, 'baseUrl' | 'fetchImpl' | 'outbox'> = {}
): Promise<{
  ready: boolean;
  remoteStatus?: Record<string, unknown>;
  outbox?: OutboxStats;
}> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  let ready = false;
  let remoteStatus: Record<string, unknown> | undefined;

  try {
    const readyResponse = await fetchImpl(`${baseUrl}/ready`, { method: 'GET' });
    ready = readyResponse.ok;

    const statusResponse = await fetchImpl(`${baseUrl}/api/status`, { method: 'GET' });
    if (statusResponse.ok) {
      remoteStatus = await statusResponse.json() as Record<string, unknown>;
    }
  } catch (error) {
    console.debug(`[MemoryBridge] Failed to query bridge status from ${baseUrl}`, error);
    ready = false;
  }

  return {
    ready,
    remoteStatus,
    outbox: options.outbox?.getStats ? await options.outbox.getStats() : undefined,
  };
}

export function createIngestionEventInput(
  event: HookEvent,
  options: Pick<BridgeOptions, 'workspace'> = {}
): IngestionEventInput {
  const normalized = normalizeHookEvent(event);

  return {
    eventId: buildEventId(event, normalized),
    batchId: buildBatchId(event, normalized),
    eventType: event.type,
    sourceType: 'opencode',
    sourceRef: normalized.sourceRef,
    ...(options.workspace ? { workspace: options.workspace } : {}),
    payload: normalized.payload,
  };
}

export async function bridgeHookEvent(event: HookEvent, options: BridgeOptions): Promise<BridgeDeliveryResult> {
  const ingestionEvent = createIngestionEventInput(event, { workspace: options.workspace });
  const ingestClient = createBridgeIngestClient(options);

  const readiness = await options.launcher.ensureReady({
    port: options.port ?? DEFAULT_PORT,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    runtimeRoot: options.runtimeRoot,
  });

  if (!readiness.success || !readiness.ready) {
    if (options.outbox) {
      await options.outbox.append(ingestionEvent);
      return {
        success: true,
        fallbackUsed: false,
        outboxQueued: true,
        error: readiness.error,
        ingestionEvent,
      };
    }

    if (options.enableLegacyFallback && options.legacyFallback) {
      await options.legacyFallback(event);
      return {
        success: true,
        fallbackUsed: true,
        error: readiness.error,
        ingestionEvent,
      };
    }

    return {
      success: false,
      fallbackUsed: false,
      error: readiness.error ?? 'local memory service is not ready',
      ingestionEvent,
    };
  }

  const postResult = await ingestClient.deliver(ingestionEvent);

  if (postResult.success) {
    return {
      success: true,
      fallbackUsed: false,
      status: postResult.status,
      ingestionEvent,
    };
  }

  if (options.outbox) {
    await options.outbox.append(ingestionEvent);
    return {
      success: true,
      fallbackUsed: false,
      outboxQueued: true,
      status: postResult.status,
      error: postResult.error,
      ingestionEvent,
    };
  }

  if (options.enableLegacyFallback && options.legacyFallback) {
    await options.legacyFallback(event);
    return {
      success: true,
      fallbackUsed: true,
      status: postResult.status,
      error: postResult.error,
      ingestionEvent,
    };
  }

  return {
    success: false,
    fallbackUsed: false,
    status: postResult.status,
    error: postResult.error,
    ingestionEvent,
  };
}
