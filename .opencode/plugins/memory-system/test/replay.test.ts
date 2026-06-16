import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OutboxManager } from '../outbox.js';
import { ReplayWorker } from '../replay.js';
import type { IngestionEventInput } from '../types.js';

function createEvent(eventId: string, timestamp: string): IngestionEventInput {
  return {
    eventId,
    batchId: `batch-${eventId}`,
    eventType: 'message.updated',
    sourceType: 'opencode',
    sourceRef: `source-${eventId}`,
    workspace: 'workspace-test',
    payload: {
      content: `payload-${eventId}`,
      timestamp,
    },
  };
}

describe('ReplayWorker', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('replays pending entries in timestamp order and removes successful items', async () => {
    const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-replay-'));
    tempDirs.push(runtimeRoot);
    const outbox = new OutboxManager({ runtimeRoot, maxEvents: 10, maxSizeBytes: 1024 * 1024, ttlDays: 7 });

    await outbox.append(createEvent('evt-2', '2026-04-10T10:02:00.000Z'));
    await outbox.append(createEvent('evt-1', '2026-04-10T10:01:00.000Z'));

    const delivered: string[] = [];
    const worker = new ReplayWorker({
      outbox,
      launcher: {
        isReady: async () => true,
      },
      ingestClient: {
        getStatus: async (eventId) => ({ found: false, eventId }),
        deliver: async (event) => {
          delivered.push(event.eventId);
          return { success: true, status: 200 };
        },
      },
      baseDelayMs: 10,
      maxDelayMs: 100,
    });

    const result = await worker.runOnce();
    const remaining = await outbox.list();

    expect(result.replayed).toBe(2);
    expect(result.remaining).toBe(0);
    expect(delivered).toEqual(['evt-1', 'evt-2']);
    expect(remaining).toHaveLength(0);
  });

  it('skips already ingested duplicates and backs off after delivery failure', async () => {
    const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-replay-duplicate-'));
    tempDirs.push(runtimeRoot);
    const outbox = new OutboxManager({ runtimeRoot, maxEvents: 10, maxSizeBytes: 1024 * 1024, ttlDays: 7 });

    await outbox.append(createEvent('evt-duplicate', '2026-04-10T10:00:00.000Z'));
    await outbox.append(createEvent('evt-failing', '2026-04-10T10:01:00.000Z'));

    const delays: number[] = [];
    const delivered: string[] = [];
    const worker = new ReplayWorker({
      outbox,
      launcher: {
        isReady: async () => true,
      },
      ingestClient: {
        getStatus: async (eventId) => ({ found: eventId === 'evt-duplicate', eventId }),
        deliver: async (event) => {
          delivered.push(event.eventId);
          return { success: false, status: 503, error: 'service unavailable' };
        },
      },
      sleepImpl: async (ms) => {
        delays.push(ms);
      },
      baseDelayMs: 10,
      maxDelayMs: 80,
    });

    const result = await worker.runOnce();
    const remaining = await outbox.list();

    expect(result.skippedDuplicates).toBe(1);
    expect(result.replayed).toBe(0);
    expect(result.remaining).toBe(1);
    expect(delivered).toEqual(['evt-failing']);
    expect(delays).toEqual([20]);
    expect(remaining[0]?.eventId).toBe('evt-failing');
    expect(remaining[0]?.retryCount).toBe(1);
  });
});
