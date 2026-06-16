import type { ServiceLauncher } from './launcher.js';
import type { OutboxManager } from './outbox.js';
import type {
  EventStatusResult,
  IngestDeliveryResponse,
  OutboxStats,
  ReplayResult,
  IngestionEventInput,
} from './types.js';

const DEFAULT_INTERVAL_MS = 30_000;
const DEFAULT_BASE_DELAY_MS = 1_000;
const DEFAULT_MAX_DELAY_MS = 30_000;

interface ReplayWorkerOptions {
  outbox: Pick<OutboxManager, 'cleanup' | 'list' | 'remove' | 'markAttempt' | 'getStats'>;
  launcher: Pick<ServiceLauncher, 'isReady'>;
  ingestClient: {
    getStatus(eventId: string): Promise<EventStatusResult>;
    deliver(event: IngestionEventInput): Promise<IngestDeliveryResponse>;
  };
  intervalMs?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  sleepImpl?: (ms: number) => Promise<void>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

export class ReplayWorker {
  private readonly outbox;
  private readonly launcher;
  private readonly ingestClient;
  private readonly intervalMs;
  private readonly baseDelayMs;
  private readonly maxDelayMs;
  private readonly sleepImpl;
  private timer: ReturnType<typeof setInterval> | null = null;
  private inFlight: Promise<ReplayResult> | null = null;

  constructor(options: ReplayWorkerOptions) {
    this.outbox = options.outbox;
    this.launcher = options.launcher;
    this.ingestClient = options.ingestClient;
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.sleepImpl = options.sleepImpl ?? sleep;
  }

  async start(): Promise<void> {
    if (this.timer) {
      return;
    }

    void this.runOnce();
    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);
  }

  async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.inFlight) {
      await this.inFlight;
    }
  }

  async runOnce(): Promise<ReplayResult> {
    if (this.inFlight) {
      return {
        replayed: 0,
        skippedDuplicates: 0,
        remaining: (await this.outbox.getStats()).pendingEvents,
        stoppedReason: 'running',
      };
    }

    const task = this.runOnceInternal();
    this.inFlight = task;

    try {
      return await task;
    } finally {
      this.inFlight = null;
    }
  }

  async getStatus(): Promise<{ running: boolean; outbox: OutboxStats }> {
    return {
      running: this.timer !== null,
      outbox: await this.outbox.getStats(),
    };
  }

  private async runOnceInternal(): Promise<ReplayResult> {
    await this.outbox.cleanup();
    const initialEntries = await this.outbox.list();
    if (initialEntries.length === 0) {
      return {
        replayed: 0,
        skippedDuplicates: 0,
        remaining: 0,
        stoppedReason: 'empty',
      };
    }

    const ready = await this.launcher.isReady();
    if (!ready) {
      return {
        replayed: 0,
        skippedDuplicates: 0,
        remaining: initialEntries.length,
        stoppedReason: 'service_unavailable',
      };
    }

    let replayed = 0;
    let skippedDuplicates = 0;

    for (const entry of initialEntries) {
      const status = await this.ingestClient.getStatus(entry.eventId);
      if (status.found) {
        await this.outbox.remove(entry.eventId);
        skippedDuplicates += 1;
        continue;
      }

      const result = await this.ingestClient.deliver(entry);
      if (result.success) {
        await this.outbox.remove(entry.eventId);
        replayed += 1;
        continue;
      }

      await this.outbox.markAttempt(entry.eventId, result.error);
      const delay = Math.min(this.baseDelayMs * 2 ** (entry.retryCount + 1), this.maxDelayMs);
      await this.sleepImpl(delay);
      return {
        replayed,
        skippedDuplicates,
        remaining: (await this.outbox.getStats()).pendingEvents,
        stoppedReason: 'delivery_failed',
        lastError: result.error,
      };
    }

    return {
      replayed,
      skippedDuplicates,
      remaining: (await this.outbox.getStats()).pendingEvents,
      stoppedReason: 'empty',
    };
  }
}
