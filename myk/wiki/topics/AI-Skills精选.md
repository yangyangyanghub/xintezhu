---
title: "AI-Skills精选"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md"
tags: [Agent, Skills, 提示词]
status: active
---

# AI-Skills精选

> AI 编码助手 Skills 生态中的 8 个高频实用 Skill，覆盖项目管理、开发流程、前端设计、知识查询、笔记管理、视频制作、Skills 开发和科研写作。

## 核心要点
- **planning-with-files**：文件系统持久化上下文，解决 AI 长对话遗忘问题
- **superpowers**：SDD 方法论的 skills 版，强制"探索→计划→执行"流程
- **frontend-design**：解决 AI 生成 UI 千篇一律的问题
- **NotebookLM**：让 AI 直接查询你上传的私有知识库
- **Obsidian Skills**：从 Claude Code 直接操作 Obsidian vault
- **Remotion**：用 React 代码做视频，精确控制每个动画细节
- **Skill Creator**：零代码创建自定义 Skill
- **research-skills**：面向科研的综述/PPT/研究计划工具包

## 详细内容

### 1. planning-with-files — 加强版 plan 模式

**解决痛点**：AI 的上下文窗口（如 200k token）不够用，长对话会遗忘前面内容。

**核心思路**：把 Context Window 当 RAM，把文件系统当磁盘。

**工作机制**：
- 自动创建三个 Markdown 文件：
  - `task_plan.md` — 任务规划
  - `findings.md` — 发现记录
  - `progress.md` — 进度日志
- 每做两步操作就自动保存进度
- 每次重要决策前重新读取计划文件

**适用场景**：复杂项目，需要长时间维护和上下文管理
**安装**：`https://github.com/OthmanAdi/planning-with-files`

### 2. superpowers — SDD 的 skills 版

**解决痛点**：AI 上手就写代码，缺乏探索和规划。

**三板斧流程**：
1. `/superpowers:brainstorm` — 需求探索和设计
2. `/superpowers:write-plan` — 拆分实现计划
3. `/superpowers:execute-plan` — 分批执行

**强制纪律**：TDD（先写测试再写代码，写完代码再重构），代码审查，系统化调试，Git Worktree 管理。

**特点**：技能根据上下文自动触发，不用手动调用。

**适合**：觉得 AI 写代码太莽、经常拆东墙补西墙的开发者
**安装**：`https://github.com/obra/superpowers`

### 3. frontend-design — 告别 AI 千篇一律的 UI

**解决痛点**：AI 生成的前端页面长得都一样（Inter 字体、紫色渐变、圆角卡片）。

**解决方案**：
- 引导 AI 做更大胆的设计决策
- 选择独特字体组合
- 使用有冲击力的配色
- 根据风格匹配实现复杂度

**最佳搭配**：React + Tailwind
**安装**：`https://github.com/anthropics/skills`

**注意**：主要改善视觉设计层面，交互逻辑和业务功能需自行把关。

### 4. NotebookLM — 让 AI 查你的知识库

**解决痛点**：AI 回答缺乏私有知识支撑，容易产生幻觉。

**工作机制**：
- Claude Code 直接与 Google NotebookLM 对话
- 查询你上传的文档，获取带引用来源的回答
- 支持自动追问，挖掘细节和最佳实践
- 认证持久化（登录一次即可）

**使用场景**：把技术文档/设计规范/API 文档上传 → 写代码时直接查询而非猜测

**安装**：`https://github.com/PleasePrompto/notebooklm-skill`

### 5. Obsidian Skills — Obsidian 用户利器

**作者**：kepano（Obsidian 联合创始人 Steph Ango），相当于官方认证。

**能力**：Claude Code 直接创建和编辑 Obsidian 三种原生格式：
- Obsidian Flavored Markdown
- Obsidian Bases
- JSON Canvas

**使用方式**：放入 Obsidian vault 的 `.claude/` 目录下，兼容 Claude Code 和 Codex CLI。

**Stars**：GitHub 8.7k+

**安装**：`https://github.com/kepano/obsidian-skills`

### 6. Remotion — 用代码做视频

**核心原理**：视频的每一帧 = 一个 React 组件。

**能力**：
- 自然语言描述 → 生成 React 代码 → 实时预览 → 渲染 MP4
- 精确控制每个动画细节
- 代码定义一切，修改比传统剪辑方便

**社区增强**：TTS 语音生成、预置幻灯片、代码块展示、图表动画

**安装**：
- 官方：`https://www.remotion.dev/docs/ai/skills`
- 社区增强：`https://github.com/wshuyi/remotion-video-skill`

**建议**：一个 composition 一个 composition 迭代优化。

### 7. Skill Creator — Skill 制造机

**开发者**：Anthropic 官方

**用途**：为特定工作场景创建自定义 Skill。

**引导过程**：问答式定义名称 → 描述 → 触发条件 → 具体指令 → 生成 SKILL.md。

**Skill 结构**：SKILL.md 文件，顶部 YAML 元数据 + Markdown 指令。激活后 <5k token，非常轻量。

**安装**：`https://github.com/anthropics/skills`

### 8. research-skills — 科研写作工具包

**开发者**：鲁工（医学影像 AI 方向研究者）

**包含三个 Skill**：

| Skill | 功能 | 特点 |
|-------|------|------|
| Medical Imaging Review | 医学影像 AI 综述写作 | 7 阶段流程，覆盖 CCTA/肺部/脑部/心脏/病理/眼底，Zotero 集成 |
| Paper Slide Deck | 论文自动转 PPT | 自动检测图片，17 种视觉模板，Nano Banana API，导出 PPTX/PDF |
| Research Proposal | 博士研究计划撰写 | Nature Reviews 规范，中英双语，2000-4000 词，40+ 参考文献 |

**安装**：`https://github.com/luwill/research-skills`

### 安装方式总结

| 方式 | 说明 |
|------|------|
| `/plugin install` | 已上架 marketplace 的 Skills，一键安装 |
| `git clone` 到技能目录 | 手动安装，灵活 |
| `npx skill` 命令 | Vercel 的 npx 方式 |

> **友情提醒**：Skills 宜精不宜多，定期清理不用的 Skills。

## 相关页面
- [[AI-Skill-生态]]
- [[Harness-Engineering-技能工程]]
- [[认知型技能]]
- [[Superpowers]]
- [[AI-内容创作工具]]

## 来源
- [[../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md|推荐我日常高频使用的8个Skills，产出效率翻一倍]]
