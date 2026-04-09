import { Database } from 'bun:sqlite';
import type { Memory, CreateMemoryInput, UpdateMemoryInput, MemoryLayer, MemoryType, MemoryStatus, ImportanceLevel, SearchFilters, QueryOptions } from '../types/index.ts';

export interface MemoryRepository {
  create(input: CreateMemoryInput): Promise<Memory>;
  findById(id: string): Promise<Memory | null>;
  findBySourceEventId(sourceEventId: string): Promise<Memory | null>;
  findByLayer(layer: MemoryLayer, status?: MemoryStatus): Promise<Memory[]>;
  findByType(type: MemoryType, options?: QueryOptions): Promise<Memory[]>;
  searchByKeyword(query: string, filters?: SearchFilters, options?: QueryOptions): Promise<Memory[]>;
  update(id: string, updates: UpdateMemoryInput): Promise<Memory>;
  updateStatus(id: string, status: MemoryStatus): Promise<Memory>;
  markForgotten(id: string, reason: string): Promise<Memory>;
}

export class SQLiteMemoryRepository implements MemoryRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(input: CreateMemoryInput): Promise<Memory> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const contentHash = await this.hashContent(input.content);

    const memory: Memory = {
      id,
      version: 1,
      parentId: null,
      layer: input.layer,
      type: input.type,
      status: 'new',
      content: input.content,
      contentHash,
      confidence: 0,
      importance: input.importance || 'medium',
      sourceEventId: input.sourceEventId || null,
      workspace: input.workspace || null,
      createdAt: now,
      updatedAt: now,
      expiresAt: input.expiresAt || null,
    };

    this.db.run(
      `INSERT INTO memories (id, version, layer, type, status, content, content_hash, 
       confidence, importance, source_event_id, workspace, created_at, updated_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [memory.id, memory.version, memory.layer, memory.type, memory.status, memory.content,
       memory.contentHash, memory.confidence, memory.importance, memory.sourceEventId,
       memory.workspace, memory.createdAt, memory.updatedAt, memory.expiresAt]
    );

    return memory;
  }

  async findById(id: string): Promise<Memory | null> {
    const row = this.db.query('SELECT * FROM memories WHERE id = ?').get(id) as Record<string, unknown> | null;
    return row ? this.mapRowToMemory(row) : null;
  }

  async findBySourceEventId(sourceEventId: string): Promise<Memory | null> {
    const row = this.db.query('SELECT * FROM memories WHERE source_event_id = ?').get(sourceEventId) as Record<string, unknown> | null;
    return row ? this.mapRowToMemory(row) : null;
  }

  async findByLayer(layer: MemoryLayer, status?: MemoryStatus): Promise<Memory[]> {
    let sql = 'SELECT * FROM memories WHERE layer = ?';
    const params: unknown[] = [layer];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = this.db.query(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToMemory(row));
  }

  async findByType(type: MemoryType, options?: QueryOptions): Promise<Memory[]> {
    let sql = 'SELECT * FROM memories WHERE type = ?';
    const params: unknown[] = [type];
    
    sql += ' ORDER BY created_at DESC';
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }
    
    const rows = this.db.query(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToMemory(row));
  }

  async searchByKeyword(query: string, filters?: SearchFilters, options?: QueryOptions): Promise<Memory[]> {
    let sql = 'SELECT * FROM memories m WHERE m.content LIKE ?';
    const params: unknown[] = [`%${query}%`];

    // Apply additional filters
    if (filters?.layers?.length) {
      sql += ` AND m.layer IN (${filters.layers.map(() => '?').join(',')})`;
      params.push(...filters.layers);
    }
    
    if (filters?.types?.length) {
      sql += ` AND m.type IN (${filters.types.map(() => '?').join(',')})`;
      params.push(...filters.types);
    }
    
    if (filters?.status?.length) {
      sql += ` AND m.status IN (${filters.status.map(() => '?').join(',')})`;
      params.push(...filters.status);
    } else {
      // Default to active only
      sql += ` AND m.status = 'active'`;
    }

    sql += ' ORDER BY m.created_at DESC';
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    const rows = this.db.query(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToMemory(row));
  }

  async update(id: string, updates: UpdateMemoryInput): Promise<Memory> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Memory not found: ${id}`);

    const now = new Date().toISOString();
    const contentHash = updates.content ? await this.hashContent(updates.content) : existing.contentHash;

    this.db.run(
      `UPDATE memories SET 
       content = COALESCE(?, content),
       content_hash = COALESCE(?, content_hash),
       confidence = COALESCE(?, confidence),
       importance = COALESCE(?, importance),
       status = COALESCE(?, status),
       updated_at = ?
       WHERE id = ?`,
      [updates.content, contentHash, updates.confidence, updates.importance, updates.status, now, id]
    );

    return this.findById(id)!;
  }

  async updateStatus(id: string, status: MemoryStatus): Promise<Memory> {
    return this.update(id, { status });
  }

  async markForgotten(id: string, reason: string): Promise<Memory> {
    // Soft delete - mark as forgotten
    return this.updateStatus(id, 'forgotten');
  }

  private mapRowToMemory(row: Record<string, unknown>): Memory {
    return {
      id: row.id as string,
      version: row.version as number,
      parentId: row.parent_id as string | null,
      layer: row.layer as MemoryLayer,
      type: row.type as MemoryType,
      status: row.status as MemoryStatus,
      content: row.content as string,
      contentHash: row.content_hash as string,
      confidence: row.confidence as number,
      importance: row.importance as ImportanceLevel,
      sourceEventId: row.source_event_id as string | null,
      workspace: row.workspace as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      expiresAt: row.expires_at as string | null,
    };
  }

  private async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
