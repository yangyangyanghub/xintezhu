import { Database } from 'bun:sqlite';
import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { 
  Memory, 
  MemoryRelation, 
  RelationType, 
  CreateRelationInput,
  MemoryStatus,
  AuditContext 
} from '../types/index.ts';

interface RelationEngineConfig {
  minDeriveEvidence: number;
  minDeriveConfidence: number;
  enableSupersession: boolean;
}

const DEFAULT_CONFIG: RelationEngineConfig = {
  minDeriveEvidence: 2,      // Requires at least 2 source memories
  minDeriveConfidence: 0.7,  // Minimum confidence for derived memories
  enableSupersession: true,
};

export class RelationEngine {
  private db: Database;
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;
  private config: RelationEngineConfig;

  constructor(
    db: Database,
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    config: Partial<RelationEngineConfig> = {}
  ) {
    this.db = db;
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async createRelation(
    input: CreateRelationInput,
    context: AuditContext
  ): Promise<MemoryRelation> {
    // Validate relation type
    if (!this.isValidRelationType(input.relationType)) {
      throw new Error(`Invalid relation type: ${input.relationType}`);
    }

    // Get source and target memories
    const source = await this.memoryRepo.findById(input.sourceId);
    const target = await this.memoryRepo.findById(input.targetId);

    if (!source) throw new Error(`Source memory not found: ${input.sourceId}`);
    if (!target) throw new Error(`Target memory not found: ${input.targetId}`);

    // Handle specific relation types
    switch (input.relationType) {
      case 'updates':
        return this.handleUpdates(source, target, input, context);
      case 'extends':
        return this.handleExtends(source, target, input, context);
      case 'derives':
        return this.handleDerives(source, target, input, context);
      case 'conflicts':
      case 'relates':
        return this.createSimpleRelation(source, target, input, context);
      default:
        throw new Error(`Unhandled relation type: ${input.relationType}`);
    }
  }

  private async handleUpdates(
    source: Memory,
    target: Memory,
    input: CreateRelationInput,
    context: AuditContext
  ): Promise<MemoryRelation> {
    if (!this.config.enableSupersession) {
      throw new Error('Supersession is disabled');
    }

    // Validate: source should be newer than target
    const sourceDate = new Date(source.createdAt);
    const targetDate = new Date(target.createdAt);
    if (sourceDate <= targetDate) {
      throw new Error('Source must be newer than target for updates relation');
    }

    // Create the relation
    const relation = await this.createSimpleRelation(source, target, input, context);

    // Supersede the target (old) memory
    const previousState = { ...target };
    await this.memoryRepo.updateStatus(target.id, 'superseded');

    // Link source to target as parent
    await this.memoryRepo.update(source.id, {
      // In real implementation, would update parentId
      // For now, we track this through the relation
    });

    // Audit the supersession
    await this.auditRepo.record(
      'update',
      'memory',
      target.id,
      { 
        superseded: true,
        supersededBy: source.id,
        relationId: relation.id,
      },
      context,
      previousState
    );

    console.log(`[RelationEngine] Created updates relation: ${source.id} -> ${target.id}, superseded ${target.id}`);

    return relation;
  }

  private async handleExtends(
    source: Memory,
    target: Memory,
    input: CreateRelationInput,
    context: AuditContext
  ): Promise<MemoryRelation> {
    // Extends: source adds to/extends target
    // Both memories remain active
    const relation = await this.createSimpleRelation(source, target, input, context);

    console.log(`[RelationEngine] Created extends relation: ${source.id} -> ${target.id}`);

    return relation;
  }

  private async handleDerives(
    source: Memory,
    target: Memory,
    input: CreateRelationInput,
    context: AuditContext
  ): Promise<MemoryRelation> {
    // Derives: target is derived from source (and potentially others)
    // Conservative: requires multiple evidence sources

    // Check if evidence is sufficient
    const evidenceRefs = input.evidenceRefs || [];
    if (evidenceRefs.length < this.config.minDeriveEvidence) {
      throw new Error(
        `Derives relation requires at least ${this.config.minDeriveEvidence} evidence references, ` +
        `got ${evidenceRefs.length}`
      );
    }

    // Check confidence
    const confidence = input.confidence || 0;
    if (confidence < this.config.minDeriveConfidence) {
      throw new Error(
        `Derives relation requires confidence >= ${this.config.minDeriveConfidence}, ` +
        `got ${confidence}`
      );
    }

    // Create relation with evidence
    const relation = await this.createSimpleRelation(source, target, {
      ...input,
      evidenceRefs,
      confidence,
    }, context);

    // Mark target as derived
    const previousState = { ...target };
    await this.memoryRepo.update(target.id, {
      // In real implementation, would mark as derived
      confidence: Math.min(1.0, target.confidence + (confidence * 0.1)), // Slight boost
    });

    await this.auditRepo.record(
      'update',
      'memory',
      target.id,
      { 
        derived: true,
        derivedFrom: source.id,
        evidenceCount: evidenceRefs.length,
        confidence,
      },
      context,
      previousState
    );

    console.log(`[RelationEngine] Created derives relation: ${source.id} -> ${target.id} ` +
      `(evidence: ${evidenceRefs.length}, confidence: ${confidence})`);

    return relation;
  }

  private async createSimpleRelation(
    source: Memory,
    target: Memory,
    input: CreateRelationInput,
    context: AuditContext
  ): Promise<MemoryRelation> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const relation: MemoryRelation = {
      id,
      sourceId: source.id,
      targetId: target.id,
      relationType: input.relationType,
      confidence: input.confidence || 0.5,
      evidenceRefs: input.evidenceRefs || [],
      createdAt: now,
      status: 'active',
    };

    // Persist to database
    this.db.run(
      `INSERT INTO memory_relations (id, source_id, target_id, relation_type, confidence, 
       evidence_refs, created_at, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, source.id, target.id, input.relationType, relation.confidence,
       JSON.stringify(relation.evidenceRefs), now, 'active']
    );

    // Audit
    await this.auditRepo.record(
      'update',
      'memory_relation',
      id,
      { relation: input.relationType, sourceId: source.id, targetId: target.id },
      context
    );

    return relation;
  }

  // Query methods

  async getRelationsFrom(memoryId: string, type?: RelationType): Promise<MemoryRelation[]> {
    let sql = 'SELECT * FROM memory_relations WHERE source_id = ? AND status = ?';
    const params: unknown[] = [memoryId, 'active'];

    if (type) {
      sql += ' AND relation_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = this.db.query(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToRelation(row));
  }

  async getRelationsTo(memoryId: string, type?: RelationType): Promise<MemoryRelation[]> {
    let sql = 'SELECT * FROM memory_relations WHERE target_id = ? AND status = ?';
    const params: unknown[] = [memoryId, 'active'];

    if (type) {
      sql += ' AND relation_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = this.db.query(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToRelation(row));
  }

  async getAllRelations(memoryId: string): Promise<{ from: MemoryRelation[]; to: MemoryRelation[] }> {
    const [from, to] = await Promise.all([
      this.getRelationsFrom(memoryId),
      this.getRelationsTo(memoryId),
    ]);
    return { from, to };
  }

  async deactivateRelation(relationId: string, context: AuditContext): Promise<void> {
    const previousState = this.db.query('SELECT * FROM memory_relations WHERE id = ?').get(relationId) as Record<string, unknown> | null;
    
    if (!previousState) {
      throw new Error(`Relation not found: ${relationId}`);
    }

    this.db.run(
      'UPDATE memory_relations SET status = ? WHERE id = ?',
      ['inactive', relationId]
    );

    await this.auditRepo.record(
      'update',
      'memory_relation',
      relationId,
      { deactivated: true },
      context,
      previousState
    );
  }

  // Supersession helpers

  async getSupersededVersion(memoryId: string): Promise<Memory | null> {
    // Find the memory that this one updates (the older version)
    const row = this.db.query(
      `SELECT m.* FROM memories m 
       JOIN memory_relations r ON m.id = r.target_id 
       WHERE r.source_id = ? AND r.relation_type = 'updates' AND r.status = 'active'`
    ).get(memoryId) as Record<string, unknown> | null;

    return row ? this.mapRowToMemory(row) : null;
  }

  async getSupersedingVersion(memoryId: string): Promise<Memory | null> {
    // Find the memory that updates this one (the newer version)
    const row = this.db.query(
      `SELECT m.* FROM memories m 
       JOIN memory_relations r ON m.id = r.source_id 
       WHERE r.target_id = ? AND r.relation_type = 'updates' AND r.status = 'active'`
    ).get(memoryId) as Record<string, unknown> | null;

    return row ? this.mapRowToMemory(row) : null;
  }

  async getLineage(memoryId: string): Promise<Memory[]> {
    // Get full version chain
    const lineage: Memory[] = [];
    let current: Memory | null = await this.memoryRepo.findById(memoryId);

    // Go backwards
    while (current) {
      lineage.unshift(current);
      const superseded = await this.getSupersededVersion(current.id);
      current = superseded;
    }

    // Go forwards from original
    const original = lineage[0];
    if (original) {
      let next = await this.getSupersedingVersion(original.id);
      // Skip the original since we already have it
      if (next && next.id === memoryId) {
        next = await this.getSupersedingVersion(next.id);
      }
      while (next) {
        lineage.push(next);
        next = await this.getSupersedingVersion(next.id);
      }
    }

    return lineage;
  }

  private isValidRelationType(type: string): boolean {
    return ['updates', 'extends', 'derives', 'conflicts', 'relates'].includes(type);
  }

  private mapRowToRelation(row: Record<string, unknown>): MemoryRelation {
    return {
      id: row.id as string,
      sourceId: row.source_id as string,
      targetId: row.target_id as string,
      relationType: row.relation_type as RelationType,
      confidence: row.confidence as number,
      evidenceRefs: row.evidence_refs ? JSON.parse(row.evidence_refs as string) : [],
      createdAt: row.created_at as string,
      status: row.status as 'active' | 'inactive',
    };
  }

  private mapRowToMemory(row: Record<string, unknown>): Memory {
    // Simplified mapping - in real implementation would use full mapper
    return {
      id: row.id as string,
      version: row.version as number,
      parentId: row.parent_id as string | null,
      layer: row.layer as Memory['layer'],
      type: row.type as Memory['type'],
      status: row.status as MemoryStatus,
      content: row.content as string,
      contentHash: row.content_hash as string,
      confidence: row.confidence as number,
      importance: row.importance as Memory['importance'],
      sourceEventId: row.source_event_id as string | null,
      workspace: row.workspace as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      expiresAt: row.expires_at as string | null,
    };
  }
}
