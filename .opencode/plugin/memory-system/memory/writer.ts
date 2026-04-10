/**
 * 记忆写入器
 * 负责将记忆数据写入文件系统
 */

import { writeFile, appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { MemorySnapshot, WorkingMemory, MemoryEntry } from '../types.js';

/**
 * 保存工作记忆
 */
export async function saveWorkingMemory(memoryRoot: string, working: WorkingMemory): Promise<void> {
  const workingDir = join(memoryRoot, 'working');
  const filePath = join(workingDir, 'current.md');
  
  await mkdir(workingDir, { recursive: true });
  
  // 格式化上下文条目
  const contextLines = working.context.map(entry => {
    const roleEmoji = entry.role === 'user' ? '👤' : '🤖';
    const importantMark = entry.important ? ' ⭐' : '';
    return `- ${roleEmoji}${importantMark} [${entry.time.split('T')[1]?.substring(0, 5) || ''}] ${entry.content}`;
  }).join('\n');
  
  const content = `# 工作记忆

> 当前会话的临时记忆

---

**sessionId**: ${working.sessionId}
**startTime**: ${working.startTime}
**currentTask**: ${working.currentTask || '无'}
**lastActivity**: ${working.lastActivity}

## 上下文 (${working.context.length} 条)

${contextLines || '(暂无记录)'}
`;
  
  await writeFile(filePath, content, 'utf-8');
}

/**
 * 追加情景记忆
 */
export async function appendEpisodic(memoryRoot: string, date: string, entry: MemoryEntry): Promise<void> {
  const episodicDir = join(memoryRoot, 'episodic');
  const filePath = join(episodicDir, `${date}.md`);
  
  await mkdir(episodicDir, { recursive: true });
  
  const entryContent = `
### ${entry.id}

> importance: ${entry.meta.importance}
> tags: ${entry.meta.tags.join(', ')}
> created: ${entry.meta.created}

${entry.content}

---

`;
  
  await appendFile(filePath, entryContent, 'utf-8');
}

/**
 * 保存记忆快照
 */
export async function saveSnapshot(memoryRoot: string): Promise<void> {
  const { loadCoreMemory, loadRecentEpisodic } = await import('./loader.js');
  
  const core = await loadCoreMemory(memoryRoot);
  const episodic = await loadRecentEpisodic(memoryRoot, 7);
  
  const snapshot: MemorySnapshot = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    userIdentity: { name: '洋哥', role: '右脑' },
    corePreferences: extractPreferences(core),
    coreHabits: extractHabits(core),
    ironRules: extractIronRules(core),
    skillMapping: {},
    directoryMap: {},
    recentEpisodes: episodic.map(e => e.date)
  };
  
  const content = generateSnapshotContent(snapshot);
  const filePath = join(memoryRoot, 'snapshot.md');
  
  await writeFile(filePath, content, 'utf-8');
}

/**
 * 保存核心记忆
 */
export async function saveCoreMemory(
  memoryRoot: string, 
  category: string, 
  content: string
): Promise<void> {
  const coreDir = join(memoryRoot, 'core');
  const filePath = join(coreDir, `${category}.md`);
  
  await mkdir(coreDir, { recursive: true });
  
  await writeFile(filePath, content, 'utf-8');
}

/**
 * 追加到核心记忆
 */
export async function appendToCoreMemory(
  memoryRoot: string,
  category: string,
  content: string
): Promise<void> {
  const coreDir = join(memoryRoot, 'core');
  const filePath = join(coreDir, `${category}.md`);
  
  await mkdir(coreDir, { recursive: true });
  
  const entryContent = `\n${content}\n`;
  await appendFile(filePath, entryContent, 'utf-8');
}

/**
 * 保存项目上下文
 */
export async function saveProjectContext(
  memoryRoot: string,
  projectName: string,
  context: string
): Promise<void> {
  const semanticDir = join(memoryRoot, 'semantic', 'projects');
  const filePath = join(semanticDir, `${projectName}.md`);
  
  await mkdir(semanticDir, { recursive: true });
  
  await writeFile(filePath, context, 'utf-8');
}

/**
 * 保存决策记录
 */
export async function saveDecision(
  memoryRoot: string,
  decisionId: string,
  content: string
): Promise<void> {
  const decisionsDir = join(memoryRoot, 'semantic', 'decisions');
  const filePath = join(decisionsDir, `${decisionId}.md`);
  
  await mkdir(decisionsDir, { recursive: true });
  
  await writeFile(filePath, content, 'utf-8');
}

// ============ 辅助函数 ============

/**
 * 从核心记忆提取偏好
 */
function extractPreferences(core: any): string[] {
  if (!core?.preferences?.content) return [];
  
  const lines = core.preferences.content.split('\n');
  const preferences: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('- ')) {
      preferences.push(line.substring(2).trim());
    }
  }
  
  return preferences.slice(0, 5);
}

/**
 * 从核心记忆提取习惯
 */
function extractHabits(core: any): string[] {
  if (!core?.habits?.content) return [];
  
  const lines = core.habits.content.split('\n');
  const habits: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('- ')) {
      habits.push(line.substring(2).trim());
    }
  }
  
  return habits.slice(0, 5);
}

/**
 * 从核心记忆提取铁律
 */
function extractIronRules(core: any): string[] {
  if (!core?.habits?.content) return [];
  
  const lines = core.habits.content.split('\n');
  const rules: string[] = [];
  let inIronRules = false;
  
  for (const line of lines) {
    if (line.includes('铁律')) {
      inIronRules = true;
      continue;
    }
    if (inIronRules && line.startsWith('- ')) {
      rules.push(line.substring(2).trim());
    }
    if (inIronRules && line.startsWith('## ')) {
      break;
    }
  }
  
  return rules;
}

/**
 * 生成快照内容
 */
function generateSnapshotContent(snapshot: MemorySnapshot): string {
  return `# 记忆快照

> AI启动时一次性加载，包含核心记忆聚合
> 最后更新：${snapshot.lastUpdated.split('T')[0]}

---

## 用户画像

- **名字**：${snapshot.userIdentity.name}（${snapshot.userIdentity.role}）
- **AI搭档**：阿辛（左脑、辛特助）
- **协作模式**：洋哥主导，阿辛落地

## 核心偏好

${snapshot.corePreferences.map(p => `- ${p}`).join('\n')}

## 核心习惯

${snapshot.coreHabits.map(h => `- ${h}`).join('\n')}

## 铁律

${snapshot.ironRules.map(r => `- ${r}`).join('\n')}

## 技能映射

| 触发词 | 技能 |
|-------|------|
${Object.entries(snapshot.skillMapping).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## 目录速查

| 用途 | 目录 |
|------|------|
${Object.entries(snapshot.directoryMap).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## 最近情景记忆

${snapshot.recentEpisodes.map(d => `- ${d}`).join('\n')}
`;
}