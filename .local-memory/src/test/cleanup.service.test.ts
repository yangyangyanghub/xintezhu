import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CleanupService } from '../cleanup/service.ts';
import { ProjectionEngine } from '../projection/engine.ts';
import { SQLiteAuditRepository, SQLiteMemoryRepository } from '../repository/index.ts';
import { createTestDatabase } from './helpers.ts';

describe('CleanupService contracts', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let auditRepo: SQLiteAuditRepository;
  let projectionRoot: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    memoryRepo = new SQLiteMemoryRepository(db);
    auditRepo = new SQLiteAuditRepository(db);
    projectionRoot = await mkdtemp(join(tmpdir(), 'local-memory-cleanup-'));
  });

  afterEach(async () => {
    db.close();
    await rm(projectionRoot, { recursive: true, force: true });
  });

  it('returns structured cleanup report', async () => {
    const projectionEngine = new ProjectionEngine(memoryRepo, auditRepo, { projectionRoot });
    const cleanupService = new CleanupService(db, memoryRepo, auditRepo, projectionEngine, {
      dryRun: true,
    });

    const report = await cleanupService.runFullCleanup({ actor: 'test' });

    expect(report.timestamp).toBeDefined();
    expect(report.results).toBeInstanceOf(Array);
    expect(report.results.length).toBeGreaterThan(0);
    for (const result of report.results) {
      expect(result.task).toBeDefined();
      expect(result.processed).toBeGreaterThanOrEqual(0);
      expect(result.archived).toBeGreaterThanOrEqual(0);
      expect(result.deleted).toBeGreaterThanOrEqual(0);
      expect(result.errors).toBeInstanceOf(Array);
    }
    expect(report.totalProcessed).toBeGreaterThanOrEqual(0);
    expect(report.totalArchived).toBeGreaterThanOrEqual(0);
    expect(report.totalDeleted).toBeGreaterThanOrEqual(0);
    expect(report.duration).toBeGreaterThanOrEqual(0);
  });
});
