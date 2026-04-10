/**
 * OpenCode Adapter - Thin forwarding layer
 * 
 * Responsibilities:
 * - Forward OpenCode hooks to Memory Core ingestion
 * - Expose memory tools (remember, recall, forget, consolidate, memory_status)
 * - Handle degraded mode when Memory Core unavailable
 * 
 * Does NOT:
 * - Classify, promote, or rank memories
 * - Write to .memory/ directly
 * - Implement business logic
 */

import type { 
  IngestGateway, 
  IngestResult 
} from '../ingest/gateway.ts';
import type { GovernanceService } from '../governance/index.ts';
import type { RetrievalService } from '../retrieval/service.ts';
import type { ContextAssemblyService } from '../context/assembly.ts';
import type { MemoryCoreService } from '../service/core.ts';
import type { 
  IngestionEventInput, 
  EventType,
  SourceType,
  AuditContext 
} from '../types/index.ts';

// OpenCode event types (simplified)
interface OpenCodeSessionCreated {
  type: 'session.created';
  properties: {
    info: { id: string; [key: string]: unknown };
  };
}

interface OpenCodeMessageUpdated {
  type: 'message.updated';
  properties: {
    info: {
      id: string;
      role: 'user' | 'assistant' | 'system';
      content?: string;
      summary?: { title?: string; body?: string };
      tokens?: { input?: number; output?: number };
      [key: string]: unknown;
    };
  };
}

interface OpenCodeSessionIdle {
  type: 'session.idle';
  properties: {
    sessionID: string;
    duration?: number;
    [key: string]: unknown;
  };
}

interface OpenCodeSessionCompacted {
  type: 'session.compacted';
  properties: {
    sessionID: string;
    [key: string]: unknown;
  };
}

interface OpenCodeFileEdited {
  type: 'file.edited';
  properties: {
    filePath: string;
    changeType: 'created' | 'modified' | 'deleted';
    [key: string]: unknown;
  };
}

type OpenCodeEvent = 
  | OpenCodeSessionCreated 
  | OpenCodeMessageUpdated 
  | OpenCodeSessionIdle 
  | OpenCodeSessionCompacted 
  | OpenCodeFileEdited;

export interface AdapterConfig {
  workspace: string;
  enableForwarding: boolean;
  enableTools: boolean;
}

export interface AdapterStatus {
  healthy: boolean;
  memoryCoreAvailable: boolean;
  degraded: boolean;
  degradedReason?: string;
}

export class OpenCodeAdapter {
  private memoryCore: MemoryCoreService;
  private ingestGateway: IngestGateway;
  private governance: GovernanceService;
  private retrieval: RetrievalService;
  private contextAssembly: ContextAssemblyService;
  private config: AdapterConfig;

  constructor(
    memoryCore: MemoryCoreService,
    ingestGateway: IngestGateway,
    governance: GovernanceService,
    retrieval: RetrievalService,
    contextAssembly: ContextAssemblyService,
    config: Partial<AdapterConfig> = {}
  ) {
    this.memoryCore = memoryCore;
    this.ingestGateway = ingestGateway;
    this.governance = governance;
    this.retrieval = retrieval;
    this.contextAssembly = contextAssembly;
    this.config = {
      workspace: 'default',
      enableForwarding: true,
      enableTools: true,
      ...config,
    };
  }

  async getStatus(): Promise<AdapterStatus> {
    try {
      const health = await this.memoryCore.health();
      const memoryCoreAvailable = health.status !== 'error';
      const semanticAvailable = typeof this.retrieval.isSemanticAvailable === 'function'
        ? await this.retrieval.isSemanticAvailable()
        : true;
      const degraded = health.status === 'degraded' || !semanticAvailable;
      const degradedReason = !semanticAvailable
        ? 'Semantic provider unavailable, keyword-only mode'
        : health.checks.provider?.message;

      return {
        healthy: memoryCoreAvailable && !degraded,
        memoryCoreAvailable,
        degraded,
        degradedReason,
      };
    } catch {
      return {
        healthy: false,
        memoryCoreAvailable: false,
        degraded: true,
        degradedReason: 'Memory Core unreachable',
      };
    }
  }

  // ============================================================================
  // Hook Handlers - Forward to Memory Core
  // ============================================================================

  async onSessionCreated(event: OpenCodeSessionCreated): Promise<IngestResult | null> {
    if (!this.config.enableForwarding) return null;

    const ingestEvent: IngestionEventInput = {
      eventId: `session_created_${event.properties.info.id}`,
      batchId: `batch_${event.properties.info.id}`,
      eventType: 'session.created',
      sourceType: 'opencode',
      sourceRef: event.properties.info.id,
      workspace: this.config.workspace,
      payload: {
        sessionId: event.properties.info.id,
        timestamp: new Date().toISOString(),
      },
    };

    return this.ingestGateway.ingestEvent(ingestEvent);
  }

  async onMessageUpdated(event: OpenCodeMessageUpdated): Promise<IngestResult | null> {
    if (!this.config.enableForwarding) return null;

    const info = event.properties.info;
    
    // Extract content
    const content = info.content || info.summary?.body || info.summary?.title || '';
    
    const ingestEvent: IngestionEventInput = {
      eventId: `msg_${info.id}`,
      batchId: `batch_${info.id}`,
      eventType: 'message.updated',
      sourceType: 'opencode',
      sourceRef: info.id,
      workspace: this.config.workspace,
      payload: {
        messageId: info.id,
        role: info.role,
        content,
        tokens: info.tokens,
      },
    };

    return this.ingestGateway.ingestEvent(ingestEvent);
  }

  async onSessionIdle(event: OpenCodeSessionIdle): Promise<IngestResult | null> {
    if (!this.config.enableForwarding) return null;

    const ingestEvent: IngestionEventInput = {
      eventId: `session_idle_${event.properties.sessionID}`,
      batchId: `batch_${event.properties.sessionID}`,
      eventType: 'session.idle',
      sourceType: 'opencode',
      sourceRef: event.properties.sessionID,
      workspace: this.config.workspace,
      payload: {
        sessionId: event.properties.sessionID,
        duration: event.properties.duration,
        timestamp: new Date().toISOString(),
      },
    };

    return this.ingestGateway.ingestEvent(ingestEvent);
  }

  async onSessionCompacted(event: OpenCodeSessionCompacted): Promise<IngestResult | null> {
    if (!this.config.enableForwarding) return null;

    const ingestEvent: IngestionEventInput = {
      eventId: `session_compact_${event.properties.sessionID}`,
      batchId: `batch_${event.properties.sessionID}`,
      eventType: 'session.compacted',
      sourceType: 'opencode',
      sourceRef: event.properties.sessionID,
      workspace: this.config.workspace,
      payload: {
        sessionId: event.properties.sessionID,
        compactionReason: 'session.end',
        timestamp: new Date().toISOString(),
      },
    };

    return this.ingestGateway.ingestEvent(ingestEvent);
  }

  async onFileEdited(event: OpenCodeFileEdited): Promise<IngestResult | null> {
    if (!this.config.enableForwarding) return null;

    const ingestEvent: IngestionEventInput = {
      eventId: `file_${Date.now()}`,
      batchId: `batch_${Date.now()}`,
      eventType: 'file.edited',
      sourceType: 'opencode',
      sourceRef: event.properties.filePath,
      workspace: this.config.workspace,
      payload: {
        filePath: event.properties.filePath,
        changeType: event.properties.changeType,
        timestamp: new Date().toISOString(),
      },
    };

    return this.ingestGateway.ingestEvent(ingestEvent);
  }

  // ============================================================================
  // Memory Tools - Exposed to OpenCode
  // ============================================================================

  async remember(
    content: string,
    options?: { importance?: 'high' | 'medium' | 'low'; tags?: string[] }
  ): Promise<{ success: boolean; memoryId?: string; error?: string }> {
    if (!this.config.enableTools) {
      return { success: false, error: 'Tools disabled' };
    }

    const status = await this.getStatus();
    if (!status.memoryCoreAvailable) {
      return { success: false, error: 'Memory Core unavailable' };
    }

    try {
      const ingestEvent: IngestionEventInput = {
        eventId: `remember_${Date.now()}`,
        batchId: `batch_${Date.now()}`,
        eventType: 'message.updated',
        sourceType: 'manual',
        sourceRef: 'user_command',
        workspace: this.config.workspace,
        payload: {
          messageId: `remember_${Date.now()}`,
          role: 'user',
          content,
          importance: options?.importance || 'medium',
          tags: options?.tags || [],
        },
      };

      const result = await this.ingestGateway.ingestEvent(ingestEvent);
      
      if (result.accepted) {
        return { success: true, memoryId: result.memoryId };
      } else {
        return { success: false, error: result.error?.message || 'Ingest rejected' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async recall(
    query: string,
    options?: { layer?: 'core' | 'semantic' | 'episodic' | 'working' | 'all'; limit?: number }
  ): Promise<{ success: boolean; results?: string[]; error?: string }> {
    if (!this.config.enableTools) {
      return { success: false, error: 'Tools disabled' };
    }

    const status = await this.getStatus();
    if (!status.memoryCoreAvailable) {
      return { success: false, error: 'Memory Core unavailable' };
    }

    try {
      const result = await this.retrieval.search(
        query,
        'hybrid',
        options?.layer && options.layer !== 'all' ? { layers: [options.layer] } : undefined,
        { limit: options?.limit || 10 }
      );

      const memories = result.results.map(r => r.memory.content);
      
      return {
        success: true,
        results: memories,
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async forget(
    target: string,
    options?: { layer?: 'core' | 'semantic' | 'episodic' | 'working' }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.config.enableTools) {
      return { success: false, error: 'Tools disabled' };
    }

    const status = await this.getStatus();
    if (!status.memoryCoreAvailable) {
      return { success: false, error: 'Memory Core unavailable' };
    }

    try {
      // Search for the memory first
      const result = await this.retrieval.search(target, 'keyword', undefined, { limit: 1 });
      
      if (result.results.length === 0) {
        return { success: false, error: `No memory found matching: ${target}` };
      }

      const memory = result.results[0].memory;
      
      // Use governance to forget
      const forgetResult = await this.governance.forgetMemory(
        memory.id,
        'opencode_adapter',
        `User requested forget: ${target}`
      );

      if (forgetResult.success) {
        return { success: true };
      } else {
        return { success: false, error: forgetResult.error };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async consolidate(
    content: string,
    category: 'identity' | 'preferences' | 'habits' | 'workflows'
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.config.enableTools) {
      return { success: false, error: 'Tools disabled' };
    }

    const status = await this.getStatus();
    if (!status.memoryCoreAvailable) {
      return { success: false, error: 'Memory Core unavailable' };
    }

    try {
      // In real implementation, would create a core memory directly
      // For now, we create a high-importance memory that should promote
      const ingestEvent: IngestionEventInput = {
        eventId: `consolidate_${Date.now()}`,
        batchId: `batch_${Date.now()}`,
        eventType: 'message.updated',
        sourceType: 'manual',
        sourceRef: 'consolidate_command',
        workspace: this.config.workspace,
        payload: {
          messageId: `consolidate_${Date.now()}`,
          role: 'user',
          content,
          importance: 'high',
          category,
          tags: ['consolidated', category],
        },
      };

      const result = await this.ingestGateway.ingestEvent(ingestEvent);
      
      if (result.accepted) {
        return { success: true };
      } else {
        return { success: false, error: result.error?.message || 'Consolidation rejected' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async memory_status(): Promise<{ 
    success: boolean; 
    status?: AdapterStatus;
    error?: string;
  }> {
    try {
      const status = await this.getStatus();
      return { success: true, status };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // ============================================================================
  // Context Assembly
  // ============================================================================

  async getContext(query: string): Promise<{
    success: boolean;
    context?: string;
    metadata?: { totalMemories: number; totalTokens: number };
    error?: string;
  }> {
    if (!this.config.enableTools) {
      return { success: false, error: 'Tools disabled' };
    }

    const status = await this.getStatus();
    if (!status.memoryCoreAvailable) {
      return { success: false, error: 'Memory Core unavailable' };
    }

    try {
      const assembly = await this.contextAssembly.assemble(
        query,
        this.config.workspace
      );

      const formatted = this.contextAssembly.formatForPrompt(assembly.context);

      return {
        success: true,
        context: formatted,
        metadata: {
          totalMemories: assembly.metadata.totalMemories,
          totalTokens: assembly.metadata.totalTokens,
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

}
