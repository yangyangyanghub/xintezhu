import { describe, expect, it } from 'bun:test';
import { OpenCodeAdapter } from '../adapter/opencode.ts';

describe('OpenCodeAdapter degraded status', () => {
  it('surfaces degraded mode when semantic retrieval is unavailable', async () => {
    const adapter = new OpenCodeAdapter(
      {
        health: async () => ({
          status: 'ok',
          localOnly: true,
          runtimeRoot: '.local-memory-test',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'ok' },
            projection: { status: 'ok' },
          },
        }),
      } as never,
      { ingestEvent: async () => ({ accepted: true, eventId: 'evt', batchId: 'batch', ingestionEventId: 'ing-1' }) } as never,
      {} as never,
      {
        isSemanticAvailable: async () => false,
      } as never,
      {} as never,
      { workspace: 'test', enableForwarding: true, enableTools: true }
    );

    const status = await adapter.getStatus();

    expect(status.memoryCoreAvailable).toBe(true);
    expect(status.degraded).toBe(true);
    expect(status.degradedReason).toContain('Semantic provider unavailable');
  });
});
