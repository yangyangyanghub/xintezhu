---
title: "AI编程规范框架对比"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md"
tags: [Agent, 开发工具, 对比, SDD, 选型决策]
status: active
---

# AI编程规范框架对比

> Spec-Kit（GitHub 官方）、OpenSpec（Fission-AI）、Superpowers（obra）三大 AI 编码规范框架的深度对比，含架构分析、功能矩阵与协同实践。

## 核心要点
- **三者定位不同**：Spec-Kit 解决"按什么规矩干"（建筑规范手册），OpenSpec 解决"改了什么"（施工变更单），Superpowers 解决"怎么干"（施工队工作手册）
- **Spec-Kit**：GitHub 官方，69.1k+ Stars，固定五阶段流程，适合从零开始项目
- **OpenSpec**：Fission-AI，23.7k+ Stars，灵活 OPSX 工作流，20+ AI 兼容，适合增量变更
- **Superpowers**：50k+ Stars，强制 TDD + 技能系统 + 子代理，适合代码质量要求高的团队
- **协同最佳实践**：Spec-Kit 管宏观规范 + OpenSpec 管每次变更 + Superpowers 管每次执行

## 详细内容

### 功能矩阵对比

| 对比维度 | [[Spec-Kit]] | [[OpenSpec]] | [[Superpowers]] |
|---------|-------------|-------------|----------------|
| **开发者** | GitHub 官方 | Fission-AI 社区 | obra/jesse |
| **核心定位** | 规范驱动框架 | 轻量变更管理 | 执行方法论 |
| **Stars** | 69.1k+ | 23.7k+ | 50k+ |
| **技术栈** | Python (uv) | TypeScript (npm) | Markdown + JS Plugin |
| **工作流** | 固定五阶段 | 灵活 OPSX 动作 | 技能系统自动触发 |
| **核心命令** | constitution/specify/plan/tasks/implement | new/continue/apply/archive | brainstorm/write-plan/execute-plan |
| **AI 兼容性** | 20+ 工具 | 20+ 工具 | Claude Code/OpenCode/Codex |
| **TDD** | 不强制 | 不强制 | 强制 TDD-first |
| **Sub-agents** | 不支持 | 不支持 | 支持 |
| **Git Worktree** | 不支持 | 不支持 | 支持 |
| **知识管理** | 项目知识沉淀 | 变更归档为知识库 | 技能可演进 |
| **适用场景** | 从零开始标准化项目 | 日常增量变更管理 | 高质量代码 + 复杂任务 |

### 架构特征分析

#### Spec-Kit — 建筑规范手册
```
.specify/
├── memory/constitution.md    ← 项目宪法（全局约束）
├── specs/001-功能名/          ← 每个功能独立工件集
│   ├── spec.md               ← what & why（不涉及技术）
│   ├── plan.md               ← 技术方案
│   ├── tasks.md              ← 可执行任务清单
│   └── contracts/            ← API 契约
└── templates/                 ← 标准化模板
```
- **优势**：结构最清晰，阶段划分最明确，适合团队协作
- **局限**：流程刚性强，不太适合快速迭代场景

#### OpenSpec — 施工变更单
```
openspec/
├── changes/
│   ├── active-change/
│   │   ├── proposal.md       ← 为什么改、改的范围
│   │   ├── specs/            ← 功能规范
│   │   ├── design.md         ← 技术设计
│   │   └── tasks.md          ← 任务清单
│   └── archive/              ← 已完成变更归档
└── specs/                     ← 当前系统如何工作
```
- **优势**：灵活性强，支持迭代流动，变更可追溯
- **局限**：无宪法/全局约束，需配合 AGENTS.md 等补充

#### Superpowers — 施工队工作手册
```
.claude/skills/superpowers/
├── brainstorming/             ← 需求探索
├── writing-plans/             ← 编写计划
├── executing-plans/           ← 执行计划
├── test-driven-development/   ← TDD
├── systematic-debugging/      ← 调试
├── receiving-code-review/     ← 接收审查反馈
├── requesting-code-review/    ← 发起审查
├── using-git-worktrees/       ← 工作树隔离
└── ...（12+ 子技能）
```
- **优势**：代码质量保障最高，上下文自动管理
- **局限**：不是文档管理工具，需配合 Spec-Kit/OpenSpec 管理知识

### 协同最佳实践

三者在实际项目中可以组合使用：

```
Spec-Kit（宪法层） ── 定义项目全局约束和开发准则
       │
       ▼
OpenSpec（变更层） ─── 管理每次增量变更的生命周期
       │
       ▼
Superpowers（执行层） ─ 每次代码实现的工程纪律
```

**具体协同方式**：
1. **Spec-Kit** 建立项目宪法和初始架构规范（constitution + plan）
2. **OpenSpec** 管理每个增量变更的 propose → apply → verify → archive
3. **Superpowers** 在 apply 阶段强制执行 TDD、代码审查、验证纪律

### 选型指南

| 场景 | 推荐方案 |
|------|---------|
| 从零开始全新项目 | [[Spec-Kit]] 主导 |
| 有历史包袱的增量改造 | [[OpenSpec]] 主导 |
| 代码质量要求极高的团队 | [[Superpowers]] 主导 |
| 复杂项目需要全流程管控 | 三者协同：Spec-Kit + OpenSpec + Superpowers |
| 个人开发者快速迭代 | [[OpenSpec]] + [[Superpowers]] |

## 相关页面
- [[规范驱动开发]]
- [[Spec-Kit]]
- [[OpenSpec]]
- [[Superpowers]]
- [[Harness-Engineering-技能工程]]
- [[Harness-OpenSpec-最佳实践]]
- [[AI-研发工具链]]

## 来源
- [[../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md|AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南]]
