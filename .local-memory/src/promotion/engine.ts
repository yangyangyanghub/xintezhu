import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { PromotionRepository } from '../repository/promotion.ts';
import type { RelationEngine } from '../relations/engine.ts';
import type { 
  Memory, 
  MemoryType, 
  MemoryLayer, 
  Promotion, 
  PromotionScores,
  AuditContext 
} from '../types/index.ts';

// Promotion whitelist - only these types can auto-promote
const PROMOTION_WHITELIST: MemoryType[] = [
  'preference',
  'habit',
  'workflow',
  'project',
  'decision',
  'pattern',
  'error_solution',
];

// Layer promotion path: episodic -> semantic -> core
const PROMOTION_PATH: Record<MemoryLayer, MemoryLayer | null> = {
  'working': 'episodic',
  'episodic': 'semantic',
  'semantic': 'core',
  'core': null, // Already at top
};

interface PromotionConfig {
  threshold: number;
  minConfidence: number;
  minEvidenceCount: number;
  minStabilityDays: number;
  maxRepetitionBoost: number;
  enableAutoPromotion: boolean;
}

const DEFAULT_CONFIG: PromotionConfig = {
  threshold: 0.8,
  minConfidence: 0.7,
  minEvidenceCount: 2,
  minStabilityDays: 7,
  maxRepetitionBoost: 0.2,
  enableAutoPromotion: true,
};

export interface PromotionResult {
  eligible: boolean;
  promoted: boolean;
  fromLayer: MemoryLayer;
  toLayer: MemoryLayer | null;
  scores?: PromotionScores;
  reason: string;
}

export interface EvaluationResult {
  eligible: boolean;
  scores: PromotionScores;
  factors: {
    confidence: number;
    repetition: number;
    evidenceDiversity: number;
    stability: number;
  };
}

export class PromotionEngine {
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;
  private promotionRepo: PromotionRepository;
  private relationEngine: RelationEngine;
  private config: PromotionConfig;

  constructor(
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    promotionRepo: PromotionRepository,
    relationEngine: RelationEngine,
    config: Partial<PromotionConfig> = {}
  ) {
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.promotionRepo = promotionRepo;
    this.relationEngine = relationEngine;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async evaluate(memoryId: string): Promise<EvaluationResult> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Check whitelist
    if (!this.isWhitelisted(memory.type)) {
      return {
        eligible: false,
        scores: { stability: 0, confidence: 0, evidenceDiversity: 0, repetition: 0, overall: 0 },
        factors: { confidence: 0, repetition: 0, evidenceDiversity: 0, stability: 0 },
      };
    }

    // Calculate scores
    const scores = await this.calculateScores(memory);
    const factors = await this.calculateFactors(memory);

    // Check if eligible
    const eligible = scores.overall >= this.config.threshold &&
      scores.confidence >= this.config.minConfidence &&
      scores.evidenceDiversity >= this.config.minEvidenceCount;

    return {
      eligible,
      scores,
      factors,
    };
  }

  async promote(
    memoryId: string,
    context: AuditContext,
    force: boolean = false
  ): Promise<PromotionResult> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Determine target layer
    const targetLayer = PROMOTION_PATH[memory.layer];
    if (!targetLayer) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: null,
        reason: 'Already at highest layer (core)',
      };
    }

    // Check whitelist
    if (!this.isWhitelisted(memory.type)) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        reason: `Type '${memory.type}' not in promotion whitelist`,
      };
    }

    // Evaluate
    const evaluation = await this.evaluate(memoryId);

    // Check if eligible (unless forced)
    if (!evaluation.eligible && !force) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        scores: evaluation.scores,
        reason: `Scores below threshold: overall=${evaluation.scores.overall.toFixed(2)}, ` +
          `threshold=${this.config.threshold}`,
      };
    }

    // Check auto-promotion enabled
    if (!this.config.enableAutoPromotion && !force) {
      return {
        eligible: evaluation.eligible,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        scores: evaluation.scores,
        reason: 'Auto-promotion disabled',
      };
    }

    // Get evidence references
    const evidenceRefs = await this.gatherEvidence(memory);

    // Perform promotion
    const previousState = { ...memory };
    await this.memoryRepo.update(memoryId, { layer: targetLayer });

    // Create promotion record
    const promotion: Promotion = {
      id: crypto.randomUUID(),
      memoryId,
      fromLayer: memory.layer,
      toLayer: targetLayer,
      triggerScores: evaluation.scores,
      evidenceRefs,
      status: 'approved',
      promotedAt: new Date().toISOString(),
      rolledBackAt: null,
    };

    // Persist promotion record
    await this.promotionRepo.create(promotion);

    // Audit
    await this.auditRepo.record(
      'promote',
      'memory',
      memoryId,
      {
        promotionId: promotion.id,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        scores: evaluation.scores,
        evidenceCount: evidenceRefs.length,
        forced: force,
      },
      context,
      previousState
    );

    console.log(`[PromotionEngine] Promoted memory ${memoryId} from ${memory.layer} to ${targetLayer} ` +
      `(score: ${evaluation.scores.overall.toFixed(2)})`);

    return {
      eligible: true,
      promoted: true,
      fromLayer: memory.layer,
      toLayer: targetLayer,
      scores: evaluation.scores,
      reason: `Promoted to ${targetLayer}`,
    };
  }

  async batchEvaluate(layer: MemoryLayer = 'episodic'): Promise<{ memoryId: string; result: EvaluationResult }[]> {
    // Get all active memories in layer
    const memories = await this.memoryRepo.findByLayer(layer, 'active');
    
    const results: { memoryId: string; result: EvaluationResult }[] = [];
    
    for (const memory of memories) {
      if (!this.isWhitelisted(memory.type)) continue;
      
      const evaluation = await this.evaluate(memory.id);
      results.push({ memoryId: memory.id, result: evaluation });
    }

    // Sort by overall score descending
    results.sort((a, b) => b.result.scores.overall - a.result.scores.overall);

    return results;
  }

  async autoPromote(context: AuditContext): Promise<PromotionResult[]> {
    if (!this.config.enableAutoPromotion) {
      console.log('[PromotionEngine] Auto-promotion disabled');
      return [];
    }

    const results: PromotionResult[] = [];
    
    // Evaluate episodic memories
    const evaluations = await this.batchEvaluate('episodic');
    
    for (const { memoryId, result } of evaluations) {
      if (result.eligible) {
        const promotion = await this.promote(memoryId, context);
        results.push(promotion);
      }
    }

    // Evaluate semantic memories for promotion to core
    const semanticEvaluations = await this.batchEvaluate('semantic');
    
    for (const { memoryId, result } of semanticEvaluations) {
      if (result.eligible) {
        const promotion = await this.promote(memoryId, context);
        results.push(promotion);
      }
    }

    console.log(`[PromotionEngine] Auto-promotion complete: ${results.filter(r => r.promoted).length} promoted`);

    return results;
  }

  isWhitelisted(type: MemoryType): boolean {
    return PROMOTION_WHITELIST.includes(type);
  }

  getWhitelist(): MemoryType[] {
    return [...PROMOTION_WHITELIST];
  }

  private async calculateScores(memory: Memory): Promise<PromotionScores> {
    const factors = await this.calculateFactors(memory);

    // Calculate component scores (normalized 0-1)
    const confidenceScore = Math.min(1.0, memory.confidence / this.config.minConfidence);
    const repetitionScore = Math.min(1.0, factors.repetition / 5); // Max boost at 5 repetitions
    const evidenceScore = Math.min(1.0, factors.evidenceDiversity / this.config.minEvidenceCount);
    const stabilityScore = Math.min(1.0, factors.stability / this.config.minStabilityDays);

    // Weighted overall score
    const weights = {
      confidence: 0.35,
      repetition: 0.25,
      evidence: 0.25,
      stability: 0.15,
    };

    const overall = 
      confidenceScore * weights.confidence +
      repetitionScore * weights.repetition +
      evidenceScore * weights.evidence +
      stabilityScore * weights.stability;

    return {
      stability: stabilityScore,
      confidence: confidenceScore,
      evidenceDiversity: evidenceScore,
      repetition: repetitionScore,
      overall,
    };
  }

  private async calculateFactors(memory: Memory): Promise<EvaluationResult['factors']> {
    // Confidence factor
    const confidence = memory.confidence;

    // Repetition factor - count similar memories
    const repetition = await this.countSimilarMemories(memory);

    // Evidence diversity - from relations
    const relations = await this.relationEngine.getRelationsFrom(memory.id, 'derives');
    const evidenceDiversity = relations.length + relations.reduce((sum, r) => sum + r.evidenceRefs.length, 0);

    // Stability - time since creation
    const ageDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const stability = ageDays;

    return {
      confidence,
      repetition,
      evidenceDiversity,
      stability,
    };
  }

  private async countSimilarMemories(memory: Memory): Promise<number> {
    // Search for memories with similar content hash prefix
    // Simplified: just check content similarity via hash
    const contentWords = memory.content.split(/\s+/).slice(0, 10).join(' ');
    const similar = await this.memoryRepo.searchByKeyword(
      contentWords,
      { types: [memory.type], status: ['active'] },
      { limit: 10 }
    );
    return similar.filter(m => m.id !== memory.id).length;
  }

  private async gatherEvidence(memory: Memory): string[] {
    const evidence: string[] = [];
    
    // Get derives relations as evidence
    const relations = await this.relationEngine.getRelationsFrom(memory.id, 'derives');
    for (const relation of relations) {
      evidence.push(relation.id);
      evidence.push(...relation.evidenceRefs);
    }

    // Get source event as evidence
    if (memory.sourceEventId) {
      evidence.push(memory.sourceEventId);
    }

    // Deduplicate
    return [...new Set(evidence)];
  }
}
