import { describe, expect, it } from 'bun:test';
import type { IngestionEventInput } from '../types/index.ts';
import { OpenCodeAdapter } from '../adapter/opencode.ts';

describe('Task 18: OpenCode Adapter QA Scenarios', () => {
  describe('QA Scenario: Hook forwarding happy path', () => {
    it('forwards message.updated and receives acceptance response', async () => {
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

      const result = await adapter.onMessageUpdated({
        type: 'message.updated',
        properties: {
          info: {
            id: 'msg-test-001',
            role: 'user',
            content: '这个规则必须记住',
          },
        },
      });

      // Assert Memory Core receives normalized event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.eventType).toBe('message.updated');
      expect(capturedEvent?.sourceType).toBe('opencode');
      expect(capturedEvent?.payload.content).toBe('这个规则必须记住');
      
      // Assert returns acceptance response
      expect(result).not.toBeNull();
      expect(result?.accepted).toBe(true);
      
      // Assert adapter does not perform local classification logic
      // (importance is not inferred by adapter, only forwarded)
      expect(capturedEvent?.payload.importance).toBeUndefined();
    });

    it('forwards file.edited and receives acceptance response', async () => {
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

      const result = await adapter.onFileEdited({
        type: 'file.edited',
        properties: {
          filePath: '/workspace/test.ts',
          changeType: 'modified',
        },
      });

      // Assert Memory Core receives normalized event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.eventType).toBe('file.edited');
      expect(capturedEvent?.sourceType).toBe('opencode');
      expect(capturedEvent?.payload.filePath).toBe('/workspace/test.ts');
      
      // Assert returns acceptance response
      expect(result).not.toBeNull();
      expect(result?.accepted).toBe(true);
    });

    it('forwards session.idle and receives acceptance response', async () => {
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
            return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-3' };
          },
        } as never,
        {} as never,
        { isSemanticAvailable: async () => false } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.onSessionIdle({
        type: 'session.idle',
        properties: {
          sessionID: 'sess-123',
          duration: 3600,
        },
      });

      // Assert Memory Core receives normalized event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.eventType).toBe('session.idle');
      expect(capturedEvent?.payload.sessionId).toBe('sess-123');
      
      // Assert returns acceptance response
      expect(result).not.toBeNull();
      expect(result?.accepted).toBe(true);
    });

    it('forwards session.compacted and receives acceptance response', async () => {
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
            return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-4' };
          },
        } as never,
        {} as never,
        { isSemanticAvailable: async () => false } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.onSessionCompacted({
        type: 'session.compacted',
        properties: {
          sessionID: 'sess-456',
        },
      });

      // Assert Memory Core receives normalized event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.eventType).toBe('session.compacted');
      expect(capturedEvent?.payload.sessionId).toBe('sess-456');
      
      // Assert returns acceptance response
      expect(result).not.toBeNull();
      expect(result?.accepted).toBe(true);
    });

    it('forwards session.created and receives acceptance response', async () => {
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
            return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-5' };
          },
        } as never,
        {} as never,
        { isSemanticAvailable: async () => false } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.onSessionCreated({
        type: 'session.created',
        properties: {
          info: {
            id: 'sess-new-789',
          },
        },
      });

      // Assert Memory Core receives normalized event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.eventType).toBe('session.created');
      expect(capturedEvent?.payload.sessionId).toBe('sess-new-789');
      
      // Assert returns acceptance response
      expect(result).not.toBeNull();
      expect(result?.accepted).toBe(true);
    });
  });

  describe('QA Scenario: Core unavailable behavior', () => {
    it('reports core unavailable for memory_status when Memory Core is unreachable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.memory_status();

      // Assert adapter reports core unavailable clearly
      expect(result.success).toBe(true);
      expect(result.status).not.toBeNull();
      expect(result.status?.memoryCoreAvailable).toBe(false);
      expect(result.status?.healthy).toBe(false);
      expect(result.status?.degraded).toBe(true);
      expect(result.status?.degradedReason).toContain('Memory Core unreachable');
    });

    it('returns error for remember() when Memory Core is unavailable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.remember('测试内容');

      // Assert returns clear error without crashing
      expect(result.success).toBe(false);
      expect(result.error).toContain('Memory Core unavailable');
    });

    it('returns error for recall() when Memory Core is unavailable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.recall('查询');

      // Assert returns clear error without crashing
      expect(result.success).toBe(false);
      expect(result.error).toContain('Memory Core unavailable');
    });

    it('returns error for forget() when Memory Core is unavailable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.forget('测试');

      // Assert returns clear error without crashing
      expect(result.success).toBe(false);
      expect(result.error).toContain('Memory Core unavailable');
    });

    it('returns error for consolidate() when Memory Core is unavailable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.consolidate('测试内容', 'preferences');

      // Assert returns clear error without crashing
      expect(result.success).toBe(false);
      expect(result.error).toContain('Memory Core unavailable');
    });

    it('returns error for getContext() when Memory Core is unavailable', async () => {
      const adapter = new OpenCodeAdapter(
        {
          health: async () => {
            throw new Error('Connection refused');
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.getContext('查询');

      // Assert returns clear error without crashing
      expect(result.success).toBe(false);
      expect(result.error).toContain('Memory Core unavailable');
    });

    it('returns null for forwarding hooks when forwarding is disabled', async () => {
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
        { isSemanticAvailable: async () => false } as never,
        {} as never,
        { workspace: 'test', enableForwarding: false, enableTools: true }
      );

      const result = await adapter.onMessageUpdated({
        type: 'message.updated',
        properties: {
          info: {
            id: 'msg-disabled',
            role: 'user',
            content: '内容',
          },
        },
      });

      // Assert returns null when forwarding disabled
      expect(result).toBeNull();
    });

    it('returns error for tools when tools are disabled', async () => {
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
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: false }
      );

      const result = await adapter.remember('测试内容');

      // Assert returns error when tools disabled
      expect(result.success).toBe(false);
      expect(result.error).toBe('Tools disabled');
    });
  });

  describe('QA Scenario: Tool surface delegates to Memory Core', () => {
    it('remember() creates high-importance memory when specified', async () => {
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
            return { accepted: true, eventId: event.eventId, batchId: event.batchId, ingestionEventId: 'ing-6' };
          },
        } as never,
        {} as never,
        { isSemanticAvailable: async () => false } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.remember('重要规则', { importance: 'high' });

      // Assert delegates to Memory Core
      expect(result.success).toBe(true);
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.payload.content).toBe('重要规则');
      expect(capturedEvent?.payload.importance).toBe('high');
    });

    it('recall() delegates search to Memory Core', async () => {
      let capturedQuery: string | null = null;
      let capturedMode: string | null = null;

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
        {} as never,
        {} as never,
        {
          search: async (query: string, mode: string) => {
            capturedQuery = query;
            capturedMode = mode;
            return {
              results: [{ memory: { id: 'm1', content: '结果1' } }],
            };
          },
        } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.recall('搜索关键词');

      // Assert delegates search to Memory Core
      expect(result.success).toBe(true);
      expect(capturedQuery).toBe('搜索关键词');
      expect(capturedMode).toBe('hybrid');
    });

    it('forget() delegates to governance service', async () => {
      let forgetCalled = false;

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
        {} as never,
        {
          forgetMemory: async () => {
            forgetCalled = true;
            return { success: true };
          },
        } as never,
        {
          search: async () => ({
            results: [{ memory: { id: 'mem-to-forget', content: '要忘记的内容' } }],
          }),
        } as never,
        {} as never,
        { workspace: 'test', enableForwarding: true, enableTools: true }
      );

      const result = await adapter.forget('要忘记');

      // Assert delegates to governance
      expect(result.success).toBe(true);
      expect(forgetCalled).toBe(true);
    });
  });
});
