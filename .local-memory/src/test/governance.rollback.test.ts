import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { ClassificationService } from '../classifier/service.ts';
import { GovernanceService } from '../governance/index.ts';
import {
  SQLiteAuditRepository,
  SQLiteIngestionRepository,
  SQLiteMemoryRepository,
} from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('Governance batch rollback', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let ingestionRepo: SQLiteIngestionRepository;
  let auditRepo: SQLiteAuditRepository;
  let classifier: ClassificationService;
  let governance: GovernanceService;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    ingestionRepo = new SQLiteIngestionRepository(db);
    auditRepo = new SQLiteAuditRepository(db);
    classifier = new ClassificationService(memoryRepo, ingestionRepo);
    governance = new GovernanceService(memoryRepo, auditRepo, ingestionRepo);
  });

  afterEach(() => {
    db.close();
  });

  it('rolls back memories created from the ingested batch', async () => {
    const batchId = 'batch-rollback-001';
    const event = await ingestionRepo.createEvent({
      eventId: 'evt-rollback-001',
      batchId,
      eventType: 'message.updated',
      sourceType: 'opencode',
      sourceRef: 'session-rollback-001',
      workspace: 'test',
      payload: {
        messageId: 'msg-rollback-001',
        role: 'user',
        content: '这是一条应该被整批回滚的记忆',
        importance: 'high',
      },
    });

    await classifier.classifyAndStore(event);

    const createdMemories = await memoryRepo.findByLayer('episodic');
    expect(createdMemories.length).toBe(1);

    const result = await governance.rollbackBatch(batchId, 'tester', 'rollback verification');
    expect(result.success).toBe(true);
    expect(result.rolledBackIds).toHaveLength(1);
    expect(result.rolledBackIds[0]).toBe(createdMemories[0].id);

    const revertedMemory = await memoryRepo.findById(createdMemories[0].id);
    expect(revertedMemory?.status).toBe('reverted');
  });
});
