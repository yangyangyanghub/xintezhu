import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { Memory, MemoryStatus, MemoryLayer, AuditContext } from '../types/index.ts';

// Valid state transitions
const VALID_TRANSITIONS: Record<MemoryStatus, MemoryStatus[]> = {
  'new': ['active'],
  'active': ['superseded', 'forgotten', 'archived', 'reverted'],
  'superseded': ['active'], // Can restore
  'forgotten': ['active'], // Can restore
  'archived': ['active'], // Can restore
  'reverted': [], // Terminal state
};

export interface StatusTransition {
  memoryId: string;
  fromStatus: MemoryStatus;
  toStatus: MemoryStatus;
  reason: string;
  actor: string;
  timestamp: string;
}

export class StatusService {
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;

  constructor(memoryRepo: MemoryRepository, auditRepo: AuditRepository) {
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
  }

  async transition(
    memoryId: string,
    toStatus: MemoryStatus,
    context: AuditContext,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      return { success: false, error: 'Memory not found' };
    }

    const fromStatus = memory.status;

    // Validate transition
    if (!this.isValidTransition(fromStatus, toStatus)) {
      return {
        success: false,
        error: `Invalid transition: ${fromStatus} -> ${toStatus}`,
      };
    }

    // Check constraints
    const constraintError = await this.checkConstraints(memory, toStatus);
    if (constraintError) {
      return { success: false, error: constraintError };
    }

    // Perform transition
    const previousState = { ...memory };
    await this.memoryRepo.updateStatus(memoryId, toStatus);

    // Audit
    await this.auditRepo.record(
      'update',
      'memory',
      memoryId,
      { 
        transition: { from: fromStatus, to: toStatus },
        reason,
      },
      context,
      previousState
    );

    return { success: true };
  }

  async activate(memoryId: string, context: AuditContext, reason?: string): Promise<{ success: boolean; error?: string }> {
    return this.transition(memoryId, 'active', context, reason || 'Manual activation');
  }

  async supersede(
    memoryId: string, 
    newMemoryId: string, 
    context: AuditContext, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.transition(memoryId, 'superseded', context, reason || `Superseded by ${newMemoryId}`);
    
    if (result.success) {
      // Link the new memory as parent (in real implementation, would update parent_id)
      await this.auditRepo.record(
        'update',
        'memory_relation',
        memoryId,
        { relation: 'superseded_by', targetId: newMemoryId },
        context
      );
    }

    return result;
  }

  async forget(memoryId: string, context: AuditContext, reason: string): Promise<{ success: boolean; error?: string }> {
    // Special constraint: Can't forget core memories without explicit confirmation
    const memory = await this.memoryRepo.findById(memoryId);
    if (memory?.layer === 'core') {
      return {
        success: false,
        error: 'Core memories require special handling to forget. Use demote first.',
      };
    }

    return this.transition(memoryId, 'forgotten', context, reason);
  }

  async archive(memoryId: string, context: AuditContext, reason?: string): Promise<{ success: boolean; error?: string }> {
    return this.transition(memoryId, 'archived', context, reason || 'Retention policy');
  }

  async demote(
    memoryId: string, 
    toLayer: MemoryLayer, 
    context: AuditContext, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      return { success: false, error: 'Memory not found' };
    }

    // Can only demote (move to less stable layer)
    const layerHierarchy: MemoryLayer[] = ['core', 'semantic', 'episodic', 'working'];
    const currentIndex = layerHierarchy.indexOf(memory.layer);
    const targetIndex = layerHierarchy.indexOf(toLayer);

    if (targetIndex <= currentIndex) {
      return {
        success: false,
        error: `Can only demote to less stable layer. Current: ${memory.layer}, Target: ${toLayer}`,
      };
    }

    const previousState = { ...memory };
    await this.memoryRepo.update(memoryId, { layer: toLayer });

    await this.auditRepo.record(
      'update',
      'memory',
      memoryId,
      { demoted: true, fromLayer: memory.layer, toLayer, reason },
      context,
      previousState
    );

    return { success: true };
  }

  async tombstone(memoryId: string, context: AuditContext, reason: string): Promise<{ success: boolean; error?: string }> {
    // Tombstone = mark as forgotten with explicit audit trail
    // Unlike regular forget, this is intentional and permanent
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      return { success: false, error: 'Memory not found' };
    }

    const previousState = { ...memory };
    
    // Mark as forgotten
    await this.memoryRepo.updateStatus(memoryId, 'forgotten');

    // Create explicit tombstone audit
    await this.auditRepo.record(
      'delete', // Using delete action for tombstone
      'memory',
      memoryId,
      { tombstone: true, reason, originalLayer: memory.layer },
      context,
      previousState
    );

    return { success: true };
  }

  async getStatusHistory(memoryId: string): Promise<StatusTransition[]> {
    const auditRecords = await this.auditRepo.findByEntity('memory', memoryId);
    
    return auditRecords
      .filter(r => r.actionType === 'update' && r.payload?.transition)
      .map(r => ({
        memoryId,
        fromStatus: r.payload!.transition.from as MemoryStatus,
        toStatus: r.payload!.transition.to as MemoryStatus,
        reason: r.payload!.reason as string || '',
        actor: r.actor,
        timestamp: r.createdAt,
      }));
  }

  isValidTransition(from: MemoryStatus, to: MemoryStatus): boolean {
    if (from === to) return true; // No-op is always valid
    const allowed = VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  getValidTransitions(from: MemoryStatus): MemoryStatus[] {
    return VALID_TRANSITIONS[from] || [];
  }

  private async checkConstraints(memory: Memory, toStatus: MemoryStatus): Promise<string | null> {
    // Constraint: Can't transition reverted memories
    if (memory.status === 'reverted' && toStatus !== 'reverted') {
      return 'Reverted memories cannot be modified';
    }

    // Constraint: Core layer has special handling
    if (memory.layer === 'core' && toStatus === 'forgotten') {
      return 'Core memories must be demoted before forgetting';
    }

    return null;
  }
}
