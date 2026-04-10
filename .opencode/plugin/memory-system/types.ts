/**
 * 记忆系统类型定义
 * 四层记忆模型：Core, Episodic, Semantic, Working
 */

// ============ 记忆元数据 ============

export type ImportanceLevel = 'high' | 'medium' | 'low';

export interface MemoryMeta {
  importance: ImportanceLevel;
  created: string;          // ISO 日期
  expires: string | null;   // ISO 日期，null = 永不过期
  tags: string[];
  source?: string;          // 来源链接或文件路径
}

// ============ 记忆条目 ============

export interface MemoryEntry {
  id: string;
  meta: MemoryMeta;
  content: string;
}

// ============ 四层记忆结构 ============

// Core 层 - 核心记忆（永久）
export interface CoreMemory {
  identity: MemoryEntry;      // 身份设定
  preferences: MemoryEntry;   // 使用偏好
  habits: MemoryEntry;        // 工作习惯
  workflows: MemoryEntry;     // 核心流程
}

// Episodic 层 - 情景记忆（有时效）
export interface EpisodicMemory {
  date: string;               // YYYY-MM-DD
  entries: MemoryEntry[];
  summary?: string;           // 当日摘要
}

// Semantic 层 - 语义记忆（知识型）
export interface SemanticMemory {
  projects: Map<string, MemoryEntry>;  // 项目上下文
  decisions: Map<string, MemoryEntry>; // 重要决策
}

// Working 层 - 工作记忆（当前任务）
export interface ContextEntry {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  important?: boolean;  // 是否重要内容
}

export interface WorkingMemory {
  sessionId: string;
  startTime: string;
  currentTask: string | null;
  context: ContextEntry[];  // 改为结构化条目
  lastActivity: string;
}

// ============ 记忆快照 ============

export interface MemorySnapshot {
  version: string;
  lastUpdated: string;
  userIdentity: {
    name: string;
    role: string;
  };
  corePreferences: string[];     // 核心偏好（前5条）
  coreHabits: string[];          // 核心习惯（前5条）
  ironRules: string[];           // 铁律
  skillMapping: Record<string, string>;
  directoryMap: Record<string, string>;
  recentEpisodes: string[];      // 最近7天的情景记忆日期
}

// ============ 触发命令 ============

export type MemoryCommand = 
  | 'remember'    // 记一下 xxx
  | 'consolidate' // 以后都这样
  | 'forget'      // 忘掉 xxx
  | 'recall';     // 回忆 xxx

export interface MemoryTrigger {
  command: MemoryCommand;
  content: string;
  sessionId: string;
  timestamp: string;
}

// ============ 插件配置 ============

export interface MemorySystemConfig {
  /** 情景记忆保留天数 */
  episodicRetentionDays: number;
  /** 重要记忆延长天数 */
  importantRetentionDays: number;
  /** 快照最大 token 数 */
  maxSnapshotTokens: number;
  /** 是否启用自动清理 */
  autoCleanup: boolean;
  /** 记忆存储根目录 */
  memoryRoot: string;
  /** 是否启用旧版直写回退 */
  enableLegacyFallback: boolean;
}

export const DEFAULT_CONFIG: MemorySystemConfig = {
  episodicRetentionDays: 7,
  importantRetentionDays: 30,
  maxSnapshotTokens: 2000,
  autoCleanup: true,
  memoryRoot: '.memory',
  enableLegacyFallback: false,
};

// ============ 自动摄入桥接类型 ============

export type EventType =
  | 'message.updated'
  | 'file.edited'
  | 'session.created'
  | 'session.idle'
  | 'session.compacted'
  | 'git.commit'
  | 'test.result'
  | 'build.result';

export type SourceType = 'opencode' | 'git' | 'manual' | 'system';

export interface IngestionEventInput {
  eventId: string;
  batchId: string;
  eventType: EventType;
  sourceType: SourceType;
  sourceRef: string;
  workspace?: string;
  payload: Record<string, unknown>;
}

export interface OutboxEntry extends IngestionEventInput {
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export interface OutboxOptions {
  runtimeRoot: string;
  maxEvents?: number;
  maxSizeBytes?: number;
  ttlDays?: number;
}

export interface OutboxStats {
  pendingEvents: number;
  totalSizeBytes: number;
  maxEvents: number;
  maxSizeBytes: number;
  ttlDays: number;
  oldestTimestamp?: string;
  newestTimestamp?: string;
  droppedEvents: number;
  outboxDir: string;
}

export interface EventStatusResult {
  found: boolean;
  eventId: string;
  status?: string;
}

export interface IngestDeliveryResponse {
  success: boolean;
  status?: number;
  error?: string;
}

export interface ReplayResult {
  replayed: number;
  skippedDuplicates: number;
  remaining: number;
  stoppedReason: 'empty' | 'service_unavailable' | 'delivery_failed' | 'running';
  lastError?: string;
}

export interface HookSessionCreatedEvent {
  type: 'session.created';
  properties: {
    info: {
      id: string;
      [key: string]: unknown;
    };
  };
}

export interface HookMessageUpdatedEvent {
  type: 'message.updated';
  properties: {
    info: {
      id: string;
      role: 'user' | 'assistant' | 'system';
      content?: string;
      summary?: {
        title?: string;
        body?: string;
      };
      tokens?: {
        input?: number;
        output?: number;
      };
      [key: string]: unknown;
    };
  };
}

export interface HookSessionIdleEvent {
  type: 'session.idle';
  properties: {
    sessionID: string;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface HookSessionCompactedEvent {
  type: 'session.compacted';
  properties: {
    sessionID: string;
    [key: string]: unknown;
  };
}

export interface HookFileEditedEvent {
  type: 'file.edited';
  properties: {
    filePath: string;
    changeType: 'created' | 'modified' | 'deleted';
    [key: string]: unknown;
  };
}

export type HookEvent =
  | HookSessionCreatedEvent
  | HookMessageUpdatedEvent
  | HookSessionIdleEvent
  | HookSessionCompactedEvent
  | HookFileEditedEvent;

export interface BridgeDeliveryResult {
  success: boolean;
  fallbackUsed: boolean;
  status?: number;
  error?: string;
  outboxQueued?: boolean;
  ingestionEvent?: IngestionEventInput;
}
