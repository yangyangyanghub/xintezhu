import type { MemoryRepository } from '../repository/memory.ts';
import type { RetrievalService } from '../retrieval/service.ts';
import type { 
  Memory, 
  MemoryLayer, 
  MemoryType,
  ContextAssembly,
  ContextBudgets,
  ImportanceLevel
} from '../types/index.ts';

const DEFAULT_BUDGETS: ContextBudgets = {
  userProfile: 5,
  projectKnowledge: 8,
  taskRelevant: 5,
  recentEpisodic: 3,
};

interface AssemblyConfig {
  budgets: ContextBudgets;
  minConfidence: number;
  minImportance: ImportanceLevel;
  maxAgeDays: number;
}

const DEFAULT_CONFIG: AssemblyConfig = {
  budgets: DEFAULT_BUDGETS,
  minConfidence: 0.5,
  minImportance: 'medium',
  maxAgeDays: 30,
};

interface AssemblyResult {
  context: ContextAssembly;
  metadata: {
    totalMemories: number;
    totalTokens: number;
    assemblyTime: number;
    budgetsUsed: Record<string, number>;
  };
}

export class ContextAssemblyService {
  private memoryRepo: MemoryRepository;
  private retrievalService: RetrievalService;
  private config: AssemblyConfig;

  constructor(
    memoryRepo: MemoryRepository,
    retrievalService: RetrievalService,
    config: Partial<AssemblyConfig> = {}
  ) {
    this.memoryRepo = memoryRepo;
    this.retrievalService = retrievalService;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async assemble(
    query: string,
    workspace: string,
    customBudgets?: Partial<ContextBudgets>
  ): Promise<AssemblyResult> {
    const startTime = performance.now();
    const budgets = { ...this.config.budgets, ...customBudgets };

    // Gather context from each category
    const [
      userProfile,
      projectKnowledge,
      taskRelevant,
      recentEpisodic,
    ] = await Promise.all([
      this.assembleUserProfile(budgets.userProfile),
      this.assembleProjectKnowledge(workspace, budgets.projectKnowledge),
      this.assembleTaskRelevant(query, workspace, budgets.taskRelevant),
      this.assembleRecentEpisodic(budgets.recentEpisodic),
    ]);

    const context: ContextAssembly = {
      userProfile,
      projectKnowledge,
      taskRelevant,
      recentEpisodic,
      metadata: {
        totalTokens: this.estimateTokens([
          ...userProfile,
          ...projectKnowledge,
          ...taskRelevant,
          ...recentEpisodic,
        ]),
        assembledAt: new Date().toISOString(),
      },
    };

    const assemblyTime = performance.now() - startTime;
    const totalMemories = userProfile.length + projectKnowledge.length + 
      taskRelevant.length + recentEpisodic.length;

    return {
      context,
      metadata: {
        totalMemories,
        totalTokens: context.metadata.totalTokens,
        assemblyTime,
        budgetsUsed: {
          userProfile: userProfile.length,
          projectKnowledge: projectKnowledge.length,
          taskRelevant: taskRelevant.length,
          recentEpisodic: recentEpisodic.length,
        },
      },
    };
  }

  private async assembleUserProfile(budget: number): Promise<Memory[]> {
    // Get core memories: preferences, habits, workflows, identity
    const memories: Memory[] = [];

    const coreMemories = await this.memoryRepo.findByLayer('core', 'active');
    
    // Filter to preference/habit/workflow types
    const relevant = coreMemories.filter(m => 
      ['preference', 'habit', 'workflow', 'identity'].includes(m.type)
    );

    // Sort by confidence and importance
    const sorted = this.rankByQuality(relevant);

    // Apply budget
    return sorted.slice(0, budget);
  }

  private async assembleProjectKnowledge(
    workspace: string, 
    budget: number
  ): Promise<Memory[]> {
    // Get semantic memories for this workspace/project
    const semanticMemories = await this.memoryRepo.findByLayer('semantic', 'active');

    // Filter by workspace and type
    const relevant = semanticMemories.filter(m => {
      const matchesWorkspace = !workspace || m.workspace === workspace;
      const isRelevantType = ['project', 'decision', 'pattern', 'error_solution'].includes(m.type);
      return matchesWorkspace && isRelevantType && this.meetsQualityThreshold(m);
    });

    // Sort by quality
    const sorted = this.rankByQuality(relevant);

    return sorted.slice(0, budget);
  }

  private async assembleTaskRelevant(
    query: string,
    workspace: string,
    budget: number
  ): Promise<Memory[]> {
    // Use retrieval service to find task-relevant memories
    const result = await this.retrievalService.search(
      query,
      'hybrid',
      { 
        layers: ['episodic', 'semantic'],
        workspace,
        status: ['active'],
      },
      { limit: budget * 2 } // Get more to filter
    );

    // Filter and rank
    const memories = result.results
      .filter(r => this.meetsQualityThreshold(r.memory))
      .map(r => r.memory);

    return memories.slice(0, budget);
  }

  private async assembleRecentEpisodic(budget: number): Promise<Memory[]> {
    // Get recent episodic memories
    const episodicMemories = await this.memoryRepo.findByLayer('episodic', 'active');

    // Filter by age and importance
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.maxAgeDays);

    const recent = episodicMemories.filter(m => {
      const memoryDate = new Date(m.createdAt);
      const isRecent = memoryDate >= cutoffDate;
      const isImportant = m.importance === 'high';
      return isRecent && isImportant && this.meetsQualityThreshold(m);
    });

    // Sort by date (newest first)
    const sorted = recent.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sorted.slice(0, budget);
  }

  private meetsQualityThreshold(memory: Memory): boolean {
    // Check confidence
    if (memory.confidence < this.config.minConfidence) {
      return false;
    }

    // Check importance
    const importanceRank: Record<ImportanceLevel, number> = {
      'high': 3,
      'medium': 2,
      'low': 1,
    };
    
    if (importanceRank[memory.importance] < importanceRank[this.config.minImportance]) {
      return false;
    }

    return true;
  }

  private rankByQuality(memories: Memory[]): Memory[] {
    return memories.sort((a, b) => {
      // Primary: confidence
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }

      // Secondary: importance
      const importanceRank = { 'high': 3, 'medium': 2, 'low': 1 };
      if (importanceRank[b.importance] !== importanceRank[a.importance]) {
        return importanceRank[b.importance] - importanceRank[a.importance];
      }

      // Tertiary: freshness
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  private estimateTokens(memories: Memory[]): number {
    // Rough estimate: 1 token ≈ 4 characters
    const totalChars = memories.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  // Format context for different consumers

  formatForPrompt(assembly: ContextAssembly): string {
    const sections: string[] = [];

    if (assembly.userProfile.length > 0) {
      sections.push('## User Profile');
      sections.push(...assembly.userProfile.map(m => `- ${m.content}`));
    }

    if (assembly.projectKnowledge.length > 0) {
      sections.push('## Project Knowledge');
      sections.push(...assembly.projectKnowledge.map(m => `- ${m.content}`));
    }

    if (assembly.taskRelevant.length > 0) {
      sections.push('## Task Context');
      sections.push(...assembly.taskRelevant.map(m => `- ${m.content}`));
    }

    if (assembly.recentEpisodic.length > 0) {
      sections.push('## Recent Activity');
      sections.push(...assembly.recentEpisodic.map(m => `- ${m.content}`));
    }

    return sections.join('\n\n');
  }

  formatForJSON(assembly: ContextAssembly): Record<string, unknown> {
    return {
      userProfile: assembly.userProfile.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        confidence: m.confidence,
      })),
      projectKnowledge: assembly.projectKnowledge.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        workspace: m.workspace,
      })),
      taskRelevant: assembly.taskRelevant.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
      })),
      recentEpisodic: assembly.recentEpisodic.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        createdAt: m.createdAt,
      })),
      metadata: assembly.metadata,
    };
  }
}
