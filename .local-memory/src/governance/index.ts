// Governance service - coordinates audit, rollback, and status management

import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { AuditContext, MemoryStatus, MemoryLayer } from '../types/index.ts';
import { RollbackService, type RollbackResult } from './rollback.ts';
import { StatusService } from './status.ts';

export interface GovernanceConfig {
  enableAudit: boolean;
  maxRollbackWindowDays: number;
}

export const DEFAULT_GOVERNANCE_CONFIG: GovernanceConfig = {
  enableAudit: true,
  maxRollbackWindowDays: 30,
};

export class GovernanceService {
  public rollback: RollbackService;
  public status: StatusService;
  private auditRepo: AuditRepository;
  private config: GovernanceConfig;

  constructor(
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    ingestionRepo: IngestionRepository,
    config: Partial<GovernanceConfig> = {}
  ) {
    this.auditRepo = auditRepo;
    this.config = { ...DEFAULT_GOVERNANCE_CONFIG, ...config };
    
    // Initialize sub-services
    this.rollback = new RollbackService(memoryRepo, auditRepo, ingestionRepo);
    this.status = new StatusService(memoryRepo, auditRepo);
  }

  // Convenience methods that delegate to sub-services with audit

  async rollbackMemory(
    memoryId: string, 
    actor: string, 
    reason: string
  ): Promise<RollbackResult> {
    const context: AuditContext = { actor, batchId: `rollback_${Date.now()}` };
    return this.rollback.rollbackMemory(memoryId, context, reason);
  }

  async rollbackBatch(
    batchId: string, 
    actor: string, 
    reason: string
  ): Promise<RollbackResult> {
    const context: AuditContext = { actor, batchId: `rollback_${Date.now()}` };
    return this.rollback.rollbackBatch(batchId, context, reason);
  }

  async rollbackPromotion(
    memoryId: string, 
    actor: string, 
    reason: string
  ): Promise<RollbackResult> {
    const context: AuditContext = { actor, batchId: `rollback_${Date.now()}` };
    return this.rollback.rollbackPromotion(memoryId, context, reason);
  }

  async forgetMemory(memoryId: string, actor: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const context: AuditContext = { actor };
    return this.status.forget(memoryId, context, reason);
  }

  async demoteMemory(
    memoryId: string, 
    toLayer: MemoryLayer, 
    actor: string, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const context: AuditContext = { actor };
    return this.status.demote(memoryId, toLayer, context, reason);
  }

  async tombstoneMemory(memoryId: string, actor: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const context: AuditContext = { actor };
    return this.status.tombstone(memoryId, context, reason);
  }

  async archiveMemory(memoryId: string, actor: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const context: AuditContext = { actor };
    return this.status.archive(memoryId, context, reason);
  }

  async restoreMemory(memoryId: string, actor: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const context: AuditContext = { actor };
    return this.status.activate(memoryId, context, reason || 'Restored from inactive state');
  }

  // Audit query methods

  async getAuditHistory(entityType: string, entityId: string) {
    return this.auditRepo.findByEntity(entityType, entityId);
  }

  async getBatchAudit(batchId: string) {
    return this.auditRepo.findByBatch(batchId);
  }

  // Validation helpers

  isValidStatusTransition(from: MemoryStatus, to: MemoryStatus): boolean {
    return this.status.isValidTransition(from, to);
  }

  getValidTransitions(status: MemoryStatus): MemoryStatus[] {
    return this.status.getValidTransitions(status);
  }

  isWithinRollbackWindow(timestamp: string): boolean {
    const eventDate = new Date(timestamp);
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - this.config.maxRollbackWindowDays);
    return eventDate >= windowStart;
  }
}

export { RollbackService, StatusService };
export type { RollbackResult, StatusTransition } from './status.ts';
