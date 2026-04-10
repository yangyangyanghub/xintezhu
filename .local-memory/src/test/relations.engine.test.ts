import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { RelationEngine } from '../relations/engine.ts';
import {
  SQLiteAuditRepository,
  SQLiteMemoryRepository,
} from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('RelationEngine management', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let auditRepo: SQLiteAuditRepository;
  let relationEngine: RelationEngine;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    auditRepo = new SQLiteAuditRepository(db);
    relationEngine = new RelationEngine(db, memoryRepo, auditRepo);
  });

  afterEach(() => {
    db.close();
  });

  it('creates a relation between two memories', async () => {
    const source = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '新的工作习惯记录',
      importance: 'medium',
      sourceEventId: 'evt-relation-create-001',
      workspace: 'test',
    });
    const target = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '旧的工作习惯记录',
      importance: 'medium',
      sourceEventId: 'evt-relation-create-002',
      workspace: 'test',
    });

    const relation = await relationEngine.createRelation(
      {
        sourceId: source.id,
        targetId: target.id,
        relationType: 'extends',
        confidence: 0.9,
      },
      { actor: 'test' }
    );

    expect(relation.sourceId).toBe(source.id);
    expect(relation.targetId).toBe(target.id);
    expect(relation.relationType).toBe('extends');
    expect(relation.status).toBe('active');

    const relations = await relationEngine.getRelationsFrom(source.id);
    expect(relations).toHaveLength(1);
    expect(relations[0].id).toBe(relation.id);
  });

  it('returns lineage for an updates chain', async () => {
    const original = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '版本一',
      importance: 'medium',
      sourceEventId: 'evt-relation-lineage-001',
      workspace: 'test',
    });
    const current = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '版本二',
      importance: 'medium',
      sourceEventId: 'evt-relation-lineage-002',
      workspace: 'test',
    });
    const latest = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '版本三',
      importance: 'medium',
      sourceEventId: 'evt-relation-lineage-003',
      workspace: 'test',
    });

    db.run('UPDATE memories SET created_at = ?, updated_at = ? WHERE id = ?', ['2026-04-01T00:00:00.000Z', '2026-04-01T00:00:00.000Z', original.id]);
    db.run('UPDATE memories SET created_at = ?, updated_at = ? WHERE id = ?', ['2026-04-02T00:00:00.000Z', '2026-04-02T00:00:00.000Z', current.id]);
    db.run('UPDATE memories SET created_at = ?, updated_at = ? WHERE id = ?', ['2026-04-03T00:00:00.000Z', '2026-04-03T00:00:00.000Z', latest.id]);

    await relationEngine.createRelation(
      {
        sourceId: current.id,
        targetId: original.id,
        relationType: 'updates',
      },
      { actor: 'test' }
    );
    await relationEngine.createRelation(
      {
        sourceId: latest.id,
        targetId: current.id,
        relationType: 'updates',
      },
      { actor: 'test' }
    );

    const lineage = await relationEngine.getLineage(current.id);

    expect(lineage.map(memory => memory.id)).toEqual([original.id, current.id, latest.id]);
  });

  it('deactivates a relation so it no longer appears in queries', async () => {
    const source = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '待停用关系的源记忆',
      importance: 'medium',
      sourceEventId: 'evt-relation-deactivate-001',
      workspace: 'test',
    });
    const target = await memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content: '待停用关系的目标记忆',
      importance: 'medium',
      sourceEventId: 'evt-relation-deactivate-002',
      workspace: 'test',
    });

    const relation = await relationEngine.createRelation(
      {
        sourceId: source.id,
        targetId: target.id,
        relationType: 'relates',
      },
      { actor: 'test' }
    );

    await relationEngine.deactivateRelation(relation.id, { actor: 'test' });

    const relations = await relationEngine.getRelationsFrom(source.id);
    expect(relations).toHaveLength(0);
  });
});
