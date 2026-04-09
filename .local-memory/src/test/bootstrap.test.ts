import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { MemoryCoreService } from '../service/core.ts';

const localMemoryRoot = resolve(import.meta.dir, '..', '..');

describe('MemoryCoreService bootstrap', () => {
  const originalCwd = process.cwd();
  const tempDirs: string[] = [];

  afterEach(async () => {
    process.chdir(originalCwd);

    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('throws when database is requested before initialization', () => {
    const service = new MemoryCoreService();

    expect(() => service.getDatabase()).toThrow('Database not initialized. Call initialize() first.');
  });

  it('initializes schema correctly even when started inside .local-memory', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'local-memory-bootstrap-'));
    tempDirs.push(tempRoot);

    const runtimeRoot = join(tempRoot, 'runtime');
    const databasePath = join(runtimeRoot, 'memory.db');
    const projectionRoot = join(tempRoot, 'projection');
    const service = new MemoryCoreService({
      runtimeRoot,
      databasePath,
      projectionRoot,
      enableProjection: true,
    });

    process.chdir(localMemoryRoot);

    try {
      await service.initialize();

      const db = service.getDatabase();
      const tables = db
        .query("SELECT name FROM sqlite_master WHERE type IN ('table', 'view')")
        .all() as Array<{ name: string }>;
      const tableNames = new Set(tables.map((table) => table.name));

      expect(existsSync(databasePath)).toBe(true);
      expect(tableNames.has('ingestion_events')).toBe(true);
      expect(tableNames.has('memories')).toBe(true);
      expect(tableNames.has('memories_fts')).toBe(true);

      const health = await service.health();
      expect(health.status).toBe('ok');
    } finally {
      await service.dispose();
    }
  });
});
