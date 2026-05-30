---
title: "OpenSpec"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md"
  - "../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md"
tags: [Agent, 开发工具, SDD, 变更管理]
status: active
---

# OpenSpec

> 由 Fission-AI 团队开发的规范驱动开发工具，专注于灵活的、可自定义的工作流，通过 OPSX 工作流管理变更生命周期。

## 核心要点
- **变更工件系统**：通过 proposal → specs → design → tasks 工件链管理每次变更
- **OPSX 工作流**：`/opsx:new` → `/opsx:continue` → `/opsx:apply` → `/opsx:archive`
- **20+ AI 兼容**：支持 Claude Code、Cursor、Windsurf、OpenCode、Codex 等 20+ 工具
- **轻量灵活**：不同于 Spec-Kit 的固定阶段，OPSX 支持灵活动作和迭代流动

## 详细内容

### OPSX 工作流
```
/opsx:new     → 创建新变更（proposal）
/opsx:continue → 逐步创建工件（specs、design、tasks）
/opsx:apply    → 实施阶段，执行任务并更新工件
/opsx:archive  → 归档完成的功能到知识库
/opsx:ff       → 快速前进，一次性创建所有规划工件
/opsx:explore  → 探索想法，思考问题
/opsx:sync     → 同步到主分支
```

### 目录结构
```
openspec/
├── changes/           # 活跃变更
│   ├── <change名称>/
│   │   ├── specs/     # 功能规范
│   │   ├── proposal.md # 变更提案（为什么、范围、方法）
│   │   ├── design.md   # 技术设计
│   │   └── tasks.md    # 实施任务清单
│   └── archive/       # 已归档变更（知识库）
├── config.yaml        # 项目配置（可选）
├── schemas/           # 自定义工作流模式（可选）
└── .claude/skills/    # 自动生成的技能
```

### 核心原则
1. **只管变更生命周期**：OpenSpec 负责把需求变成 change 工件并驱动生命周期，不代替全部治理
2. **proposal 不是终点**：第一版 proposal 往往不靠谱，宁可废弃重来也不硬着头皮执行
3. **verify ≠ 评审**：`/opsx:verify` 只检查实现与 change 工件是否一致，不是代码或架构评审
4. **apply 有边界**：只做 tasks.md 范围内的事，不允许自行扩需求

### 与 Harness 的集成
在 Java Spring Boot 项目中，OpenSpec 作为 Harness 的变更管理核心，配合 AGENTS.md（导航）、CLAUDE.md（系统提示词）、hooks（硬拦截）和 skills（团队专长）形成完整的可控编码流程。

### 安装方式
```bash
# 全局安装
npm install -g @fission-ai/openspec@latest

# 项目初始化
openspec init
```

## 相关页面
- [[规范驱动开发]]
- [[Spec-Kit]]
- [[Superpowers]]
- [[Harness-Engineering-技能工程]]

## 来源
- [[../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md|AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南]]
- [[../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md|Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code]]
