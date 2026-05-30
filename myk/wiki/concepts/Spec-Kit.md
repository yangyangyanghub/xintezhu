---
title: "Spec-Kit"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md"
tags: [Agent, 开发工具, SDD, GitHub]
status: active
---

# Spec-Kit

> GitHub 官方推出的规范驱动开发工具包，专为"规范驱动开发"设计，核心理念是先写规范再写代码。

## 核心要点
- **GitHub 官方出品**：69.1k+ GitHub Stars，权威性高
- **五阶段流程**：constitution → specify → plan → tasks → implement
- **Python 生态**：基于 uv 包管理器，CLI 工具
- **20+ AI 工具兼容**：支持 Claude Code、Copilot、Cursor、Gemini 等

## 详细内容

### 五阶段斜杠命令
```
/speckit.constitution  → 项目宪法：全局约束、开发准则
/speckit.specify       → 功能规范：描述 what 和 why
/speckit.plan          → 技术计划：技术栈和架构选择
/speckit.tasks         → 任务分解：可执行的任务清单
/speckit.implement     → 执行实现
```

### 可选命令
| 命令 | 用途 | 推荐时机 |
|------|------|---------|
| `/speckit.clarify` | 澄清规范中不明确的地方 | `/speckit.plan` 前 |
| `/speckit.analyze` | 跨工件一致性和覆盖率分析 | `/speckit.tasks` 后、`/speckit.implement` 前 |
| `/speckit.checklist` | 生成自定义质量检查清单 | 实施前 |

### 生成的工件
```
.specify/
├── memory/
│   └── constitution.md    # 项目治理原则
├── specs/
│   └── 001-功能名/
│       ├── spec.md        # 功能规范
│       ├── plan.md        # 技术计划
│       ├── tasks.md       # 任务清单
│       ├── research.md    # 技术研究
│       ├── data-model.md  # 数据模型
│       └── contracts/     # API 契约
└── templates/             # 模板文件
```

### 与 OpenSpec 的区别
Spec-Kit 使用**固定阶段流程**（宪法→规范→计划→任务→实现），适合从零开始的项目和标准化开发流程。OpenSpec 使用**灵活动作工作流**（new→continue→apply→archive），更适合增量变更管理。

## 相关页面
- [[规范驱动开发]]
- [[OpenSpec]]
- [[Superpowers]]
- [[AI-研发工具链]]

## 来源
- [[../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md|AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南]]
