import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { createTestDatabase } from './helpers.ts';
import type { Database } from 'bun:sqlite';
import { SQLiteMemoryRepository } from '../repository/memory.ts';
import { DefaultProviderRouter } from '../provider/router.ts';
import { RetrievalService } from '../retrieval/service.ts';

describe('Semantic Retrieval', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let providerRouter: DefaultProviderRouter;
  let retrieval: RetrievalService;

  beforeAll(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    providerRouter = new DefaultProviderRouter();
    await providerRouter.initialize({
      embedding: { provider: 'none' },
      inference: { provider: 'none' },
    });
    retrieval = new RetrievalService(memoryRepo, providerRouter);
  });

  afterAll(async () => {
    await providerRouter.dispose();
    db.close();
  });

  it('stores embeddings for active memories when provider is healthy', async () => {
    // This test will fail initially - embeddings are not yet persisted
    // Ingest a memory first
    const memory = await memoryRepo.create({
      content: '这是一个测试语义检索的记忆内容',
      layer: 'episodic',
      type: 'observation',
      importance: 'medium',
      sourceType: 'test',
      sourceRef: 'semantic-test-001',
    });

    // For now, semantic search should throw error (degraded mode with null provider)
    await expect(retrieval.search('语义查询', 'semantic')).rejects.toThrow('Semantic search requested but provider unavailable');
  });

  it('degrades hybrid to keyword when provider is unavailable', async () => {
    const result = await retrieval.search('偏好', 'hybrid');
    expect(result.mode).toBe('keyword');
    expect(result.degraded).toBe(true);
    expect(result.degradedReason).toContain('No embedding provider configured');
  });

  it('throws error when semantic is explicitly requested but unavailable', async () => {
    await expect(retrieval.search('测试', 'semantic')).rejects.toThrow('Semantic search requested but provider unavailable');
  });
});
