import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ServiceHealth, HealthCheck } from '../types/index.ts';

export interface MemoryCoreConfig {
  runtimeRoot: string;
  databasePath: string;
  enableProjection: boolean;
  projectionRoot: string;
}

export const DEFAULT_CONFIG: MemoryCoreConfig = {
  runtimeRoot: '.local-memory',
  databasePath: '.local-memory/memory.db',
  enableProjection: true,
  projectionRoot: '.memory',
};

export class MemoryCoreService {
  private db: Database | null = null;
  private config: MemoryCoreConfig;
  private initialized = false;

  constructor(config: Partial<MemoryCoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure runtime directories exist
    this.ensureDirectories();

    // Initialize database
    this.db = new Database(this.config.databasePath);
    this.db.run('PRAGMA foreign_keys = ON');

    // Run migrations
    await this.runMigrations();

    this.initialized = true;
    console.log('[MemoryCore] Service initialized');
  }

  async health(): Promise<ServiceHealth> {
    const checks = {
      database: await this.checkDatabase(),
      projection: await this.checkProjection(),
    };

    const allOk = Object.values(checks).every(c => c.status === 'ok');
    const anyError = Object.values(checks).some(c => c.status === 'error');

    return {
      status: anyError ? 'error' : allOk ? 'ok' : 'degraded',
      localOnly: true,
      runtimeRoot: this.config.runtimeRoot,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  getConfig(): MemoryCoreConfig {
    return this.config;
  }

  async dispose(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initialized = false;
  }

  private ensureDirectories(): void {
    const dirs = [
      this.config.runtimeRoot,
      join(this.config.runtimeRoot, 'logs'),
      join(this.config.runtimeRoot, 'cache'),
    ];

    if (this.config.enableProjection) {
      dirs.push(this.config.projectionRoot);
    }

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    // Create schema version table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);

    // Get current version
    const result = this.db.query('SELECT MAX(version) as version FROM schema_migrations').get() as { version: number | null };
    const currentVersion = result?.version || 0;

    if (currentVersion < 1) {
      await this.migrationV1();
      this.db.run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [1, new Date().toISOString()]);
    }

    console.log(`[MemoryCore] Database at version ${currentVersion}`);
  }

  private async migrationV1(): Promise<void> {
    if (!this.db) return;

    // Read and execute schema
    const schemaPath = resolve(import.meta.dir, '..', '..', 'schema', 'v1-database.sql');
    if (existsSync(schemaPath)) {
      const schema = await Bun.file(schemaPath).text();

      this.db.exec(schema);
    }

    console.log('[MemoryCore] Applied migration V1');
  }

  private async checkDatabase(): Promise<HealthCheck> {
    if (!this.db) {
      return { status: 'error', message: 'Database not initialized' };
    }

    try {
      const start = performance.now();
      this.db.query('SELECT 1').get();
      const latency = performance.now() - start;
      return { status: 'ok', latency };
    } catch (e) {
      return { status: 'error', message: `Database error: ${e}` };
    }
  }

  private async checkProjection(): Promise<HealthCheck> {
    if (!this.config.enableProjection) {
      return { status: 'ok', message: 'Projection disabled' };
    }

    try {
      // Check if projection directory is writable
      const testFile = join(this.config.projectionRoot, '.health');
      await Bun.write(testFile, '');
      await Bun.file(testFile).delete();
      return { status: 'ok' };
    } catch (e) {
      return { status: 'warning', message: `Projection not writable: ${e}` };
    }
  }
}

// Singleton instance
let serviceInstance: MemoryCoreService | null = null;

export function getService(): MemoryCoreService {
  if (!serviceInstance) {
    serviceInstance = new MemoryCoreService();
  }
  return serviceInstance;
}

export function resetService(): void {
  serviceInstance = null;
}
