/**
 * 记忆加载器
 * 负责从文件系统加载记忆数据
 */

import { readFile, exists } from 'fs/promises';
import { join } from 'path';
import type { MemorySnapshot, CoreMemory, EpisodicMemory, WorkingMemory, ContextEntry } from '../types.js';

/**
 * 加载记忆快照
 */
export async function loadSnapshot(memoryRoot: string): Promise<MemorySnapshot | null> {
  const snapshotPath = join(memoryRoot, 'snapshot.md');
  
  try {
    const content = await readFile(snapshotPath, 'utf-8');
    return parseSnapshot(content);
  } catch {
    // 快照不存在，返回 null
    return null;
  }
}

/**
 * 加载核心记忆
 */
export async function loadCoreMemory(memoryRoot: string): Promise<CoreMemory | null> {
  const coreDir = join(memoryRoot, 'core');
  const files = ['identity.md', 'preferences.md', 'habits.md', 'workflows.md'];
  
  const result: any = {};
  
  for (const file of files) {
    const filePath = join(coreDir, file);
    try {
      const content = await readFile(filePath, 'utf-8');
      const key = file.replace('.md', '');
      result[key] = {
        id: `core-${key}`,
        meta: {
          importance: 'high',
          created: new Date().toISOString(),
          expires: null,
          tags: ['core', key]
        },
        content
      };
    } catch {
      // 文件不存在，跳过
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * 加载指定日期的情景记忆
 */
export async function loadEpisodicMemory(memoryRoot: string, date: string): Promise<EpisodicMemory | null> {
  const filePath = join(memoryRoot, 'episodic', `${date}.md`);
  
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseEpisodicFile(content, date);
  } catch {
    return null;
  }
}

/**
 * 加载最近 N 天的情景记忆
 */
export async function loadRecentEpisodic(memoryRoot: string, days: number = 7): Promise<EpisodicMemory[]> {
  const results: EpisodicMemory[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const memory = await loadEpisodicMemory(memoryRoot, dateStr);
    if (memory) {
      results.push(memory);
    }
  }
  
  return results;
}

/**
 * 加载工作记忆
 */
export async function loadWorkingMemory(memoryRoot: string): Promise<WorkingMemory | null> {
  const filePath = join(memoryRoot, 'working', 'current.md');
  
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseWorkingMemory(content);
  } catch {
    return null;
  }
}

/**
 * 加载所有记忆（聚合）
 */
export async function loadMemory(memoryRoot: string): Promise<{
  snapshot: MemorySnapshot | null;
  core: CoreMemory | null;
  episodic: EpisodicMemory[];
  working: WorkingMemory | null;
}> {
  const [snapshot, core, episodic, working] = await Promise.all([
    loadSnapshot(memoryRoot),
    loadCoreMemory(memoryRoot),
    loadRecentEpisodic(memoryRoot, 7),
    loadWorkingMemory(memoryRoot)
  ]);
  
  return { snapshot, core, episodic, working };
}

// ============ 解析函数 ============

/**
 * 解析快照文件
 */
function parseSnapshot(content: string): MemorySnapshot {
  const lines = content.split('\n');
  const snapshot: MemorySnapshot = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    userIdentity: { name: '洋哥', role: '右脑' },
    corePreferences: [],
    coreHabits: [],
    ironRules: [],
    skillMapping: {},
    directoryMap: {},
    recentEpisodes: []
  };
  
  let currentSection = '';
  
  for (const line of lines) {
    // 解析章节标题
    if (line.startsWith('## ')) {
      currentSection = line.substring(3).toLowerCase();
      continue;
    }
    
    // 解析列表项
    if (line.startsWith('- ')) {
      const item = line.substring(2).trim();
      
      switch (currentSection) {
        case '核心偏好':
          snapshot.corePreferences.push(item);
          break;
        case '核心习惯':
          snapshot.coreHabits.push(item);
          break;
        case '铁律':
          snapshot.ironRules.push(item);
          break;
      }
    }
    
    // 解析表格行（技能映射、目录映射）
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(c => c.trim());
      if (cells.length >= 2) {
        if (currentSection.includes('技能')) {
          snapshot.skillMapping[cells[0].trim()] = cells[1].trim();
        } else if (currentSection.includes('目录')) {
          snapshot.directoryMap[cells[0].trim()] = cells[1].trim();
        }
      }
    }
  }
  
  return snapshot;
}

/**
 * 解析情景记忆文件
 */
function parseEpisodicFile(content: string, date: string): EpisodicMemory {
  const entries: any[] = [];
  const lines = content.split('\n');
  
  let currentEntry: any = null;
  
  for (const line of lines) {
    // 解析条目开始
    if (line.startsWith('### ')) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = {
        id: line.substring(4).trim(),
        meta: {
          importance: 'medium',
          created: `${date}T00:00:00`,
          expires: null,
          tags: []
        },
        content: ''
      };
      continue;
    }
    
    // 解析元数据
    if (currentEntry && line.startsWith('> ')) {
      const meta = line.substring(2);
      if (meta.startsWith('importance:')) {
        currentEntry.meta.importance = meta.split(':')[1].trim();
      } else if (meta.startsWith('tags:')) {
        currentEntry.meta.tags = meta.split(':')[1].trim().split(',').map(t => t.trim());
      }
      continue;
    }
    
    // 解析内容
    if (currentEntry && !line.startsWith('---') && line.trim()) {
      currentEntry.content += line + '\n';
    }
  }
  
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return { date, entries };
}

/**
 * 解析工作记忆文件
 */
function parseWorkingMemory(content: string): WorkingMemory | null {
  try {
    // 尝试解析 JSON 格式
    return JSON.parse(content);
  } catch {
    // 尝试解析 Markdown 格式
    const lines = content.split('\n');
    const working: WorkingMemory = {
      sessionId: '',
      startTime: new Date().toISOString(),
      currentTask: null,
      context: [],
      lastActivity: new Date().toISOString()
    };
    
    for (const line of lines) {
      if (line.startsWith('sessionId:')) {
        working.sessionId = line.split(':')[1].trim();
      } else if (line.startsWith('currentTask:')) {
        working.currentTask = line.split(':').slice(1).join(':').trim();
      } else if (line.startsWith('- ')) {
        // 解析上下文条目 (格式: - 👤 [HH:MM] content)
        const entryStr = line.substring(2).trim();
        const role = entryStr.includes('👤') ? 'user' : 'assistant';
        const important = entryStr.includes('⭐');
        // 提取时间（如果有）
        const timeMatch = entryStr.match(/\[(\d{2}:\d{2})\]/);
        const time = timeMatch ? `${new Date().toISOString().split('T')[0]}T${timeMatch[1]}:00` : new Date().toISOString();
        // 提取内容（移除 emoji 和时间标记）
        const content = entryStr.replace(/[👤🤖⭐]/g, '').replace(/\[\d{2}:\d{2}\]/, '').trim();
        
        working.context.push({
          role,
          content,
          time,
          important
        });
      }
    }
    
    return working;
  }
}