import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProjectionEngine } from '../projection/engine.ts';
import { SQLiteAuditRepository, SQLiteMemoryRepository } from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('ProjectionEngine paths', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let auditRepo: SQLiteAuditRepository;
  let projectionRoot: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    auditRepo = new SQLiteAuditRepository(db);
    projectionRoot = await mkdtemp(join(tmpdir(), 'local-memory-projection-'));
  });

  afterEach(async () => {
    db.close();
    await rm(projectionRoot, { recursive: true, force: true });
  });

  it('writes singleton projections into the mapped core directory', async () => {
    const engine = new ProjectionEngine(memoryRepo, auditRepo, { projectionRoot });
    const created = await memoryRepo.create({
      layer: 'core',
      type: 'preference',
      content: '偏好使用 2 空格缩进',
      importance: 'high',
    });
    const active = await memoryRepo.update(created.id, { status: 'active' });

    await engine.projectMemory(active);

    expect(existsSync(join(projectionRoot, 'core', 'preferences.md'))).toBe(true);
    expect(existsSync(join(projectionRoot, 'preferences.md'))).toBe(false);
  });

  it('writes per-item projections without duplicating the .memory segment', async () => {
    const engine = new ProjectionEngine(memoryRepo, auditRepo, { projectionRoot });
    const created = await memoryRepo.create({
      layer: 'semantic',
      type: 'project',
      content: '本地记忆系统项目上下文',
      importance: 'medium',
    });
    const active = await memoryRepo.update(created.id, { status: 'active' });

    await engine.projectMemory(active);

    const expectedDir = join(projectionRoot, 'semantic', 'projects');
    const wrongDir = join(projectionRoot, '.memory', 'semantic', 'projects');

    expect(existsSync(expectedDir)).toBe(true);
    expect(existsSync(wrongDir)).toBe(false);
  });

  it('returns structured rebuild report from projection engine', async () => {
    const engine = new ProjectionEngine(memoryRepo, auditRepo, { projectionRoot });

    const coreMemory = await memoryRepo.create({
      layer: 'core',
      type: 'preference',
      content: '测试重建返回结构',
      importance: 'high',
    });
    await memoryRepo.update(coreMemory.id, { status: 'active' });

    const semanticMemory = await memoryRepo.create({
      layer: 'semantic',
      type: 'project',
      content: '测试语义投影重建结果',
      importance: 'medium',
    });
    await memoryRepo.update(semanticMemory.id, { status: 'active' });

    const result = await engine.rebuild({ actor: 'test' });

    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.core).toBeGreaterThanOrEqual(0);
    expect(result.summary.semantic).toBeGreaterThanOrEqual(0);
    expect(result.summary.total).toBeGreaterThanOrEqual(0);
    expect(result.errors).toBeInstanceOf(Array);
    expect(result.errors).toHaveLength(0);
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });
});
