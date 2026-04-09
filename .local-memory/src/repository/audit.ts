import { Database } from 'bun:sqlite';
import type { AuditRecord, AuditActionType, AuditContext } from '../types/index.ts';

export interface AuditRepository {
  record(action: AuditActionType, entityType: string, entityId: string, payload: unknown, context: AuditContext, previousState?: unknown): Promise<AuditRecord>;
  findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]>;
  findByBatch(batchId: string): Promise<AuditRecord[]>;
}

export class SQLiteAuditRepository implements AuditRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async record(
    action: AuditActionType,
    entityType: string,
    entityId: string,
    payload: unknown,
    context: AuditContext,
    previousState?: unknown
  ): Promise<AuditRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record: AuditRecord = {
      id,
      actionType: action,
      entityType,
      entityId,
      actor: context.actor,
      payload: payload as Record<string, unknown> | null,
      previousState: previousState as Record<string, unknown> | null,
      batchId: context.batchId || null,
      createdAt: now,
    };

    this.db.run(
      `INSERT INTO audit_log (id, action_type, entity_type, entity_id, actor, payload, previous_state, batch_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, action, entityType, entityId, context.actor,
       JSON.stringify(payload), 
       previousState ? JSON.stringify(previousState) : null,
       context.batchId || null, now]
    );

    return record;
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]> {
    const rows = this.db.query(
      'SELECT * FROM audit_log WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC'
    ).all(entityType, entityId) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToRecord(row));
  }

  async findByBatch(batchId: string): Promise<AuditRecord[]> {
    const rows = this.db.query(
      'SELECT * FROM audit_log WHERE batch_id = ? ORDER BY created_at DESC'
    ).all(batchId) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToRecord(row));
  }

  private mapRowToRecord(row: Record<string, unknown>): AuditRecord {
    return {
      id: row.id as string,
      actionType: row.action_type as AuditActionType,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      actor: row.actor as string,
      payload: row.payload ? JSON.parse(row.payload as string) : null,
      previousState: row.previous_state ? JSON.parse(row.previous_state as string) : null,
      batchId: row.batch_id as string | null,
      createdAt: row.created_at as string,
    };
  }
}
