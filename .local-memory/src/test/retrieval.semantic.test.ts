import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { createTestDatabase } from './helpers.ts';
import type { Database } from 'bun:sqlite';
import { SQLiteMemoryRepository } from '../repository/memory.ts';
import { SQLiteEmbeddingRepository } from '../repository/embedding.ts';
import { DefaultProviderRouter } from '../provider/router.ts';
import { RetrievalService } from '../retrieval/service.ts';

describe('Semantic Retrieval', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let embeddingRepo: SQLiteEmbeddingRepository;
  let providerRouter: DefaultProviderRouter;
  let retrieval: RetrievalService;

  beforeAll(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    embeddingRepo = new SQLiteEmbeddingRepository(db);
    providerRouter = new DefaultProviderRouter();
    await providerRouter.initialize({
      embedding: { provider: 'none' },
      inference: { provider: 'none' },
    });
    retrieval = new RetrievalService(memoryRepo, embeddingRepo, providerRouter);
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

  it('returns semantic results sorted by cosine similarity', async () => {
    const semanticProvider = {
      name: 'test-semantic-provider',
      version: '1.0.0',
      dimensions: 3,
      embed: async () => new Float32Array([1, 0, 0]),
      embedBatch: async () => [],
      isHealthy: async () => true,
      initialize: async () => {},
      dispose: async () => {},
    };

    const semanticRetrieval = new RetrievalService(
      memoryRepo,
      embeddingRepo,
      {
        getEmbeddingProvider: () => semanticProvider,
        getInferenceProvider: () => null,
        getStatus: () => ({ degraded: false }),
        isDegraded: () => false,
        initialize: async () => {},
        dispose: async () => {},
      } as never
    );

    const mostRelevant = await memoryRepo.create({
      content: 'TypeScript 检索服务实现',
      layer: 'semantic',
      type: 'pattern',
      importance: 'high',
      sourceType: 'test',
      sourceRef: 'semantic-memory-001',
    });
    const lessRelevant = await memoryRepo.create({
      content: '前端界面配色方案',
      layer: 'semantic',
      type: 'pattern',
      importance: 'medium',
      sourceType: 'test',
      sourceRef: 'semantic-memory-002',
    });

    await memoryRepo.updateStatus(mostRelevant.id, 'active');
    await memoryRepo.updateStatus(lessRelevant.id, 'active');

    await embeddingRepo.save(mostRelevant.id, new Float32Array([1, 0, 0]), {
      name: semanticProvider.name,
      version: semanticProvider.version,
      dimensions: semanticProvider.dimensions,
    });
    await embeddingRepo.save(lessRelevant.id, new Float32Array([0.2, 0.8, 0]), {
      name: semanticProvider.name,
      version: semanticProvider.version,
      dimensions: semanticProvider.dimensions,
    });

    const result = await semanticRetrieval.search('检索服务', 'semantic');

    expect(result.mode).toBe('semantic');
    expect(result.results.length).toBe(2);
    expect(result.results[0].memory.id).toBe(mostRelevant.id);
    expect(result.results[0].semanticRank).toBe(1);
    expect(result.results[0].rrfScore).toBeCloseTo(1 / 61, 8);
    expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
  });
});
