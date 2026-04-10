/**
 * 记忆合并器
 * 负责将情景记忆合并到核心记忆，以及清理过期记忆
 */

import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { appendToCoreMemory, saveCoreMemory } from './writer.js';
import { loadCoreMemory } from './loader.js';
import type { ImportanceLevel } from '../types.js';

// ============ 重要性识别 ============

/** 高重要性触发词 */
const HIGH_IMPORTANCE_KEYWORDS = [
  '重要', '必须', '记住', '铁律', '关键', '核心',
  '一定要', '千万', '绝对', '不可', '禁止',
  '永远', '以后都', '习惯', '偏好', '规则'
];

/** 中重要性触发词 */
const MEDIUM_IMPORTANCE_KEYWORDS = [
  '注意', '记得', '别忘了', '提醒', '建议'
];

/** 停用词（不作为重要性判断依据） */
const STOP_WORDS = ['这个', '那个', '然后', '所以', '因为', '但是', '如果', '虽然'];

/**
 * 智能识别内容重要性
 * 
 * 识别规则：
 * 1. 关键词检测：包含"重要"、"必须"、"铁律"等词 → high
 * 2. 标签检测：tags 包含 'important' 或 '铁律' → high
 * 3. 来源检测：来自洋哥的直接指令 → high
 * 4. 中等关键词：包含"注意"、"记得"等 → medium
 * 5. 默认：low
 */
export function detectImportance(
  content: string, 
  tags: string[] = [],
  source?: string
): ImportanceLevel {
  // 1. 标签检测（优先级最高）
  if (tags.includes('important') || tags.includes('铁律') || tags.includes('important')) {
    return 'high';
  }
  
  // 2. 关键词检测
  const lowerContent = content.toLowerCase();
  
  for (const keyword of HIGH_IMPORTANCE_KEYWORDS) {
    if (content.includes(keyword)) {
      return 'high';
    }
  }
  
  // 3. 来源检测（来自洋哥的指令）
  if (source === 'user' || source === '洋哥') {
    // 用户指令中包含特定模式
    if (content.includes('以后') || content.includes('记住') || content.includes('习惯')) {
      return 'high';
    }
  }
  
  // 4. 中等关键词
  for (const keyword of MEDIUM_IMPORTANCE_KEYWORDS) {
    if (content.includes(keyword)) {
      return 'medium';
    }
  }
  
  // 5. 默认
  return 'medium';
}

/**
 * 检测内容是否为高重要性
 */
export function isHighImportance(content: string, tags: string[] = []): boolean {
  return detectImportance(content, tags) === 'high';
}

/**
 * 将内容沉淀到核心记忆
 */
export async function consolidateMemory(
  memoryRoot: string,
  category: string,
  content: string
): Promise<void> {
  // 验证分类
  const validCategories = ['identity', 'preferences', 'habits', 'workflows'];
  if (!validCategories.includes(category)) {
    throw new Error(`无效的核心记忆分类: ${category}`);
  }
  
  // 格式化内容
  const formattedContent = formatContentForCore(category, content);
  
  // 追加到对应的核心记忆文件
  await appendToCoreMemory(memoryRoot, category, formattedContent);
  
  console.log(`[MemorySystem] 已沉淀到核心记忆 [${category}]`);
}

/**
 * 格式化内容以适应核心记忆
 */
function formatContentForCore(category: string, content: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (category) {
    case 'identity':
      return `\n## 更新 (${timestamp})\n\n${content}\n`;
    
    case 'preferences':
      // 如果内容不是列表格式，转换为列表
      if (!content.startsWith('-')) {
        return `\n- ${content} (${timestamp} 添加)\n`;
      }
      return `\n${content}\n`;
    
    case 'habits':
      if (!content.startsWith('-')) {
        return `\n- ${content} (${timestamp} 添加)\n`;
      }
      return `\n${content}\n`;
    
    case 'workflows':
      return `\n## 更新 (${timestamp})\n\n${content}\n`;
    
    default:
      return `\n${content}\n`;
  }
}

/**
 * 清理过期的情景记忆
 */
export async function cleanupExpired(
  memoryRoot: string,
  retentionDays: number,
  importantRetentionDays: number = 30
): Promise<string[]> {
  const episodicDir = join(memoryRoot, 'episodic');
  const deletedFiles: string[] = [];
  
  try {
    const files = await readdir(episodicDir);
    const now = Date.now();
    const normalThreshold = retentionDays * 24 * 60 * 60 * 1000;
    const importantThreshold = importantRetentionDays * 24 * 60 * 60 * 1000;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = join(episodicDir, file);
      const fileStat = await stat(filePath);
      const fileAge = now - fileStat.mtimeMs;
      
      // 智能检测重要性
      const content = await Bun.file(filePath).text();
      const importance = detectImportanceFromFile(content);
      
      // 根据重要性选择保留时间
      const actualThreshold = importance === 'high' 
        ? importantThreshold 
        : importance === 'medium'
          ? normalThreshold
          : normalThreshold * 0.5; // low 重要性保留更短
      
      if (fileAge > actualThreshold) {
        await unlink(filePath);
        deletedFiles.push(file);
        console.log(`[MemorySystem] 已清理过期记忆: ${file} (importance: ${importance})`);
      }
    }
  } catch (error) {
    console.error('[MemorySystem] 清理过期记忆失败:', error);
  }
  
  return deletedFiles;
}

/**
 * 从文件内容检测重要性
 */
function detectImportanceFromFile(content: string): ImportanceLevel {
  // 1. 检查显式标记
  if (content.includes('importance: high')) {
    return 'high';
  }
  if (content.includes('importance: low')) {
    return 'low';
  }
  
  // 2. 检查标签
  if (content.includes('[important]') || content.includes('标签: 铁律')) {
    return 'high';
  }
  
  // 3. 智能关键词检测
  return detectImportance(content);
}

/**
 * 合并情景记忆到核心记忆
 * 
 * 当情景记忆中的内容被多次引用或标记为高重要性时，
 * 可以自动提升为核心记忆
 */
export async function promoteToCore(
  memoryRoot: string,
  episodicDate: string,
  entryId: string,
  targetCategory: string
): Promise<void> {
  const { loadEpisodicMemory } = await import('./loader.js');
  
  const episodic = await loadEpisodicMemory(memoryRoot, episodicDate);
  if (!episodic) {
    throw new Error(`未找到情景记忆: ${episodicDate}`);
  }
  
  const entry = episodic.entries.find(e => e.id === entryId);
  if (!entry) {
    throw new Error(`未找到条目: ${entryId}`);
  }
  
  await consolidateMemory(memoryRoot, targetCategory, entry.content);
  
  console.log(`[MemorySystem] 已将情景记忆 [${episodicDate}/${entryId}] 提升为核心记忆 [${targetCategory}]`);
}

/**
 * 智能合并：自动识别值得沉淀的内容
 */
export async function smartConsolidate(memoryRoot: string): Promise<string[]> {
  const { loadRecentEpisodic } = await import('./loader.js');
  
  const episodic = await loadRecentEpisodic(memoryRoot, 30);
  const consolidated: string[] = [];
  
  // 统计关键词出现频率
  const keywordCount = new Map<string, number>();
  
  for (const day of episodic) {
    for (const entry of day.entries) {
      // 提取关键词
      const keywords = extractKeywords(entry.content);
      for (const keyword of keywords) {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
      }
    }
  }
  
  // 找出高频关键词（出现 3 次以上）
  const frequentKeywords = Array.from(keywordCount.entries())
    .filter(([_, count]) => count >= 3)
    .map(([keyword]) => keyword);
  
  // 如果有高频关键词，建议沉淀
  if (frequentKeywords.length > 0) {
    console.log('[MemorySystem] 检测到高频内容，建议沉淀:', frequentKeywords);
    consolidated.push(...frequentKeywords);
  }
  
  return consolidated;
}

/**
 * 提取关键词
 */
function extractKeywords(content: string): string[] {
  // 简化实现：提取中文词汇
  const keywords: string[] = [];
  
  // 匹配 2-4 个字的中文词组
  const chinesePattern = /[\u4e00-\u9fa5]{2,4}/g;
  const matches = content.match(chinesePattern) || [];
  
  // 过滤常见停用词
  const stopWords = ['这个', '那个', '然后', '所以', '因为', '但是', '如果', '虽然'];
  
  for (const match of matches) {
    if (!stopWords.includes(match)) {
      keywords.push(match);
    }
  }
  
  return keywords;
}

/**
 * 压缩记忆：合并相似条目
 */
export async function compressMemory(memoryRoot: string): Promise<void> {
  // TODO: 实现记忆压缩算法
  // 1. 识别相似内容
  // 2. 合并为摘要
  // 3. 保留原始引用
  
  console.log('[MemorySystem] 记忆压缩功能待实现');
}