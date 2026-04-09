// Core type definitions for Local Memory System

// ============================================================================
// Memory Layer Types
// ============================================================================

export type MemoryLayer = 'core' | 'semantic' | 'episodic' | 'working';

export type MemoryType = 
  | 'identity' 
  | 'preference' 
  | 'habit' 
  | 'workflow' 
  | 'project' 
  | 'decision' 
  | 'pattern' 
  | 'error_solution' 
  | 'observation' 
  | 'event';

export type MemoryStatus = 
  | 'new' 
  | 'active' 
  | 'superseded' 
  | 'forgotten' 
  | 'archived' 
  | 'reverted';

export type ImportanceLevel = 'high' | 'medium' | 'low';

// ============================================================================
// Core Memory Entity
// ============================================================================

export interface Memory {
  id: string;
  version: number;
  parentId: string | null;
  layer: MemoryLayer;
  type: MemoryType;
  status: MemoryStatus;
  content: string;
  contentHash: string;
  confidence: number;
  importance: ImportanceLevel;
  sourceEventId: string | null;
  workspace: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface CreateMemoryInput {
  layer: MemoryLayer;
  type: MemoryType;
  content: string;
  importance?: ImportanceLevel;
  sourceEventId?: string;
  workspace?: string;
  expiresAt?: string;
}

export interface UpdateMemoryInput {
  content?: string;
  confidence?: number;
  importance?: ImportanceLevel;
  status?: MemoryStatus;
}

// ============================================================================
// Relation Types
// ============================================================================

export type RelationType = 'updates' | 'extends' | 'derives' | 'conflicts' | 'relates';

export interface MemoryRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  confidence: number;
  evidenceRefs: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface CreateRelationInput {
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  confidence?: number;
  evidenceRefs?: string[];
}

// ============================================================================
// Event Types
// ============================================================================

export type EventType = 
  | 'message.updated'
  | 'file.edited'
  | 'session.idle'
  | 'session.compacted'
  | 'git.commit'
  | 'test.result'
  | 'build.result';

export type SourceType = 'opencode' | 'git' | 'manual' | 'system';

export interface IngestionEvent {
  id: string;
  eventId: string;
  batchId: string;
  eventType: EventType;
  sourceType: SourceType;
  sourceRef: string;
  workspace: string | null;
  payload: Record<string, unknown>;
  payloadHash: string;
  status: 'pending' | 'accepted' | 'rejected' | 'processed';
  error: ErrorDetail | null;
  processedAt: string | null;
  createdAt: string;
}

export interface IngestionEventInput {
  eventId: string;
  batchId: string;
  eventType: EventType;
  sourceType: SourceType;
  sourceRef: string;
  workspace?: string;
  payload: Record<string, unknown>;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Classification Types
// ============================================================================

export interface Classification {
  id: string;
  ingestionEventId: string;
  memoryId: string | null;
  worthStoring: boolean;
  layer: MemoryLayer | null;
  type: MemoryType | null;
  confidence: number;
  importance: ImportanceLevel | null;
  classifierVersion: string;
  classifiedAt: string;
}

export interface ClassificationResult {
  worthStoring: boolean;
  layer?: MemoryLayer;
  type?: MemoryType;
  confidence: number;
  importance?: ImportanceLevel;
  reason?: string;
}

// ============================================================================
// Promotion Types
// ============================================================================

export interface Promotion {
  id: string;
  memoryId: string;
  fromLayer: MemoryLayer;
  toLayer: MemoryLayer;
  triggerScores: PromotionScores;
  evidenceRefs: string[];
  status: 'pending' | 'approved' | 'rejected' | 'rolled_back';
  promotedAt: string | null;
  rolledBackAt: string | null;
}

export interface PromotionScores {
  stability: number;
  confidence: number;
  evidenceDiversity: number;
  repetition: number;
  overall: number;
}

// ============================================================================
// Audit Types
// ============================================================================

export type AuditActionType = 
  | 'ingest'
  | 'classify'
  | 'promote'
  | 'rollback'
  | 'project'
  | 'forget'
  | 'update'
  | 'delete';

export interface AuditRecord {
  id: string;
  actionType: AuditActionType;
  entityType: string;
  entityId: string;
  actor: string;
  payload: Record<string, unknown> | null;
  previousState: Record<string, unknown> | null;
  batchId: string | null;
  createdAt: string;
}

export interface AuditContext {
  actor: string;
  batchId?: string;
}

// ============================================================================
// Query Types
// ============================================================================

export interface SearchFilters {
  layers?: MemoryLayer[];
  types?: MemoryType[];
  status?: MemoryStatus[];
  workspace?: string;
  importance?: ImportanceLevel[];
  createdAfter?: string;
  createdBefore?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'created' | 'updated' | 'confidence' | 'relevance';
  orderDirection?: 'asc' | 'desc';
}

export interface SearchResult {
  memory: Memory;
  score: number;
  highlights?: string[];
}

// ============================================================================
// Service Health Types
// ============================================================================

export interface ServiceHealth {
  status: 'ok' | 'degraded' | 'error';
  localOnly: boolean;
  runtimeRoot: string;
  version: string;
  timestamp: string;
  checks: {
    database: HealthCheck;
    projection: HealthCheck;
    provider?: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  latency?: number;
}

// ============================================================================
// Context Assembly Types
// ============================================================================

export interface ContextAssembly {
  userProfile: Memory[];
  projectKnowledge: Memory[];
  taskRelevant: Memory[];
  recentEpisodic: Memory[];
  metadata: {
    totalTokens: number;
    assembledAt: string;
  };
}

export interface ContextBudgets {
  userProfile: number;
  projectKnowledge: number;
  taskRelevant: number;
  recentEpisodic: number;
}
