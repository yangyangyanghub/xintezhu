import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { ClassificationService } from '../classifier/service.ts';
import type { ProviderRouter } from '../provider/router.ts';
import { RetrievalService } from '../retrieval/service.ts';
import { SQLiteEmbeddingRepository, SQLiteIngestionRepository, SQLiteMemoryRepository } from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('Classification activation flow', () => {
  let db: Database;
  let embeddingRepo: SQLiteEmbeddingRepository;
  let memoryRepo: SQLiteMemoryRepository;
  let ingestionRepo: SQLiteIngestionRepository;
  let classifier: ClassificationService;
  let retrieval: RetrievalService;
  let embedCalls: string[];
  let embeddingProvider: {
    name: string;
    version: string;
    dimensions: number;
    embed: (text: string) => Promise<Float32Array>;
    embedBatch: (texts: string[]) => Promise<Float32Array[]>;
    isHealthy: () => Promise<boolean>;
    initialize: () => Promise<void>;
    dispose: () => Promise<void>;
  };
  let providerRouter: ProviderRouter;

  beforeEach(async () => {
    db = await createTestDatabase();
    embeddingRepo = new SQLiteEmbeddingRepository(db);
    memoryRepo = new SQLiteMemoryRepository(db);
    ingestionRepo = new SQLiteIngestionRepository(db);
    embedCalls = [];
    embeddingProvider = {
      name: 'test-embedder',
      version: '1.2.3',
      dimensions: 3,
      embed: async (text: string) => {
        embedCalls.push(text);
        return new Float32Array([0.1, 0.2, 0.3]);
      },
      embedBatch: async () => [],
      isHealthy: async () => true,
      initialize: async () => {},
      dispose: async () => {},
    };
    providerRouter = {
      getEmbeddingProvider: () => embeddingProvider,
      getInferenceProvider: () => null,
      getStatus: () => ({
        embedding: { available: true, provider: embeddingProvider.name },
        inference: { available: false, provider: 'none' },
        degraded: false,
      }),
      isDegraded: () => false,
      initialize: async () => {},
      dispose: async () => {},
    };
    classifier = new ClassificationService(memoryRepo, ingestionRepo, embeddingRepo, providerRouter);
    retrieval = new RetrievalService(memoryRepo, {
      getEmbeddingProvider: () => null,
      getInferenceProvider: () => null,
      getStatus: () => ({ degraded: true, degradedReason: 'keyword only' }),
      isDegraded: () => true,
      initialize: async () => {},
      dispose: async () => {},
    } as never);
  });

  afterEach(() => {
    db.close();
  });

  it('stores worth-keeping memories as active and immediately retrievable', async () => {
    const event = await ingestionRepo.createEvent({
      eventId: 'evt-activation-001',
      batchId: 'batch-activation-001',
      eventType: 'message.updated',
      sourceType: 'opencode',
      sourceRef: 'session-activation-001',
      workspace: 'test',
      payload: {
        messageId: 'msg-activation-001',
        role: 'user',
        content: '我喜欢使用2空格缩进，这是必须长期保持的习惯',
        importance: 'high',
      },
    });

    await classifier.classifyAndStore(event);

    const storedMemories = await memoryRepo.findByLayer('episodic');
    expect(storedMemories.length).toBe(1);
    expect(storedMemories[0].status).toBe('active');
    expect(embedCalls).toEqual([storedMemories[0].content]);

    const storedEmbedding = await embeddingRepo.findByMemory(storedMemories[0].id);
    expect(storedEmbedding).not.toBeNull();
    expect(storedEmbedding?.modelName).toBe('test-embedder');
    expect(storedEmbedding?.modelVersion).toBe('1.2.3');
    expect(storedEmbedding?.dimensions).toBe(3);

    const searchResult = await retrieval.search('空格缩进', 'keyword');
    expect(searchResult.results.length).toBeGreaterThan(0);
    expect(searchResult.results[0].memory.content).toContain('空格缩进');
  });

  it('keeps classification successful when embedding generation fails', async () => {
    embeddingProvider.embed = async () => {
      throw new Error('embedding failed');
    };

    const event = await ingestionRepo.createEvent({
      eventId: 'evt-activation-002',
      batchId: 'batch-activation-002',
      eventType: 'message.updated',
      sourceType: 'opencode',
      sourceRef: 'session-activation-002',
      workspace: 'test',
      payload: {
        messageId: 'msg-activation-002',
        role: 'user',
        content: '我喜欢把技术规范写清楚，这个习惯需要长期保留',
        importance: 'high',
      },
    });

    await classifier.classifyAndStore(event);

    const storedMemories = await memoryRepo.findByLayer('episodic');
    expect(storedMemories.length).toBe(1);
    expect(storedMemories[0].status).toBe('active');

    const storedEvent = await ingestionRepo.findById(event.id);
    expect(storedEvent?.status).toBe('processed');

    const storedEmbedding = await embeddingRepo.findByMemory(storedMemories[0].id);
    expect(storedEmbedding).toBeNull();
  });
});
