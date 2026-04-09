import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { ClassificationService } from '../classifier/service.ts';
import { RetrievalService } from '../retrieval/service.ts';
import { SQLiteIngestionRepository, SQLiteMemoryRepository } from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('Classification activation flow', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let ingestionRepo: SQLiteIngestionRepository;
  let classifier: ClassificationService;
  let retrieval: RetrievalService;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    ingestionRepo = new SQLiteIngestionRepository(db);
    classifier = new ClassificationService(memoryRepo, ingestionRepo);
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

    const searchResult = await retrieval.search('空格缩进', 'keyword');
    expect(searchResult.results.length).toBeGreaterThan(0);
    expect(searchResult.results[0].memory.content).toContain('空格缩进');
  });
});
