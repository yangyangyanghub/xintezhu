import type { 
  IngestionEvent, 
  ClassificationResult, 
  MemoryLayer, 
  MemoryType, 
  ImportanceLevel,
  CreateMemoryInput 
} from '../types/index.ts';
import type { MemoryRepository } from '../repository/memory.ts';
import type { EmbeddingRepository } from '../repository/embedding.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { ProviderRouter } from '../provider/router.ts';

// Rule-based classifier - no model dependency for baseline

interface ClassificationRule {
  name: string;
  condition: (event: IngestionEvent) => boolean;
  classify: (event: IngestionEvent) => ClassificationResult;
  priority: number;
}

export class ClassificationService {
  private memoryRepo: MemoryRepository;
  private ingestionRepo: IngestionRepository;
  private embeddingRepo?: EmbeddingRepository;
  private providerRouter?: ProviderRouter;
  private version = '1.0.0-rule-based';

  // High importance keywords (Chinese and English)
  private highImportanceKeywords = [
    '重要', '必须', '铁律', '记住', '以后都', '永远',
    '关键', '核心', '一定要', '千万', '绝对', '不可', '禁止',
    '习惯', '偏好', '规则', '决定', '重要',
    'important', 'must', 'always', 'never', 'critical', 'key',
    'habit', 'preference', 'rule', 'decision'
  ];

  private rules: ClassificationRule[] = [
    // Rule 1: Noise filtering - transient/short messages
    {
      name: 'noise-filter',
      condition: (event) => {
        if (event.sourceType === 'manual') {
          return false;
        }
        const content = this.extractContent(event);
        return content.length < 10 || /^我先试试|我看看|ok|好的$/.test(content);
      },
      classify: () => ({
        worthStoring: false,
        confidence: 0.9,
        reason: 'noise',
      }),
      priority: 100,
    },

    // Rule 2: Stable preferences
    {
      name: 'preference-detection',
      condition: (event) => {
        const content = this.extractContent(event);
        const hasPrefKeywords = /喜欢|习惯|偏好|preference|habit/i.test(content);
        const hasStabilityMarkers = /永远|总是|一直|always|never/i.test(content);
        const hasImportance = this.hasHighImportance(content);
        return hasPrefKeywords && (hasStabilityMarkers || hasImportance);
      },
      classify: (event) => ({
        worthStoring: true,
        layer: 'episodic',
        type: 'preference',
        confidence: 0.85,
        importance: 'high',
      }),
      priority: 90,
    },

    // Rule 3: Rules and conventions
    {
      name: 'rule-detection',
      condition: (event) => {
        const content = this.extractContent(event);
        return /规则|约定|必须|应该|rule|convention|must|should/i.test(content) &&
               content.length > 50;
      },
      classify: () => ({
        worthStoring: true,
        layer: 'episodic',
        type: 'observation',
        confidence: 0.75,
        importance: 'high',
      }),
      priority: 85,
    },

    // Rule 4: Architectural decisions
    {
      name: 'decision-detection',
      condition: (event) => {
        const content = this.extractContent(event);
        return /决定|选择|使用.*因为|decision|choose.*because/i.test(content) &&
               content.length > 80;
      },
      classify: () => ({
        worthStoring: true,
        layer: 'episodic',
        type: 'decision',
        confidence: 0.8,
        importance: 'high',
      }),
      priority: 80,
    },

    // Rule 5: File edits
    {
      name: 'file-edit',
      condition: (event) => event.eventType === 'file.edited',
      classify: (event) => ({
        worthStoring: true,
        layer: 'working',
        type: 'observation',
        confidence: 0.6,
        importance: 'medium',
      }),
      priority: 50,
    },

    // Rule 6: Test results
    {
      name: 'test-result',
      condition: (event) => event.eventType === 'test.result',
      classify: (event) => {
        const payload = event.payload as { status?: string; testsFailed?: number };
        const isFailure = payload.status === 'failed' || (payload.testsFailed && payload.testsFailed > 0);
        return {
          worthStoring: true,
          layer: 'episodic',
          type: 'event',
          confidence: isFailure ? 0.6 : 0.4,
          importance: isFailure ? 'medium' : 'low',
        };
      },
      priority: 45,
    },

    // Rule 7: Build results
    {
      name: 'build-result',
      condition: (event) => event.eventType === 'build.result',
      classify: (event) => {
        const payload = event.payload as { status?: string };
        const isFailure = payload.status === 'failure';
        return {
          worthStoring: true,
          layer: 'episodic',
          type: 'event',
          confidence: isFailure ? 0.55 : 0.4,
          importance: isFailure ? 'medium' : 'low',
        };
      },
      priority: 44,
    },

    // Rule 8: Session events
    {
      name: 'session-event',
      condition: (event) => 
        event.eventType === 'session.idle' || 
        event.eventType === 'session.compacted',
      classify: () => ({
        worthStoring: true,
        layer: 'episodic',
        type: 'event',
        confidence: 0.4,
        importance: 'low',
      }),
      priority: 30,
    },

    // Rule 9: Git commits
    {
      name: 'git-commit',
      condition: (event) => event.eventType === 'git.commit',
      classify: () => ({
        worthStoring: true,
        layer: 'episodic',
        type: 'event',
        confidence: 0.5,
        importance: 'medium',
      }),
      priority: 40,
    },

    // Rule 10: Default - message updates
    {
      name: 'default-message',
      condition: (event) => event.eventType === 'message.updated',
      classify: (event) => {
        const content = this.extractContent(event);
        const hasImportance = this.hasHighImportance(content);
        return {
          worthStoring: true,
          layer: 'episodic',
          type: 'observation',
          confidence: hasImportance ? 0.5 : 0.3,
          importance: hasImportance ? 'medium' : 'low',
        };
      },
      priority: 10,
    },
  ];

  constructor(
    memoryRepo: MemoryRepository,
    ingestionRepo: IngestionRepository,
    embeddingRepo?: EmbeddingRepository,
    providerRouter?: ProviderRouter,
  ) {
    this.memoryRepo = memoryRepo;
    this.ingestionRepo = ingestionRepo;
    this.embeddingRepo = embeddingRepo;
    this.providerRouter = providerRouter;
  }

  async classify(event: IngestionEvent): Promise<ClassificationResult> {
    // Sort rules by priority (highest first)
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

    // Find first matching rule
    for (const rule of sortedRules) {
      if (rule.condition(event)) {
        const result = rule.classify(event);
        console.log(`[Classifier] Matched rule '${rule.name}' for event ${event.id}`);
        return result;
      }
    }

    // Default: don't store
    return {
      worthStoring: false,
      confidence: 0.5,
      reason: 'no_matching_rule',
    };
  }

  async classifyAndStore(event: IngestionEvent): Promise<void> {
    // Classify
    const result = await this.classify(event);

    // Update ingestion status
    await this.ingestionRepo.updateStatus(
      event.id,
      result.worthStoring ? 'accepted' : 'rejected'
    );

    if (!result.worthStoring) {
      console.log(`[Classifier] Event ${event.id} filtered: ${result.reason}`);
      return;
    }

    // Create memory
    const memoryInput: CreateMemoryInput = {
      layer: result.layer || 'episodic',
      type: result.type || 'observation',
      content: this.extractContent(event),
      importance: result.importance || 'medium',
      sourceEventId: event.id,
      workspace: event.workspace,
    };

    const memory = await this.memoryRepo.create(memoryInput);

    // Update confidence
    const memoryStatus = 'active';
    await this.memoryRepo.update(memory.id, {
      confidence: result.confidence,
      status: memoryStatus,
    });

    if (memoryStatus === 'active' && this.embeddingRepo && this.providerRouter) {
      try {
        const provider = this.providerRouter.getEmbeddingProvider();
        if (provider && await provider.isHealthy()) {
          const embedding = await provider.embed(memory.content);
          await this.embeddingRepo.save(memory.id, embedding, {
            name: provider.name,
            version: provider.version,
            dimensions: provider.dimensions,
          });
        }
      } catch (error) {
        console.warn(`[Classifier] Failed to persist embedding for memory ${memory.id}: ${error}`);
      }
    }

    // Mark ingestion as processed
    await this.ingestionRepo.markProcessed(event.id, memory.id);

    console.log(`[Classifier] Created memory ${memory.id} from event ${event.id}`);
  }

  getVersion(): string {
    return this.version;
  }

  private extractContent(event: IngestionEvent): string {
    const payload = event.payload;
    
    // Try common content fields
    if (typeof payload.content === 'string') {
      return payload.content;
    }
    if (typeof payload.message === 'string') {
      return payload.message;
    }
    if (typeof payload.summary === 'string') {
      return payload.summary;
    }
    
    // For structured content
    if (payload.summary && typeof payload.summary === 'object') {
      const s = payload.summary as { title?: string; body?: string };
      return `${s.title || ''} ${s.body || ''}`.trim();
    }

    // Fallback: JSON representation
    return JSON.stringify(payload);
  }

  private hasHighImportance(content: string): boolean {
    return this.highImportanceKeywords.some(kw => 
      content.toLowerCase().includes(kw.toLowerCase())
    );
  }
}
