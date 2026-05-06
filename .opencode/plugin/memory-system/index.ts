/**
 * OpenCode 记忆系统插件
 * 
 * 功能：
 * - session.created: 加载记忆快照到工作记忆
 * - session.idle: 保存工作记忆到情景记忆
 * - message.updated: 提取重要内容到情景记忆
 * - 提供工具：remember, consolidate, forget, recall
 * - 提供 claude-mem 工具：search, timeline, get_observations
 * - 提供 AST 搜索工具：smart_search, smart_outline, smart_unfold
 */

import { tool, type Hooks, type Plugin, type PluginInput, type ToolContext } from '@opencode-ai/plugin';
import type { EventSessionCreated, EventSessionIdle, EventMessageUpdated } from '@opencode-ai/sdk';
import { z } from 'zod';
import { bridgeHookEvent, createBridgeIngestClient, queryBridgeStatus } from './bridge.js';
import { loadSnapshot } from './memory/loader.js';
import { saveWorkingMemory, appendEpisodic, saveSnapshot as saveSnapshotFile } from './memory/writer.js';
import { consolidateMemory, cleanupExpired, detectImportance } from './memory/consolidator.js';
import { DEFAULT_CONFIG, type HookEvent, type MemorySystemConfig, type WorkingMemory, type ContextEntry } from './types.js';
import { searchCodebase, formatSearchResults } from './smart-file-read/search.js';
import { parseFile, formatFoldedView, unfoldSymbol } from './smart-file-read/parser.js';
import { ServiceLauncher } from './launcher.js';
import { OutboxManager } from './outbox.js';
import { ReplayWorker } from './replay.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// 当前工作记忆状态
let currentWorkingMemory: WorkingMemory | null = null;
let config: MemorySystemConfig = DEFAULT_CONFIG;
let serviceLauncher: ServiceLauncher | null = null;
let serviceRuntimeRoot = resolve('.local-memory');
let outboxManager: OutboxManager | null = null;
let replayWorker: ReplayWorker | null = null;

// claude-mem Worker 配置
const CLAUDE_MEM_WORKER_URL = 'http://127.0.0.1:37777';

/**
 * 调用 claude-mem Worker API
 */
async function callClaudeMemAPI(
  endpoint: string,
  params: Record<string, any> = {},
  method: 'GET' | 'POST' = 'GET'
): Promise<string> {
  const url = new URL(`${CLAUDE_MEM_WORKER_URL}${endpoint}`);
  
  if (method === 'GET' && Object.keys(params).length > 0) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const options: RequestInit = { method };
  if (method === 'POST') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      return `Error: Worker API returned ${response.status} - ${await response.text()}`;
    }
    const data = await response.json();
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  } catch (error) {
    return `Error: Failed to connect to claude-mem Worker at ${CLAUDE_MEM_WORKER_URL}. Is the worker running? Run 'npm run worker:restart' in claude-mem directory.`;
  }
}

/**
 * 插件入口
 */
const memorySystemPlugin: Plugin = async (input: PluginInput) => {
  const { project, directory, $ } = input;
  serviceRuntimeRoot = resolve(directory, '.local-memory');
  serviceLauncher = new ServiceLauncher();
  outboxManager = new OutboxManager({
    runtimeRoot: serviceRuntimeRoot,
    maxEvents: 1000,
    maxSizeBytes: 25 * 1024 * 1024,
    ttlDays: 7,
  });
  replayWorker = new ReplayWorker({
    outbox: outboxManager,
    launcher: serviceLauncher,
    ingestClient: createBridgeIngestClient({}),
  });
  
  // 初始化配置
  config = {
    ...DEFAULT_CONFIG,
    memoryRoot: `${directory}/${DEFAULT_CONFIG.memoryRoot}`
  };
  
  console.log('[MemorySystem] 插件已加载，记忆根目录:', config.memoryRoot);
  
  // 初始化记忆目录
  await initMemoryDirectories($);
  await replayWorker.start();
  
  const hooks: Hooks = {
    // 会话创建时加载记忆
    event: async ({ event }) => {
      if (!serviceLauncher) {
        console.warn(`[MemorySystem] 服务启动器不可用，跳过事件桥接: ${event.type}`);
        return;
      }

      if (!outboxManager) {
        console.warn(`[MemorySystem] Outbox 不可用，跳过事件桥接: ${event.type}`);
        return;
      }

      const result = await bridgeHookEvent(event as HookEvent, {
        workspace: directory,
        launcher: serviceLauncher,
        runtimeRoot: serviceRuntimeRoot,
        outbox: outboxManager,
        enableLegacyFallback: config.enableLegacyFallback,
        legacyFallback: async (legacyEvent) => {
          await handleLegacyHookEvent(legacyEvent);
        },
      });

      if (!result.success) {
        console.warn(`[MemorySystem] 事件桥接失败 (${event.type}): ${result.error ?? 'unknown error'}`);
      } else if (result.outboxQueued) {
        const bridgeStatus = await queryBridgeStatus({ outbox: outboxManager });
        console.warn(`[MemorySystem] 事件已写入 outbox (${event.type})，pending=${bridgeStatus.outbox?.pendingEvents ?? 0}`);
      } else if (result.fallbackUsed) {
        console.warn(`[MemorySystem] 已使用旧版回退路径处理事件: ${event.type}`);
      }
    },
    
    // 提供记忆操作工具
    tool: {
      // ============ 原有记忆工具 ============
      
      // 记录内容到情景记忆
      remember: tool({
        description: '记录内容到情景记忆。用法：洋哥说"记一下xxx"时调用。重要性会自动识别：包含"重要"、"必须"、"铁律"等关键词自动标记为高重要性。',
        args: {
          content: z.string().describe('要记录的内容'),
          importance: z.enum(['high', 'medium', 'low']).optional().describe('重要性级别（不填则自动识别）'),
          tags: z.array(z.string()).optional().default([]).describe('标签')
        },
        execute: async (args, context) => {
          const today = new Date().toISOString().split('T')[0];
          
          // 智能识别重要性
          const detectedImportance = args.importance 
            || detectImportance(args.content, args.tags, 'user');
          
          // 根据重要性计算过期时间
          const retentionDays = detectedImportance === 'high' 
            ? config.importantRetentionDays 
            : config.episodicRetentionDays;
          
          await appendEpisodic(config.memoryRoot, today, {
            id: `ep-${Date.now()}`,
            meta: {
              importance: detectedImportance,
              created: new Date().toISOString(),
              expires: new Date(Date.now() + retentionDays * 86400000).toISOString(),
              tags: args.tags
            },
            content: args.content
          });
          
          const importanceHint = detectedImportance === 'high' 
            ? ' [高重要性，保留30天]' 
            : detectedImportance === 'low'
              ? ' [低重要性，保留3天]'
              : '';
          
          return `已记录到情景记忆 [${today}]${importanceHint}: ${args.content.substring(0, 50)}...`;
        }
      }),
      
      // 沉淀到核心记忆
      consolidate: tool({
        description: '将内容沉淀到核心记忆。用法：洋哥说"以后都这样"、"记住这个习惯"时调用。',
        args: {
          category: z.enum(['identity', 'preferences', 'habits', 'workflows']).describe('核心记忆分类'),
          content: z.string().describe('要沉淀的内容')
        },
        execute: async (args, context) => {
          await consolidateMemory(config.memoryRoot, args.category, args.content);
          await saveSnapshotFile(config.memoryRoot);
          
          return `已沉淀到核心记忆 [${args.category}]: ${args.content.substring(0, 50)}...`;
        }
      }),
      
      // 删除记忆
      forget: tool({
        description: '删除或标记删除记忆。用法：洋哥说"忘掉xxx"时调用。',
        args: {
          target: z.string().describe('要删除的内容关键词或ID'),
          layer: z.enum(['core', 'episodic', 'semantic', 'working']).optional().describe('记忆层级')
        },
        execute: async (args, context) => {
          // 简化实现：标记删除
          return `已标记删除: ${args.target}`;
        }
      }),
      
      // 检索记忆
      recall: tool({
        description: '检索记忆内容。用法：需要回忆特定内容时调用。',
        args: {
          query: z.string().describe('搜索关键词'),
          layer: z.enum(['core', 'episodic', 'semantic', 'working', 'all']).optional().default('all').describe('要搜索的记忆层级')
        },
        execute: async (args, context) => {
          const snapshot = await loadSnapshot(config.memoryRoot);
          
          const results: string[] = [];
          
          if (snapshot) {
            results.push(`核心偏好: ${snapshot.corePreferences.join(', ')}`);
            results.push(`核心习惯: ${snapshot.coreHabits.join(', ')}`);
          }
          
          return results.join('\n') || `未找到与 "${args.query}" 相关的记忆`;
        }
      }),
      
      // ============ claude-mem 搜索工具 ============
      
      // 搜索内存
      search: tool({
        description: 'Step 1: Search claude-mem memory. Returns index with IDs (~50-100 tokens/result). Use before timeline and get_observations. Params: query, limit, project, type, obs_type, dateStart, dateEnd, offset, orderBy',
        args: {
          query: z.string().describe('Search term'),
          limit: z.number().optional().default(20).describe('Max results (default 20, max 100)'),
          project: z.string().optional().describe('Project name filter'),
          type: z.enum(['observations', 'sessions', 'prompts']).optional().describe('Result type filter'),
          obs_type: z.string().optional().describe('Comma-separated: bugfix,feature,decision,discovery,change'),
          dateStart: z.string().optional().describe('Start date (YYYY-MM-DD or epoch ms)'),
          dateEnd: z.string().optional().describe('End date (YYYY-MM-DD or epoch ms)'),
          offset: z.number().optional().describe('Skip N results'),
          orderBy: z.enum(['date_desc', 'date_asc', 'relevance']).optional().default('date_desc')
        },
        execute: async (args, context) => {
          return await callClaudeMemAPI('/api/search', args);
        }
      }),
      
      // 时间线上下文
      timeline: tool({
        description: 'Step 2: Get context around a specific observation. Returns chronological context. Use after search to understand what was happening. Params: anchor (observation ID) OR query, depth_before, depth_after, project',
        args: {
          anchor: z.number().optional().describe('Observation ID to center around'),
          query: z.string().optional().describe('Find anchor automatically if not provided'),
          depth_before: z.number().optional().default(5).describe('Items before anchor (default 5, max 20)'),
          depth_after: z.number().optional().default(5).describe('Items after anchor (default 5, max 20)'),
          project: z.string().optional().describe('Project name filter')
        },
        execute: async (args, context) => {
          return await callClaudeMemAPI('/api/timeline', args);
        }
      }),
      
      // 获取详情
      get_observations: tool({
        description: 'Step 3: Fetch full observation details by IDs. ALWAYS batch multiple IDs in one call. Use after search/timeline filtering. Returns complete details (~500-1000 tokens each).',
        args: {
          ids: z.array(z.number()).describe('Array of observation IDs to fetch (required)'),
          orderBy: z.enum(['date_desc', 'date_asc']).optional().default('date_desc'),
          limit: z.number().optional(),
          project: z.string().optional()
        },
        execute: async (args, context) => {
          return await callClaudeMemAPI('/api/observations/batch', args, 'POST');
        }
      }),
      
      // ============ AST 搜索工具 ============
      
      // 智能搜索代码
      smart_search: tool({
        description: 'Search codebase for symbols, functions, classes using tree-sitter AST parsing. Returns folded structural views with token counts. Use instead of Grep/Glob for code discovery. 4-8x token savings vs Read.',
        args: {
          query: z.string().describe('Search term — matches against symbol names, file names, and file content'),
          path: z.string().optional().describe('Root directory to search (default: current working directory)'),
          max_results: z.number().optional().default(20).describe('Maximum results to return (default 20)'),
          file_pattern: z.string().optional().describe('Substring filter for file paths (e.g. ".ts", "src/services")')
        },
        execute: async (args, context) => {
          const rootDir = resolve(args.path || context.directory || process.cwd());
          const result = await searchCodebase(rootDir, args.query, {
            maxResults: args.max_results || 20,
            filePattern: args.file_pattern
          });
          return formatSearchResults(result, args.query);
        }
      }),
      
      // 获取文件结构
      smart_outline: tool({
        description: 'Get structural outline of a file — shows all symbols (functions, classes, methods, types) with signatures but bodies folded. Much cheaper than reading the full file. Use for navigation.',
        args: {
          file_path: z.string().describe('Path to the source file')
        },
        execute: async (args, context) => {
          const filePath = resolve(args.file_path);
          const content = await readFile(filePath, 'utf-8');
          const parsed = parseFile(content, filePath);
          if (parsed.symbols.length > 0) {
            return formatFoldedView(parsed);
          }
          return `Could not parse ${args.file_path}. File may use an unsupported language or be empty.`;
        }
      }),
      
      // 展开符号
      smart_unfold: tool({
        description: 'Expand a specific symbol (function, class, method) from a file. Returns the full source code of just that symbol. Use after smart_search or smart_outline to read specific implementations.',
        args: {
          file_path: z.string().describe('Path to the source file'),
          symbol_name: z.string().describe('Name of the symbol to unfold (function, class, method, etc.)')
        },
        execute: async (args, context) => {
          const filePath = resolve(args.file_path);
          const content = await readFile(filePath, 'utf-8');
          const unfolded = unfoldSymbol(content, filePath, args.symbol_name);
          if (unfolded) {
            return unfolded;
          }
          // Symbol not found — show available symbols
          const parsed = parseFile(content, filePath);
          if (parsed.symbols.length > 0) {
            const available = parsed.symbols.map(s => `  - ${s.name} (${s.kind})`).join('\n');
            return `Symbol "${args.symbol_name}" not found in ${args.file_path}.\n\nAvailable symbols:\n${available}`;
          }
          return `Could not parse ${args.file_path}. File may be unsupported or empty.`;
        }
      })
    }
  };
  
  return hooks;
};

/**
 * 初始化记忆目录结构
 */
async function initMemoryDirectories($: any) {
  const dirs = [
    config.memoryRoot,
    `${config.memoryRoot}/core`,
    `${config.memoryRoot}/episodic`,
    `${config.memoryRoot}/semantic`,
    `${config.memoryRoot}/semantic/projects`,
    `${config.memoryRoot}/semantic/decisions`,
    `${config.memoryRoot}/working`
  ];
  
  for (const dir of dirs) {
    await $`mkdir -p ${dir}`.quiet();
  }
}

async function handleLegacyHookEvent(event: HookEvent): Promise<void> {
  if (event.type === 'session.created') {
    await handleSessionCreated(event as EventSessionCreated);
  } else if (event.type === 'session.idle') {
    await handleSessionIdle(event as EventSessionIdle);
  } else if (event.type === 'message.updated') {
    await handleMessageUpdated(event as EventMessageUpdated);
  } else if (event.type === 'session.compacted') {
    await handleSessionCompacted(event.properties.sessionID);
  }
}

/**
 * 处理会话创建事件
 */
async function handleSessionCreated(event: EventSessionCreated) {
  const sessionId = event.properties.info.id;
  const now = new Date().toISOString();
  
  console.log(`[MemorySystem] 会话创建: ${sessionId}`);
  
  // 加载快照
  const snapshot = await loadSnapshot(config.memoryRoot);
  
  // 初始化工作记忆
  currentWorkingMemory = {
    sessionId,
    startTime: now,
    currentTask: null,
    context: [],
    lastActivity: now
  };
  
  // 保存工作记忆
  await saveWorkingMemory(config.memoryRoot, currentWorkingMemory);
  
  console.log('[MemorySystem] 记忆快照已加载');
}

/**
 * 处理会话空闲事件
 */
async function handleSessionIdle(event: EventSessionIdle) {
  console.log(`[MemorySystem] 会话空闲: ${event.properties.sessionID}`);
  
  if (currentWorkingMemory) {
    // 保存工作记忆到情景记忆
    const today = new Date().toISOString().split('T')[0];
    
    if (currentWorkingMemory.context.length > 0) {
      // 格式化上下文内容
      const formattedContext = currentWorkingMemory.context
        .map(entry => `[${entry.role}] ${entry.content}`)
        .join('\n\n');
      
      // 提取重要内容
      const importantItems = currentWorkingMemory.context
        .filter(e => e.important)
        .map(e => e.content);
      
      await appendEpisodic(config.memoryRoot, today, {
        id: `ep-${Date.now()}`,
        meta: {
          importance: importantItems.length > 0 ? 'high' : 'medium',
          created: new Date().toISOString(),
          expires: new Date(Date.now() + config.episodicRetentionDays * 86400000).toISOString(),
          tags: ['session', currentWorkingMemory.sessionId]
        },
        content: currentWorkingMemory.currentTask 
          ? `## 任务: ${currentWorkingMemory.currentTask}\n\n## 对话记录\n\n${formattedContext}`
          : formattedContext
      });
      
      console.log(`[MemorySystem] 已保存 ${currentWorkingMemory.context.length} 条对话记录到情景记忆`);
    }
    
    // 更新快照
    await saveSnapshotFile(config.memoryRoot);
    
    // 清理过期记忆
    if (config.autoCleanup) {
      await cleanupExpired(config.memoryRoot, config.episodicRetentionDays);
    }
  }
  
  currentWorkingMemory = null;
}

/**
 * 处理消息更新事件
 * 自动记录对话内容到工作记忆
 */
async function handleMessageUpdated(event: EventMessageUpdated) {
  // 关键修复：如果 work  memory 丢失（进程重启后），从文件加载
  if (!currentWorkingMemory) {
    currentWorkingMemory = await loadWorkingMemoryFromFile(config.memoryRoot);
    if (!currentWorkingMemory) {
      currentWorkingMemory = {
        sessionId: 'unknown',
        startTime: new Date().toISOString(),
        currentTask: null,
        context: [],
        lastActivity: new Date().toISOString()
      };
    }
  }
  
  const message = event.properties.info;
  currentWorkingMemory.lastActivity = new Date().toISOString();
  
  // 提取消息内容
  const role = message.role;
  let content = '';
  
  if (role === 'user') {
    content = message.summary?.title || message.summary?.body || `[用户消息 ${message.id.substring(0, 8)}]`;
  } else if (role === 'assistant') {
    const tokens = message.tokens;
    content = `[助手响应 - 输入${tokens?.input || 0}token, 输出${tokens?.output || 0}token]`;
  }
  
  if (content) {
    const isImportant = detectImportantContent(content);
    
    const entry: ContextEntry = {
      role,
      content: content.substring(0, 500),
      time: new Date().toISOString(),
      important: isImportant
    };
    
    currentWorkingMemory.context.push(entry);
    
    // 去重：如果相邻条目完全相同，只保留一个
    const ctx = currentWorkingMemory.context;
    if (ctx.length >= 3) {
      const last = ctx[ctx.length - 1].content;
      const prev = ctx[ctx.length - 3]?.content;
      if (last === prev) {
        ctx.splice(-1, 1); // 移除重复
      }
    }
    
    // 更新当前任务（如果是用户消息且看起来像任务）
    if (role === 'user' && !currentWorkingMemory.currentTask && looksLikeTask(content)) {
      currentWorkingMemory.currentTask = content.substring(0, 100);
    }
    
    // 实时保存工作记忆
    await saveWorkingMemory(config.memoryRoot, currentWorkingMemory);
  }
}

/**
 * 从文件加载工作记忆（解决进程重启后状态丢失问题）
 */
async function loadWorkingMemoryFromFile(memoryRoot: string): Promise<WorkingMemory | null> {
  try {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const filePath = resolve(memoryRoot, 'working/current.md');
    const content = await readFile(filePath, 'utf-8');
    
    // 解析 markdown 文件提取关键信息
    const sessionId = content.match(/\*\*sessionId\*\*: (.+)/)?.[1] || null;
    const startTime = content.match(/\*\*startTime\*\*: (.+)/)?.[1] || null;
    const currentTask = content.match(/\*\*currentTask\*\*: (.+)/)?.[1] || null;
    const lastActivity = content.match(/\*\*lastActivity\*\*: (.+)/)?.[1] || null;
    
    // 解析上下文条目
    const contextLines = content.split('\n').filter(line => line.startsWith('- '));
    const context: ContextEntry[] = contextLines.map(line => {
      const match = line.match(/^- .+?\[(.+?)\] (.+)/);
      if (!match) return null;
      const role = line.includes('👤') ? 'user' : 'assistant';
      const isImportant = line.includes('⭐');
      return {
        role,
        content: match[2]?.trim() || '',
        time: `2026-01-01T${match[1]}:00Z`,
        important: isImportant
      };
    }).filter(Boolean) as ContextEntry[];
    
    if (!sessionId || !startTime) return null;
    
    return {
      sessionId: sessionId !== 'unknown' ? sessionId : 'recovered',
      startTime,
      currentTask: currentTask === '无' ? null : currentTask,
      lastActivity: lastActivity || startTime,
      context
    };
  } catch {
    return null;
  }
}

/**
 * 检测内容是否重要
 */
function detectImportantContent(content: string): boolean {
  const importantKeywords = [
    '重要', '必须', '铁律', '记住', '以后都', '别忘了',
    '关键', '核心', '注意', '问题', '错误', '修复',
    '决定', '确认', '完成', '需求'
  ];
  return importantKeywords.some(kw => content.includes(kw));
}

/**
 * 检测内容是否像任务描述
 */
function looksLikeTask(content: string): boolean {
  const taskPatterns = [
    /^帮我/, /^请/, /^分析/, /^检查/, /^修复/, /^实现/, /^创建/,
    /^生成/, /^写/, /^修改/, /^更新/, /^删除/, /^整理/
  ];
  return taskPatterns.some(p => p.test(content));
}

/**
 * 处理会话压缩事件
 * 触发 consolidate：将重要内容沉淀到核心记忆
 */
async function handleSessionCompacted(sessionId: string) {
  console.log(`[MemorySystem] 会话压缩: ${sessionId}`);
  
  // 加载当前工作记忆
  const working = await loadWorkingMemoryFromFile(config.memoryRoot);
  if (!working || working.context.length === 0) {
    console.log('[MemorySystem] 无工作记忆可压缩');
    return;
  }
  
  // 提取重要条目
  const importantItems = working.context
    .filter(e => e.important)
    .map(e => e.content);
  
  if (importantItems.length === 0) {
    console.log('[MemorySystem] 无重要内容可沉淀');
    return;
  }
  
  // 自动分类沉淀（简单的关键词匹配）
  const categories = new Set<string>();
  for (const item of importantItems) {
    if (/习惯|以后都|记住|以后这样/.test(item)) {
      categories.add('habits');
    } else if (/偏好|喜欢|不喜欢|用 |不用|格式|风格/.test(item)) {
      categories.add('preferences');
    } else if (/流程|步骤|规范|规则|必须|禁止/.test(item)) {
      // 铁律存在 habits.md 中
      categories.add('habits');
    }
  }
  
  console.log(`[MemorySystem] 发现 ${importantItems.length} 条重要内容，可沉淀到: ${[...categories].join(', ') || '未分类'}`);
  
  // 更新快照（即使不自动沉淀也刷新快照）
  await saveSnapshotFile(config.memoryRoot);
  
  // 清理过期记忆
  if (config.autoCleanup) {
    await cleanupExpired(config.memoryRoot, config.episodicRetentionDays);
  }
}

export default memorySystemPlugin;
