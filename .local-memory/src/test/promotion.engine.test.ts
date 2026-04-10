import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { PromotionEngine } from '../promotion/engine.ts';
import { RelationEngine } from '../relations/engine.ts';
import {
  SQLiteAuditRepository,
  SQLiteMemoryRepository,
  SQLitePromotionRepository,
} from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('PromotionEngine persistence', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let auditRepo: SQLiteAuditRepository;
  let promotionRepo: SQLitePromotionRepository;
  let relationEngine: RelationEngine;
  let promotionEngine: PromotionEngine;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    auditRepo = new SQLiteAuditRepository(db);
    promotionRepo = new SQLitePromotionRepository(db);
    relationEngine = new RelationEngine(db, memoryRepo, auditRepo);
    promotionEngine = new PromotionEngine(memoryRepo, auditRepo, promotionRepo, relationEngine);
  });

  afterEach(() => {
    db.close();
  });

  it('writes approved promotion records to memory_promotions', async () => {
    const memory = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '我会持续用测试保护 promotion 持久化逻辑',
      importance: 'high',
      sourceEventId: 'evt-promotion-001',
      workspace: 'test',
    });

    const result = await promotionEngine.promote(memory.id, { actor: 'test' }, true);
    expect(result.promoted).toBe(true);

    const promotions = await promotionRepo.findByMemoryId(memory.id);
    expect(promotions).toHaveLength(1);
    expect(promotions[0].memoryId).toBe(memory.id);
    expect(promotions[0].status).toBe('approved');
    expect(promotions[0].fromLayer).toBe('episodic');
    expect(promotions[0].toLayer).toBe('semantic');
  });
});
