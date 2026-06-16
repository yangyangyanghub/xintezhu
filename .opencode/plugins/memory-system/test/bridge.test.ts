import { describe, expect, it } from 'bun:test';
import { bridgeHookEvent, createIngestionEventInput } from '../bridge.js';
import type { HookEvent, IngestionEventInput } from '../types.js';

function createEnsureReadyResult(success = true) {
  return {
    success,
    ready: success,
    error: success ? undefined : 'service unavailable',
  };
}

describe('memory-system HTTP bridge', () => {
  it('normalizes every supported OpenCode hook into ingestion input', () => {
    const cases: Array<{
      event: HookEvent;
      eventType: IngestionEventInput['eventType'];
      sourceRef: string;
      assertPayload: (payload: Record<string, unknown>) => void;
    }> = [
      {
        event: {
          type: 'session.created',
          properties: {
            info: {
              id: 'sess-created-001',
            },
          },
        },
        eventType: 'session.created',
        sourceRef: 'sess-created-001',
        assertPayload: (payload) => {
          expect(payload.sessionId).toBe('sess-created-001');
        },
      },
      {
        event: {
          type: 'message.updated',
          properties: {
            info: {
              id: 'msg-001',
              role: 'user',
              content: '这条内容需要自动入库',
              tokens: {
                input: 10,
                output: 20,
              },
            },
          },
        },
        eventType: 'message.updated',
        sourceRef: 'msg-001',
        assertPayload: (payload) => {
          expect(payload.messageId).toBe('msg-001');
          expect(payload.content).toBe('这条内容需要自动入库');
          expect(payload.role).toBe('user');
        },
      },
      {
        event: {
          type: 'session.idle',
          properties: {
            sessionID: 'sess-idle-001',
            duration: 120,
          },
        },
        eventType: 'session.idle',
        sourceRef: 'sess-idle-001',
        assertPayload: (payload) => {
          expect(payload.sessionId).toBe('sess-idle-001');
          expect(payload.duration).toBe(120);
        },
      },
      {
        event: {
          type: 'session.compacted',
          properties: {
            sessionID: 'sess-compact-001',
          },
        },
        eventType: 'session.compacted',
        sourceRef: 'sess-compact-001',
        assertPayload: (payload) => {
          expect(payload.sessionId).toBe('sess-compact-001');
        },
      },
      {
        event: {
          type: 'file.edited',
          properties: {
            filePath: '/workspace/src/app.ts',
            changeType: 'modified',
          },
        },
        eventType: 'file.edited',
        sourceRef: '/workspace/src/app.ts',
        assertPayload: (payload) => {
          expect(payload.filePath).toBe('/workspace/src/app.ts');
          expect(payload.changeType).toBe('modified');
        },
      },
    ];

    for (const testCase of cases) {
      const first = createIngestionEventInput(testCase.event, { workspace: 'workspace-a' });
      const second = createIngestionEventInput(testCase.event, { workspace: 'workspace-a' });

      expect(first.eventType).toBe(testCase.eventType);
      expect(first.sourceType).toBe('opencode');
      expect(first.workspace).toBe('workspace-a');
      expect(first.sourceRef).toBe(testCase.sourceRef);
      expect(first.eventId).toBe(second.eventId);
      expect(first.batchId).toBe(second.batchId);
      testCase.assertPayload(first.payload);
    }
  });

  it('ensures service readiness and POSTs normalized events to /api/ingest', async () => {
    const requests: Array<{ url: string; body: IngestionEventInput }> = [];
    let ensureReadyCalls = 0;
    let legacyFallbackCalls = 0;

    const result = await bridgeHookEvent(
      {
        type: 'message.updated',
        properties: {
          info: {
            id: 'msg-http-001',
            role: 'user',
            content: '请把这条消息发给本地记忆服务',
          },
        },
      },
      {
        workspace: 'workspace-http',
        launcher: {
          ensureReady: async () => {
            ensureReadyCalls += 1;
            return createEnsureReadyResult();
          },
        },
        fetchImpl: async (input, init) => {
          requests.push({
            url: String(input),
            body: JSON.parse(String(init?.body)) as IngestionEventInput,
          });

          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        },
        legacyFallback: async () => {
          legacyFallbackCalls += 1;
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(false);
    expect(ensureReadyCalls).toBe(1);
    expect(legacyFallbackCalls).toBe(0);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe('http://127.0.0.1:37777/api/ingest');
    expect(requests[0]?.body.eventType).toBe('message.updated');
    expect(requests[0]?.body.payload.content).toBe('请把这条消息发给本地记忆服务');
  });

  it('retries transient ingest failures before succeeding', async () => {
    let fetchCalls = 0;

    const result = await bridgeHookEvent(
      {
        type: 'session.idle',
        properties: {
          sessionID: 'sess-retry-001',
          duration: 12,
        },
      },
      {
        workspace: 'workspace-retry',
        launcher: {
          ensureReady: async () => createEnsureReadyResult(),
        },
        retries: 2,
        fetchImpl: async () => {
          fetchCalls += 1;
          if (fetchCalls === 1) {
            return new Response(JSON.stringify({ error: 'retry me' }), { status: 503 });
          }

          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        },
      }
    );

    expect(result.success).toBe(true);
    expect(fetchCalls).toBe(2);
  });

  it('keeps legacy direct-write fallback disabled by default', async () => {
    let legacyFallbackCalls = 0;

    const result = await bridgeHookEvent(
      {
        type: 'session.created',
        properties: {
          info: {
            id: 'sess-no-fallback-001',
          },
        },
      },
      {
        workspace: 'workspace-no-fallback',
        launcher: {
          ensureReady: async () => createEnsureReadyResult(false),
        },
        legacyFallback: async () => {
          legacyFallbackCalls += 1;
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.fallbackUsed).toBe(false);
    expect(legacyFallbackCalls).toBe(0);
  });

  it('uses legacy direct-write only when explicitly enabled', async () => {
    let legacyFallbackCalls = 0;

    const result = await bridgeHookEvent(
      {
        type: 'file.edited',
        properties: {
          filePath: '/workspace/fallback.ts',
          changeType: 'modified',
        },
      },
      {
        workspace: 'workspace-fallback',
        enableLegacyFallback: true,
        launcher: {
          ensureReady: async () => createEnsureReadyResult(false),
        },
        legacyFallback: async () => {
          legacyFallbackCalls += 1;
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(true);
    expect(legacyFallbackCalls).toBe(1);
  });

  it('queues the ingestion event in the local outbox when delivery fails', async () => {
    const queuedEvents: string[] = [];

    const result = await bridgeHookEvent(
      {
        type: 'message.updated',
        properties: {
          info: {
            id: 'msg-outbox-001',
            role: 'user',
            content: '服务挂了时请把我写进 outbox',
          },
        },
      },
      {
        workspace: 'workspace-outbox',
        launcher: {
          ensureReady: async () => createEnsureReadyResult(false),
        },
        outbox: {
          append: async (event) => {
            queuedEvents.push(event.eventId);
          },
        },
      }
    );

    const queuedEventId = result.ingestionEvent?.eventId;

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(false);
    expect(result.outboxQueued).toBe(true);
    expect(queuedEventId).toBeDefined();
    expect(queuedEvents).toEqual([queuedEventId!]);
  });
});
