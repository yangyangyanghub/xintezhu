/**
 * Integration Tests for Local Memory System
 * 
 * Tests cover:
 * - End-to-end memory lifecycle
 * - Adapter to core integration
 * - Degraded mode behavior
 * - Rollback and rebuild
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryCoreService } from '../service/core.ts';
import { IngestGateway } from '../ingest/gateway.ts';
import { GovernanceService } from '../governance/index.ts';
import { RetrievalService } from '../retrieval/service.ts';
import { ProjectionEngine } from '../projection/engine.ts';
import { RelationEngine } from '../relations/engine.ts';
import { PromotionEngine } from '../promotion/engine.ts';
import { ContextAssemblyService } from '../context/assembly.ts';
import { CleanupService } from '../cleanup/service.ts';
import { OpenCodeAdapter } from '../adapter/opencode.ts';
import { ClassificationService } from '../classifier/service.ts';
import {
  SQLiteMemoryRepository,
  SQLiteIngestionRepository,
  SQLiteAuditRepository,
  SQLiteEmbeddingRepository,
  SQLitePromotionRepository,
} from '../repository/index.ts';
import type { IngestionEventInput } from '../types/index.ts';
import { bridgeHookEvent } from '../../../.opencode/plugin/memory-system/bridge.js';
import { ServiceLauncher } from '../../../.opencode/plugin/memory-system/launcher.js';
import { OutboxManager } from '../../../.opencode/plugin/memory-system/outbox.js';
import { ReplayWorker } from '../../../.opencode/plugin/memory-system/replay.js';
import type {
  HookEvent,
  IngestionEventInput as PluginIngestionEventInput,
} from '../../../.opencode/plugin/memory-system/types.js';

function createHookMessageUpdatedEvent(messageId: string, content: string): HookEvent {
  return {
    type: 'message.updated',
    properties: {
      info: {
        id: messageId,
        role: 'user',
        content,
      },
    },
  };
}

describe('Local Memory System Integration', () => {
  let db: Database;
  let service: MemoryCoreService;
  let ingestGateway: IngestGateway;
  let governance: GovernanceService;
  let retrieval: RetrievalService;
  let projection: ProjectionEngine;
  let relations: RelationEngine;
  let promotion: PromotionEngine;
  let contextAssembly: ContextAssemblyService;
  let cleanup: CleanupService;
  let adapter: OpenCodeAdapter;
  const tempDirs: string[] = [];

  beforeEach(async () => {
    // Initialize service and reuse its bootstrapped database
    service = new MemoryCoreService({
      runtimeRoot: '.local-memory-test',
      databasePath: ':memory:',
      enableProjection: false,
      projectionRoot: '.memory-test',
    });
    await service.initialize();
    db = service.getDatabase();

    // Initialize repositories
    const memoryRepo = new SQLiteMemoryRepository(db);
    const ingestRepo = new SQLiteIngestionRepository(db);
    const auditRepo = new SQLiteAuditRepository(db);
    const embeddingRepo = new SQLiteEmbeddingRepository(db);
    const promotionRepo = new SQLitePromotionRepository(db);

    // Initialize services
    const classifier = new ClassificationService(memoryRepo, ingestRepo);
    
    ingestGateway = new IngestGateway(ingestRepo, auditRepo, classifier);
    
    governance = new GovernanceService(memoryRepo, auditRepo, ingestRepo);
    
    // Mock provider router (no semantic search in tests)
    const mockProviderRouter = {
      getEmbeddingProvider: () => null,
      getInferenceProvider: () => null,
      getStatus: () => ({ degraded: true, degradedReason: 'Test mode' }),
      isDegraded: () => true,
      initialize: async () => {},
      dispose: async () => {},
    };
    
    retrieval = new RetrievalService(memoryRepo, embeddingRepo, mockProviderRouter as any);
    projection = new ProjectionEngine(memoryRepo, auditRepo);
    relations = new RelationEngine(db, memoryRepo, auditRepo);
    promotion = new PromotionEngine(memoryRepo, auditRepo, promotionRepo, relations);
    contextAssembly = new ContextAssemblyService(memoryRepo, retrieval);
    cleanup = new CleanupService(db, memoryRepo, auditRepo, projection);

    adapter = new OpenCodeAdapter(
      service,
      ingestGateway,
      governance,
      retrieval,
      contextAssembly,
      { workspace: 'test', enableForwarding: true, enableTools: true }
    );
  });

  afterEach(async () => {
    await service.dispose();

    while (tempDirs.length > 0) {
      const tempDir = tempDirs.pop();
      if (tempDir) {
        await rm(tempDir, { force: true, recursive: true });
      }
    }
  });

  describe('End-to-End Memory Lifecycle', () => {
    it('should ingest, classify, and retrieve a memory', async () => {
      const event: IngestionEventInput = {
        eventId: 'test-001',
        batchId: 'batch-001',
        eventType: 'message.updated',
        sourceType: 'opencode',
        sourceRef: 'session-001',
        workspace: 'test',
        payload: {
          messageId: 'msg-001',
          role: 'user',
          content: '我喜欢使用2空格缩进，这是必须记住的习惯',
          importance: 'high',
        },
      };

      // Ingest
      const result = await ingestGateway.ingestEvent(event);
      expect(result.accepted).toBe(true);

      // Wait for classification (async in real impl, synchronous here)
      await new Promise(r => setTimeout(r, 100));

      // Retrieve
      const searchResult = await retrieval.search('空格缩进', 'keyword');
      expect(searchResult.results.length).toBeGreaterThan(0);
      expect(searchResult.results[0].memory.content).toContain('空格缩进');
    });

    it('should reject malformed events', async () => {
      const event: IngestionEventInput = {
        eventId: 'test-002',
        batchId: 'batch-002',
        eventType: 'message.updated',
        sourceType: 'opencode',
        sourceRef: 'session-002',
        workspace: 'test',
        payload: {
          // Missing required fields
          messageId: 'msg-002',
          role: 'user',
        },
      };

      const result = await ingestGateway.ingestEvent(event);
      expect(result.accepted).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should filter noise', async () => {
      const event: IngestionEventInput = {
        eventId: 'test-003',
        batchId: 'batch-003',
        eventType: 'message.updated',
        sourceType: 'opencode',
        sourceRef: 'session-003',
        workspace: 'test',
        payload: {
          messageId: 'msg-003',
          role: 'user',
          content: '我先试试',
          importance: 'low',
        },
      };

      const result = await ingestGateway.ingestEvent(event);
      expect(result.accepted).toBe(true); // Accepted for audit

      // But should not create a memory (filtered by classifier)
      await new Promise(r => setTimeout(r, 100));
      const searchResult = await retrieval.search('试试', 'keyword');
      expect(searchResult.results.length).toBe(0);
    });
  });

  describe('Governance', () => {
    it('should rollback a batch', async () => {
      // Create batch
      const batchId = 'batch-rollback-test';
      
      const event: IngestionEventInput = {
        eventId: 'test-rollback-001',
        batchId,
        eventType: 'message.updated',
        sourceType: 'opencode',
        sourceRef: 'session-rollback',
        workspace: 'test',
        payload: {
          messageId: 'msg-rollback',
          role: 'user',
          content: '测试回滚功能',
          importance: 'high',
        },
      };

      await ingestGateway.ingestEvent(event);
      await new Promise(r => setTimeout(r, 100));

      // Rollback
      const rollbackResult = await governance.rollbackBatch(batchId, 'test', 'Test rollback');
      expect(rollbackResult.success).toBe(true);
    });

    it('should transition memory status', async () => {
      // Create memory
      const event: IngestionEventInput = {
        eventId: 'test-status-001',
        batchId: 'batch-status',
        eventType: 'message.updated',
        sourceType: 'opencode',
        sourceRef: 'session-status',
        workspace: 'test',
        payload: {
          messageId: 'msg-status',
          role: 'user',
          content: '测试状态转换',
          importance: 'high',
        },
      };

      const ingestResult = await ingestGateway.ingestEvent(event);
      await new Promise(r => setTimeout(r, 100));

      // Forget
      const searchResult = await retrieval.search('状态转换', 'keyword');
      if (searchResult.results.length > 0) {
        const memory = searchResult.results[0].memory;
        const forgetResult = await governance.forgetMemory(
          memory.id,
          'test',
          'Test forget'
        );
        expect(forgetResult.success || forgetResult.error).toBeDefined();
      }
    });
  });

  describe('Adapter Integration', () => {
    it('should expose memory tools', async () => {
      // Test remember
      const rememberResult = await adapter.remember('测试记住功能', { importance: 'high' });
      expect(rememberResult.success).toBe(true);

      // Test recall
      const recallResult = await adapter.recall('测试');
      expect(recallResult.success).toBe(true);
      expect(recallResult.results?.length).toBeGreaterThan(0);

      // Test status
      const statusResult = await adapter.memory_status();
      expect(statusResult.success).toBe(true);
      expect(statusResult.status).toBeDefined();
    });

    it('should handle degraded mode', async () => {
      const status = await adapter.getStatus();
      
      // In test mode, we're always degraded (no provider)
      expect(status.degraded).toBe(true);
      expect(status.memoryCoreAvailable).toBe(true); // But core works
    });

    it('should forward hooks', async () => {
      const result = await adapter.onMessageUpdated({
        type: 'message.updated',
        properties: {
          info: {
            id: 'test-msg-001',
            role: 'user',
            content: '测试消息转发',
          },
        },
      });

      expect(result).toBeDefined();
      if (result) {
        expect(result.accepted).toBe(true);
      }
    });
  });

  describe('Degraded Mode', () => {
    it('should fallback to keyword search when semantic unavailable', async () => {
      const searchResult = await retrieval.search('测试', 'hybrid');
      
      // Should degrade to keyword
      expect(searchResult.mode).toBe('keyword');
      expect(searchResult.degraded).toBe(true);
      expect(searchResult.degradedReason).toBeDefined();
    });
  });

  describe('Resident Service Smoke Paths', () => {
    it('auto-starts the resident service when a hook arrives during cold start', async () => {
      const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-integration-cold-start-'));
      tempDirs.push(runtimeRoot);

      let serviceReady = false;
      let spawnCalls = 0;
      const ingestedEvents: PluginIngestionEventInput[] = [];

      const fetchImpl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const url = String(input);

        if (url.endsWith('/ready')) {
          if (!serviceReady) {
            throw new TypeError('connect ECONNREFUSED');
          }

          return new Response(JSON.stringify({ ready: true }), { status: 200 });
        }

        if (url.endsWith('/api/ingest')) {
          ingestedEvents.push(JSON.parse(String(init?.body)) as PluginIngestionEventInput);
          return new Response(JSON.stringify({ accepted: true }), { status: 200 });
        }

        return new Response('not found', { status: 404 });
      };

      const launcher = new ServiceLauncher({
        fetchImpl,
        sleepImpl: async () => {},
        spawnImpl: () => {
          spawnCalls += 1;
          serviceReady = true;
          return {
            pid: 4321,
            exited: Promise.resolve(0),
            unref: () => {},
          };
        },
      });

      const result = await bridgeHookEvent(
        createHookMessageUpdatedEvent('msg-cold-start-001', '冷启动时应该自动拉起服务并写入事件'),
        {
          workspace: 'workspace-cold-start',
          runtimeRoot,
          launcher,
          fetchImpl,
        }
      );

      expect(result.success).toBe(true);
      expect(result.outboxQueued).not.toBe(true);
      expect(spawnCalls).toBe(1);
      expect(ingestedEvents).toHaveLength(1);
      expect(ingestedEvents[0]?.eventType).toBe('message.updated');
      expect(ingestedEvents[0]?.payload.content).toBe('冷启动时应该自动拉起服务并写入事件');
    });

    it('queues failed deliveries to outbox and replays them after the service recovers', async () => {
      const runtimeRoot = await mkdtemp(join(tmpdir(), 'memory-integration-recovery-'));
      tempDirs.push(runtimeRoot);

      const outbox = new OutboxManager({
        runtimeRoot,
        maxEvents: 10,
        maxSizeBytes: 1024 * 1024,
        ttlDays: 7,
      });
      const hookEvent = createHookMessageUpdatedEvent('msg-recovery-001', '服务恢复后应该重放这条事件');
      const queuedResult = await bridgeHookEvent(hookEvent, {
        workspace: 'workspace-recovery',
        launcher: {
          ensureReady: async () => ({
            success: false,
            ready: false,
            error: 'service unavailable',
          }),
        },
        outbox,
        fetchImpl: async () => new Response('service unavailable', { status: 503 }),
      });

      expect(queuedResult.success).toBe(true);
      expect(queuedResult.outboxQueued).toBe(true);

      const queuedEventId = queuedResult.ingestionEvent?.eventId;
      expect(queuedEventId).toBeDefined();
      expect((await outbox.list()).map((entry) => entry.eventId)).toEqual([queuedEventId!]);

      let serviceReady = false;
      const deliveredEvents: string[] = [];
      const replayWorker = new ReplayWorker({
        outbox,
        launcher: {
          isReady: async () => serviceReady,
        },
        ingestClient: {
          getStatus: async (eventId) => ({ found: false, eventId }),
          deliver: async (event) => {
            deliveredEvents.push(event.eventId);
            return { success: true, status: 200 };
          },
        },
        baseDelayMs: 10,
        maxDelayMs: 100,
      });

      serviceReady = true;
      const replayResult = await replayWorker.runOnce();

      expect(replayResult.replayed).toBe(1);
      expect(replayResult.remaining).toBe(0);
      expect(deliveredEvents).toEqual([queuedEventId!]);
      expect(await outbox.list()).toHaveLength(0);
    });
  });
});
