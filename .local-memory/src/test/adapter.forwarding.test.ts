import { describe, expect, it } from 'bun:test';
import type { IngestionEventInput } from '../types/index.ts';
import { OpenCodeAdapter } from '../adapter/opencode.ts';

describe('OpenCodeAdapter forwarding stays thin', () => {
  it('does not infer importance when forwarding message updates', async () => {
    let capturedEvent: IngestionEventInput | null = null;

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
      {
        ingestEvent: async (event: IngestionEventInput) => {
          capturedEvent = event;
          return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-1' };
        },
      } as never,
      {} as never,
      { isSemanticAvailable: async () => false } as never,
      {} as never,
      { workspace: 'test', enableForwarding: true, enableTools: true }
    );

    await adapter.onMessageUpdated({
      type: 'message.updated',
      properties: {
        info: {
          id: 'msg-thin-001',
          role: 'user',
          content: '这个规则必须记住',
        },
      },
    });

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent?.payload.importance).toBeUndefined();
  });

  it('defaults remember() to medium importance instead of inferring business priority', async () => {
    let capturedEvent: IngestionEventInput | null = null;

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
      {
        ingestEvent: async (event: IngestionEventInput) => {
          capturedEvent = event;
          return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-2' };
        },
      } as never,
      {} as never,
      { isSemanticAvailable: async () => false } as never,
      {} as never,
      { workspace: 'test', enableForwarding: true, enableTools: true }
    );

    await adapter.remember('这个规则必须记住');

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent?.payload.importance).toBe('medium');
  });
});
