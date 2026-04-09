import { writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { MemoryRepository } from '../repository/memory.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { Memory, MemoryLayer, MemoryType, AuditContext } from '../types/index.ts';

// Target mapping (from v1-target-mapping.json)
const TARGET_MAPPING: Record<MemoryType, { dir: string; strategy: 'singleton' | 'per_item'; filename?: string; pattern?: string }> = {
  'identity': { dir: '.memory/core', strategy: 'singleton', filename: 'identity.md' },
  'preference': { dir: '.memory/core', strategy: 'singleton', filename: 'preferences.md' },
  'habit': { dir: '.memory/core', strategy: 'singleton', filename: 'habits.md' },
  'workflow': { dir: '.memory/core', strategy: 'singleton', filename: 'workflows.md' },
  'project': { dir: '.memory/semantic/projects', strategy: 'per_item', pattern: '{slug}.md' },
  'decision': { dir: '.memory/semantic/decisions', strategy: 'per_item', pattern: '{id}-{slug}.md' },
  'pattern': { dir: '.memory/semantic/patterns', strategy: 'per_item', pattern: '{slug}.md' },
  'error_solution': { dir: '.memory/semantic/error-solutions', strategy: 'per_item', pattern: '{slug}.md' },
  'observation': { dir: '.memory/semantic/observations', strategy: 'per_item', pattern: '{id}.md' },
  'event': { dir: '.memory/episodic', strategy: 'per_item', pattern: '{date}.md' },
};

interface ProjectionConfig {
  projectionRoot: string;
  enableRebuild: boolean;
  backupBeforeRebuild: boolean;
}

const DEFAULT_CONFIG: ProjectionConfig = {
  projectionRoot: '.memory',
  enableRebuild: true,
  backupBeforeRebuild: false,
};

export interface ProjectionResult {
  success: boolean;
  projected: number;
  removed: number;
  errors: { memoryId: string; error: string }[];
  duration: number;
}

export interface RebuildResult {
  success: boolean;
  summary: {
    core: number;
    semantic: number;
    total: number;
  };
  errors: string[];
  duration: number;
}

export class ProjectionEngine {
  private memoryRepo: MemoryRepository;
  private auditRepo: AuditRepository;
  private config: ProjectionConfig;

  constructor(
    memoryRepo: MemoryRepository,
    auditRepo: AuditRepository,
    config: Partial<ProjectionConfig> = {}
  ) {
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async rebuild(context?: AuditContext): Promise<RebuildResult> {
    const startTime = performance.now();
    const errors: string[] = [];

    try {
      console.log('[ProjectionEngine] Starting full rebuild...');

      // Get all promotable memories (semantic and core layers)
      const semanticMemories = await this.memoryRepo.findByLayer('semantic', 'active');
      const coreMemories = await this.memoryRepo.findByLayer('core', 'active');

      // Combine and sort by ID for determinism
      const allMemories = [...semanticMemories, ...coreMemories]
        .sort((a, b) => a.id.localeCompare(b.id));

      console.log(`[ProjectionEngine] Found ${allMemories.length} memories to project ` +
        `(${semanticMemories.length} semantic, ${coreMemories.length} core)`);

      // Clear existing projection (if enabled)
      if (this.config.enableRebuild) {
        await this.clearProjection();
      }

      // Project each memory
      let projectedCount = 0;
      for (const memory of allMemories) {
        try {
          await this.projectMemory(memory, context);
          projectedCount++;
        } catch (error) {
          const msg = `Failed to project memory ${memory.id}: ${error}`;
          console.error(`[ProjectionEngine] ${msg}`);
          errors.push(msg);
        }
      }

      const duration = performance.now() - startTime;

      console.log(`[ProjectionEngine] Rebuild complete: ${projectedCount} projected, ${errors.length} errors`);

      // Audit
      if (context) {
        await this.auditRepo.record(
          'project',
          'projection',
          'full_rebuild',
          { projected: projectedCount, errors: errors.length },
          context
        );
      }

      return {
        success: errors.length === 0,
        summary: {
          core: coreMemories.length,
          semantic: semanticMemories.length,
          total: projectedCount,
        },
        errors,
        duration,
      };

    } catch (error) {
      const msg = `Rebuild failed: ${error}`;
      console.error(`[ProjectionEngine] ${msg}`);
      return {
        success: false,
        summary: { core: 0, semantic: 0, total: 0 },
        errors: [msg],
        duration: performance.now() - startTime,
      };
    }
  }

  async projectMemory(memory: Memory, context?: AuditContext): Promise<void> {
    const mapping = TARGET_MAPPING[memory.type];
    if (!mapping) {
      throw new Error(`No mapping for memory type: ${memory.type}`);
    }

    // Skip non-durable layers
    if (memory.layer === 'working' || memory.layer === 'episodic') {
      return;
    }

    const filePath = this.getFilePath(memory, mapping);
    const content = this.generateMarkdown(memory);

    // Ensure directory exists
    await mkdir(dirname(filePath), { recursive: true });

    // Write file
    await writeFile(filePath, content, 'utf-8');

    // Audit
    if (context) {
      await this.auditRepo.record(
        'project',
        'memory',
        memory.id,
        { filePath, layer: memory.layer, type: memory.type },
        context
      );
    }
  }

  async removeProjection(memoryId: string, context?: AuditContext): Promise<void> {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    const mapping = TARGET_MAPPING[memory.type];
    if (!mapping) return;

    const filePath = this.getFilePath(memory, mapping);

    try {
      await rm(filePath);
      console.log(`[ProjectionEngine] Removed projection: ${filePath}`);
    } catch {
      // File may not exist, ignore
    }

    if (context) {
      await this.auditRepo.record(
        'project',
        'memory',
        memoryId,
        { action: 'remove', filePath },
        context
      );
    }
  }

  async updateProjection(memoryId: string, context?: AuditContext): Promise<void> {
    // Remove old projection if exists
    await this.removeProjection(memoryId, context);

    // Re-project
    const memory = await this.memoryRepo.findById(memoryId);
    if (memory && memory.status === 'active') {
      await this.projectMemory(memory, context);
    }
  }

  private async clearProjection(): Promise<void> {
    console.log('[ProjectionEngine] Clearing existing projection...');

    const dirsToClear = [
      join(this.config.projectionRoot, 'core'),
      join(this.config.projectionRoot, 'semantic'),
    ];

    for (const dir of dirsToClear) {
      try {
        if (existsSync(dir)) {
          await rm(dir, { recursive: true, force: true });
          console.log(`[ProjectionEngine] Cleared: ${dir}`);
        }
        // Recreate empty directory
        await mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`[ProjectionEngine] Failed to clear ${dir}: ${error}`);
      }
    }
  }

  private getFilePath(
    memory: Memory,
    mapping: { dir: string; strategy: string; filename?: string; pattern?: string }
  ): string {
    const targetDir = this.normalizeTargetDir(mapping.dir);

    if (mapping.strategy === 'singleton' && mapping.filename) {
      return join(this.config.projectionRoot, targetDir, mapping.filename);
    }

    if (mapping.strategy === 'per_item' && mapping.pattern) {
      const slug = this.slugify(memory.content.substring(0, 50));
      const date = new Date(memory.createdAt).toISOString().split('T')[0];
      const filename = mapping.pattern
        .replace('{id}', memory.id.substring(0, 8))
        .replace('{slug}', slug)
        .replace('{date}', date);
      return join(this.config.projectionRoot, targetDir, filename);
    }

    throw new Error(`Invalid mapping strategy for type: ${memory.type}`);
  }

  private generateMarkdown(memory: Memory): string {
    const frontmatter = this.generateFrontmatter(memory);
    const content = this.formatContent(memory);

    return `${frontmatter}\n\n${content}\n`;
  }

  private generateFrontmatter(memory: Memory): string {
    const lines = [
      '---',
      `memory_id: ${memory.id}`,
      `version: ${memory.version}`,
      `type: ${memory.type}`,
      `layer: ${memory.layer}`,
      `status: ${memory.status}`,
      `confidence: ${memory.confidence.toFixed(2)}`,
      `importance: ${memory.importance}`,
      `created_at: ${memory.createdAt}`,
      `updated_at: ${memory.updatedAt}`,
    ];

    if (memory.workspace) {
      lines.push(`workspace: ${memory.workspace}`);
    }

    if (memory.parentId) {
      lines.push(`parent_id: ${memory.parentId}`);
    }

    if (memory.expiresAt) {
      lines.push(`expires_at: ${memory.expiresAt}`);
    }

    lines.push('---');

    return lines.join('\n');
  }

  private formatContent(memory: Memory): string {
    // Format based on type
    switch (memory.type) {
      case 'decision':
        return `# Decision\n\n${memory.content}`;
      case 'pattern':
        return `# Pattern\n\n${memory.content}`;
      case 'error_solution':
        return `# Error Solution\n\n${memory.content}`;
      case 'project':
        return `# Project\n\n${memory.content}`;
      default:
        return memory.content;
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .replace(/-+$/, '');
  }

  private normalizeTargetDir(dir: string): string {
    return dir.replace(/^\.memory[\\/]?/, '');
  }

  // Verify projection integrity
  async verifyIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Get all active semantic/core memories
    const semanticMemories = await this.memoryRepo.findByLayer('semantic', 'active');
    const coreMemories = await this.memoryRepo.findByLayer('core', 'active');
    const allMemories = [...semanticMemories, ...coreMemories];

    for (const memory of allMemories) {
      const mapping = TARGET_MAPPING[memory.type];
      if (!mapping) continue;

      const filePath = this.getFilePath(memory, mapping);
      if (!existsSync(filePath)) {
        issues.push(`Missing projection for memory ${memory.id}: ${filePath}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
