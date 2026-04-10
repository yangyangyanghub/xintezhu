import { Database } from 'bun:sqlite';
import type { Promotion, PromotionStatus } from '../types/index.ts';

export interface PromotionRepository {
  create(promotion: Promotion): Promise<Promotion>;
  findById(id: string): Promise<Promotion | null>;
  findByMemoryId(memoryId: string): Promise<Promotion[]>;
  updateStatus(id: string, status: PromotionStatus): Promise<Promotion>;
}

export class SQLitePromotionRepository implements PromotionRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(promotion: Promotion): Promise<Promotion> {
    this.db.run(
      `INSERT INTO memory_promotions (
        id, memory_id, from_layer, to_layer, trigger_scores, evidence_refs, status, promoted_at, rolled_back_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        promotion.id,
        promotion.memoryId,
        promotion.fromLayer,
        promotion.toLayer,
        JSON.stringify(promotion.triggerScores),
        JSON.stringify(promotion.evidenceRefs),
        promotion.status,
        promotion.promotedAt,
        promotion.rolledBackAt,
      ]
    );

    return promotion;
  }

  async findById(id: string): Promise<Promotion | null> {
    const row = this.db.query('SELECT * FROM memory_promotions WHERE id = ?').get(id) as Record<string, unknown> | null;
    return row ? this.mapRowToPromotion(row) : null;
  }

  async findByMemoryId(memoryId: string): Promise<Promotion[]> {
    const rows = this.db.query(
      'SELECT * FROM memory_promotions WHERE memory_id = ? ORDER BY promoted_at DESC, rowid DESC'
    ).all(memoryId) as Record<string, unknown>[];

    return rows.map(row => this.mapRowToPromotion(row));
  }

  async updateStatus(id: string, status: PromotionStatus): Promise<Promotion> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Promotion not found: ${id}`);
    }

    const now = new Date().toISOString();
    const promotedAt = status === 'approved'
      ? existing.promotedAt ?? now
      : existing.promotedAt;
    const rolledBackAt = status === 'rolled_back'
      ? now
      : existing.rolledBackAt;

    this.db.run(
      `UPDATE memory_promotions
       SET status = ?, promoted_at = ?, rolled_back_at = ?
       WHERE id = ?`,
      [status, promotedAt, rolledBackAt, id]
    );

    return (await this.findById(id))!;
  }

  private mapRowToPromotion(row: Record<string, unknown>): Promotion {
    return {
      id: row.id as string,
      memoryId: row.memory_id as string,
      fromLayer: row.from_layer as Promotion['fromLayer'],
      toLayer: row.to_layer as Promotion['toLayer'],
      triggerScores: JSON.parse(row.trigger_scores as string) as Promotion['triggerScores'],
      evidenceRefs: JSON.parse(row.evidence_refs as string) as string[],
      status: row.status as PromotionStatus,
      promotedAt: row.promoted_at as string | null,
      rolledBackAt: row.rolled_back_at as string | null,
    };
  }
}
