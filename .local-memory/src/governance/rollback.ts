import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { Memory, MemoryStatus, AuditContext } from '../types/index.ts';

export interface RollbackResult {
  success: boolean;
  rolledBackIds: string[];
  failedIds: { id: string; reason: string }[];
  rollbackId: string;
}

export interface RollbackOperation {
  id: string;
  batchId: string;
  rollbackType: 'memory' | 'relation' | 'promotion' | 'batch';
  targetId: string;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string;
  createdAt: string;
}

export class RollbackService {
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;
  private ingestionRepo: IngestionRepository;

  constructor(
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    ingestionRepo: IngestionRepository
  ) {
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.ingestionRepo = ingestionRepo;
  }

  async rollbackMemory(
    memoryId: string,
    context: AuditContext,
    reason: string
  ): Promise<RollbackResult> {
    const rolledBackIds: string[] = [];
    const failedIds: { id: string; reason: string }[] = [];
    const rollbackId = `rollback_${Date.now()}`;

    try {
      const memory = await this.memoryRepo.findById(memoryId);
      if (!memory) {
        return {
          success: false,
          rolledBackIds: [],
          failedIds: [{ id: memoryId, reason: 'Memory not found' }],
          rollbackId,
        };
      }

      // Cannot rollback if already reverted
      if (memory.status === 'reverted') {
        return {
          success: false,
          rolledBackIds: [],
          failedIds: [{ id: memoryId, reason: 'Memory already reverted' }],
          rollbackId,
        };
      }

      // Get previous state for audit
      const previousState = { ...memory };

      // Perform rollback: mark current as reverted
      const newStatus: MemoryStatus = 'reverted';
      await this.memoryRepo.updateStatus(memoryId, newStatus);

      // Audit the rollback
      await this.auditRepo.record(
        'rollback',
        'memory',
        memoryId,
        { reason, rollbackId, previousStatus: memory.status },
        context,
        previousState
      );

      rolledBackIds.push(memoryId);

      return {
        success: true,
        rolledBackIds,
        failedIds,
        rollbackId,
      };
    } catch (error) {
      return {
        success: false,
        rolledBackIds,
        failedIds: [{ id: memoryId, reason: String(error) }],
        rollbackId,
      };
    }
  }

  async rollbackBatch(
    batchId: string,
    context: AuditContext,
    reason: string
  ): Promise<RollbackResult> {
    const rolledBackIds: string[] = [];
    const failedIds: { id: string; reason: string }[] = [];
    const rollbackId = `rollback_${Date.now()}`;

    try {
      // Find all events in batch
      const events = await this.ingestionRepo.findByBatch(batchId);

      // Process each event
      for (const event of events) {
        // Note: In real implementation, would need to track which memory was created from which event
        // For now, we'll rollback by finding memories with matching sourceEventId
        const memory = await this.findMemoryBySourceEvent(event.id);
        
        if (memory) {
          const result = await this.rollbackMemory(memory.id, context, reason);
          if (result.success) {
            rolledBackIds.push(memory.id);
          } else {
            failedIds.push({ id: memory.id, reason: 'Rollback failed' });
          }
        }
      }

      return {
        success: failedIds.length === 0,
        rolledBackIds,
        failedIds,
        rollbackId,
      };
    } catch (error) {
      return {
        success: false,
        rolledBackIds,
        failedIds: [{ id: batchId, reason: String(error) }],
        rollbackId,
      };
    }
  }

  async rollbackPromotion(
    memoryId: string,
    context: AuditContext,
    reason: string
  ): Promise<RollbackResult> {
    const rolledBackIds: string[] = [];
    const failedIds: { id: string; reason: string }[] = [];
    const rollbackId = `rollback_${Date.now()}`;

    try {
      const memory = await this.memoryRepo.findById(memoryId);
      if (!memory) {
        return {
          success: false,
          rolledBackIds: [],
          failedIds: [{ id: memoryId, reason: 'Memory not found' }],
          rollbackId,
        };
      }

      // Can only rollback promotions from semantic/core
      if (memory.layer !== 'semantic' && memory.layer !== 'core') {
        return {
          success: false,
          rolledBackIds: [],
          failedIds: [{ id: memoryId, reason: 'Memory not in promotable layer' }],
          rollbackId,
        };
      }

      const previousState = { ...memory };

      // Demote to episodic
      await this.memoryRepo.update(memoryId, {
        layer: 'episodic',
        status: 'active',
      });

      await this.auditRepo.record(
        'rollback',
        'promotion',
        memoryId,
        { reason, rollbackId, fromLayer: memory.layer, toLayer: 'episodic' },
        context,
        previousState
      );

      rolledBackIds.push(memoryId);

      return {
        success: true,
        rolledBackIds,
        failedIds,
        rollbackId,
      };
    } catch (error) {
      return {
        success: false,
        rolledBackIds,
        failedIds: [{ id: memoryId, reason: String(error) }],
        rollbackId,
      };
    }
  }

  private async findMemoryBySourceEvent(eventId: string): Promise<Memory | null> {
    return this.memoryRepo.findBySourceEventId(eventId);
  }
}
