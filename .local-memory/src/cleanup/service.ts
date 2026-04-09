import { Database } from 'bun:sqlite';
import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { ProjectionEngine } from '../projection/engine.ts';
import type { MemoryLayer, MemoryStatus, AuditContext } from '../types/index.ts';

interface CleanupConfig {
  episodicRetentionDays: number;
  importantRetentionDays: number;
  workingRetentionHours: number;
  auditRetentionDays: number;
  embeddingRetentionDays: number;
  enableDecay: boolean;
  enableAuditCleanup: boolean;
  dryRun: boolean;
}

const DEFAULT_CONFIG: CleanupConfig = {
  episodicRetentionDays: 7,
  importantRetentionDays: 30,
  workingRetentionHours: 24,
  auditRetentionDays: 90,
  embeddingRetentionDays: 30,
  enableDecay: true,
  enableAuditCleanup: true,
  dryRun: false,
};

export interface CleanupResult {
  task: string;
  processed: number;
  archived: number;
  deleted: number;
  errors: string[];
}

export interface CleanupReport {
  timestamp: string;
  results: CleanupResult[];
  totalProcessed: number;
  totalArchived: number;
  totalDeleted: number;
  duration: number;
}

export class CleanupService {
  private db: Database;
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;
  private projectionEngine: ProjectionEngine;
  private config: CleanupConfig;

  constructor(
    db: Database,
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    projectionEngine: ProjectionEngine,
    config: Partial<CleanupConfig> = {}
  ) {
    this.db = db;
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.projectionEngine = projectionEngine;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async runFullCleanup(context?: AuditContext): Promise<CleanupReport> {
    const startTime = performance.now();
    const results: CleanupResult[] = [];

    console.log('[CleanupService] Starting full cleanup...');

    // Run each cleanup task
    results.push(await this.decayEpisodic(context));
    results.push(await this.cleanupWorking(context));
    results.push(await this.cleanupEmbeddings(context));
    results.push(await this.repairOrphanedRelations(context));
    results.push(await this.cleanupStaleProjection(context));

    if (this.config.enableAuditCleanup) {
      results.push(await this.archiveOldAudit(context));
    }

    const duration = performance.now() - startTime;
    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    const totalArchived = results.reduce((sum, r) => sum + r.archived, 0);
    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);

    const report: CleanupReport = {
      timestamp: new Date().toISOString(),
      results,
      totalProcessed,
      totalArchived,
      totalDeleted,
      duration,
    };

    console.log(`[CleanupService] Cleanup complete: ${totalProcessed} processed, ` +
      `${totalArchived} archived, ${totalDeleted} deleted`);

    return report;
  }

  async decayEpisodic(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'decay_episodic',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    if (!this.config.enableDecay) {
      console.log('[CleanupService] Episodic decay disabled');
      return result;
    }

    try {
      // Calculate cutoff dates
      const now = new Date();
      const normalCutoff = new Date(now.getTime() - this.config.episodicRetentionDays * 24 * 60 * 60 * 1000);
      const importantCutoff = new Date(now.getTime() - this.config.importantRetentionDays * 24 * 60 * 60 * 1000);

      // Find expired episodic memories
      const episodicMemories = await this.memoryRepo.findByLayer('episodic', 'active');

      for (const memory of episodicMemories) {
        result.processed++;

        const cutoff = memory.importance === 'high' ? importantCutoff : normalCutoff;
        const memoryDate = new Date(memory.createdAt);

        if (memoryDate < cutoff) {
          try {
            if (!this.config.dryRun) {
              // Archive the memory (soft delete)
              await this.memoryRepo.updateStatus(memory.id, 'archived');

              // Remove projection if exists
              await this.projectionEngine.removeProjection(memory.id, context);

              // Audit
              if (context) {
                await this.auditRepo.record(
                  'update',
                  'memory',
                  memory.id,
                  { action: 'archive', reason: 'retention_policy', age: memoryDate.toISOString() },
                  context
                );
              }
            }

            result.archived++;
            console.log(`[CleanupService] Archived episodic memory: ${memory.id}`);
          } catch (error) {
            result.errors.push(`Failed to archive ${memory.id}: ${error}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Decay episodic failed: ${error}`);
    }

    return result;
  }

  async cleanupWorking(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'cleanup_working',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    try {
      const cutoff = new Date(Date.now() - this.config.workingRetentionHours * 60 * 60 * 1000);
      
      // Find old working memories
      const workingMemories = await this.memoryRepo.findByLayer('working', 'active');

      for (const memory of workingMemories) {
        result.processed++;

        const memoryDate = new Date(memory.createdAt);
        if (memoryDate < cutoff) {
          try {
            if (!this.config.dryRun) {
              await this.memoryRepo.updateStatus(memory.id, 'archived');

              if (context) {
                await this.auditRepo.record(
                  'update',
                  'memory',
                  memory.id,
                  { action: 'archive', reason: 'working_cleanup', age: memoryDate.toISOString() },
                  context
                );
              }
            }

            result.archived++;
          } catch (error) {
            result.errors.push(`Failed to cleanup working memory ${memory.id}: ${error}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Cleanup working failed: ${error}`);
    }

    return result;
  }

  async cleanupEmbeddings(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'cleanup_embeddings',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    try {
      // Remove embeddings for archived/forgotten memories
      const cutoff = new Date(Date.now() - this.config.embeddingRetentionDays * 24 * 60 * 60 * 1000);

      const rows = this.db.query(
        `SELECT e.id, e.memory_id FROM embeddings e
         JOIN memories m ON e.memory_id = m.id
         WHERE m.status IN ('archived', 'forgotten', 'reverted')
         AND m.updated_at < ?`
      ).all(cutoff.toISOString()) as { id: string; memory_id: string }[];

      for (const row of rows) {
        result.processed++;

        try {
          if (!this.config.dryRun) {
            this.db.run('DELETE FROM embeddings WHERE id = ?', [row.id]);

            if (context) {
              await this.auditRepo.record(
                'delete',
                'embedding',
                row.id,
                { memoryId: row.memory_id, reason: 'stale_cleanup' },
                context
              );
            }
          }

          result.deleted++;
        } catch (error) {
          result.errors.push(`Failed to delete embedding ${row.id}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Cleanup embeddings failed: ${error}`);
    }

    return result;
  }

  async repairOrphanedRelations(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'repair_orphaned_relations',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    try {
      // Find relations pointing to archived/forgotten targets
      const rows = this.db.query(
        `SELECT r.id, r.source_id, r.target_id FROM memory_relations r
         JOIN memories m ON r.target_id = m.id
         WHERE m.status IN ('archived', 'forgotten', 'reverted')
         AND r.status = 'active'`
      ).all() as { id: string; source_id: string; target_id: string }[];

      for (const row of rows) {
        result.processed++;

        try {
          if (!this.config.dryRun) {
            // Deactivate the relation
            this.db.run(
              'UPDATE memory_relations SET status = ? WHERE id = ?',
              ['inactive', row.id]
            );

            if (context) {
              await this.auditRepo.record(
                'update',
                'memory_relation',
                row.id,
                { action: 'deactivate', reason: 'orphaned_target', targetId: row.target_id },
                context
              );
            }
          }

          result.archived++;
        } catch (error) {
          result.errors.push(`Failed to deactivate relation ${row.id}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Repair orphaned relations failed: ${error}`);
    }

    return result;
  }

  async cleanupStaleProjection(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'cleanup_stale_projection',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    try {
      // Find memories that should not have projection
      const nonActiveMemories = await this.memoryRepo.findByLayer('core');
      nonActiveMemories.push(...await this.memoryRepo.findByLayer('semantic'));

      // Filter to non-active status
      const toCleanup = nonActiveMemories.filter(m => 
        m.status !== 'active' && m.status !== 'new'
      );

      for (const memory of toCleanup) {
        result.processed++;

        try {
          if (!this.config.dryRun) {
            await this.projectionEngine.removeProjection(memory.id, context);
          }

          result.deleted++;
        } catch (error) {
          result.errors.push(`Failed to remove projection for ${memory.id}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Cleanup stale projection failed: ${error}`);
    }

    return result;
  }

  async archiveOldAudit(context?: AuditContext): Promise<CleanupResult> {
    const result: CleanupResult = {
      task: 'archive_old_audit',
      processed: 0,
      archived: 0,
      deleted: 0,
      errors: [],
    };

    if (!this.config.enableAuditCleanup) {
      return result;
    }

    try {
      const cutoff = new Date(Date.now() - this.config.auditRetentionDays * 24 * 60 * 60 * 1000);

      // Note: In real implementation, might move to archive table
      // For now, we keep all audit - it's too important
      // This is a placeholder that logs what would be archived

      const count = this.db.query(
        'SELECT COUNT(*) as count FROM audit_log WHERE created_at < ?'
      ).get(cutoff.toISOString()) as { count: number };

      if (count.count > 0) {
        console.log(`[CleanupService] Found ${count.count} old audit records (kept for compliance)`);
        result.processed = count.count;
      }
    } catch (error) {
      result.errors.push(`Archive old audit failed: ${error}`);
    }

    return result;
  }

  // Manual cleanup helpers

  async cleanupMemory(memoryId: string, context: AuditContext): Promise<void> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Remove projection
    await this.projectionEngine.removeProjection(memoryId, context);

    // Remove embeddings
    this.db.run('DELETE FROM embeddings WHERE memory_id = ?', [memoryId]);

    // Deactivate relations
    this.db.run(
      'UPDATE memory_relations SET status = ? WHERE source_id = ? OR target_id = ?',
      ['inactive', memoryId, memoryId]
    );

    console.log(`[CleanupService] Manual cleanup for memory ${memoryId}`);
  }
}
