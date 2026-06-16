import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OutboxManager } from '../outbox.js';
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

describe('OutboxManager', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('persists failed events by eventId and reports queue stats', async () => {
    const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-outbox-'));
    tempDirs.push(runtimeRoot);
    const outbox = new OutboxManager({ runtimeRoot, maxEvents: 10, maxSizeBytes: 1024 * 1024, ttlDays: 7 });

    await outbox.append(createEvent('evt-outbox-001', '2026-04-10T10:00:00.000Z'));
    await outbox.append(createEvent('evt-outbox-001', '2026-04-10T10:00:00.000Z'));

    const entries = await outbox.list();
    const stats = await outbox.getStats();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.eventId).toBe('evt-outbox-001');
    expect(entries[0]?.retryCount).toBe(0);
    expect(stats.pendingEvents).toBe(1);
    expect(stats.maxEvents).toBe(10);
    expect(stats.maxSizeBytes).toBe(1024 * 1024);
    expect(stats.oldestTimestamp).toBe('2026-04-10T10:00:00.000Z');
  });

  it('evicts oldest entries beyond capacity and cleans up expired files', async () => {
    const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-outbox-limits-'));
    tempDirs.push(runtimeRoot);
    const outbox = new OutboxManager({ runtimeRoot, maxEvents: 2, maxSizeBytes: 1024 * 1024, ttlDays: 7 });

    await outbox.append(createEvent('evt-oldest', '2026-04-10T08:00:00.000Z'));
    await outbox.append(createEvent('evt-middle', '2026-04-10T09:00:00.000Z'));
    await outbox.append(createEvent('evt-latest', '2026-04-10T10:00:00.000Z'));

    const outboxDir = join(runtimeRoot, '.outbox');
    await writeFile(
      join(outboxDir, 'evt-expired.json'),
      JSON.stringify({
        eventId: 'evt-expired',
        eventType: 'message.updated',
        payload: { content: 'expired' },
        timestamp: '2020-01-01T00:00:00.000Z',
        retryCount: 1,
      }),
      'utf8'
    );

    await outbox.cleanup();
    const entries = await outbox.list();
    const stats = await outbox.getStats();

    expect(entries.map((entry) => entry.eventId)).toEqual(['evt-middle', 'evt-latest']);
    expect(stats.pendingEvents).toBe(2);
    expect(stats.droppedEvents).toBe(2);
  });
});
