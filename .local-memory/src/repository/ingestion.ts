import { Database } from 'bun:sqlite';
import type { IngestionEvent, IngestionEventInput, ErrorDetail, IngestionStatus } from '../types/index.ts';

export interface IngestionRepository {
  createEvent(event: IngestionEventInput): Promise<IngestionEvent>;
  findByBatch(batchId: string): Promise<IngestionEvent[]>;
  findById(id: string): Promise<IngestionEvent | null>;
  updateStatus(id: string, status: IngestionStatus, error?: ErrorDetail): Promise<void>;
  markProcessed(id: string, memoryId?: string): Promise<void>;
  findPending(limit?: number): Promise<IngestionEvent[]>;
}

export class SQLiteIngestionRepository implements IngestionRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createEvent(input: IngestionEventInput): Promise<IngestionEvent> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const payloadStr = JSON.stringify(input.payload);
    const payloadHash = await this.hashString(payloadStr);

    const event: IngestionEvent = {
      id,
      eventId: input.eventId,
      batchId: input.batchId,
      eventType: input.eventType,
      sourceType: input.sourceType,
      sourceRef: input.sourceRef,
      workspace: input.workspace || null,
      payload: input.payload,
      payloadHash,
      status: 'pending',
      error: null,
      processedAt: null,
      createdAt: now,
    };

    this.db.run(
      `INSERT INTO ingestion_events (id, event_id, batch_id, event_type, source_type, source_ref,
       workspace, payload, payload_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, event.eventId, event.batchId, event.eventType, event.sourceType, event.sourceRef,
       event.workspace, payloadStr, payloadHash, event.status, event.createdAt]
    );

    return event;
  }

  async findByBatch(batchId: string): Promise<IngestionEvent[]> {
    const rows = this.db.query(
      'SELECT * FROM ingestion_events WHERE batch_id = ? ORDER BY created_at'
    ).all(batchId) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  async findById(id: string): Promise<IngestionEvent | null> {
    const row = this.db.query('SELECT * FROM ingestion_events WHERE id = ?').get(id) as Record<string, unknown> | null;
    return row ? this.mapRowToEvent(row) : null;
  }

  async updateStatus(id: string, status: IngestionStatus, error?: ErrorDetail): Promise<void> {
    const errorStr = error ? JSON.stringify(error) : null;
    
    this.db.run(
      'UPDATE ingestion_events SET status = ?, error = ? WHERE id = ?',
      [status, errorStr, id]
    );
  }

  async markProcessed(id: string, memoryId?: string): Promise<void> {
    const now = new Date().toISOString();
    
    this.db.run(
      'UPDATE ingestion_events SET status = ?, processed_at = ? WHERE id = ?',
      ['processed', now, id]
    );
  }

  async findPending(limit: number = 100): Promise<IngestionEvent[]> {
    const rows = this.db.query(
      'SELECT * FROM ingestion_events WHERE status = ? ORDER BY created_at LIMIT ?'
    ).all('pending', limit) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToEvent(row));
  }

  private mapRowToEvent(row: Record<string, unknown>): IngestionEvent {
    return {
      id: row.id as string,
      eventId: row.event_id as string,
      batchId: row.batch_id as string,
      eventType: row.event_type as string,
      sourceType: row.source_type as string,
      sourceRef: row.source_ref as string,
      workspace: row.workspace as string | null,
      payload: JSON.parse(row.payload as string),
      payloadHash: row.payload_hash as string,
      status: row.status as IngestionStatus,
      error: row.error ? JSON.parse(row.error as string) : null,
      processedAt: row.processed_at as string | null,
      createdAt: row.created_at as string,
    };
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
