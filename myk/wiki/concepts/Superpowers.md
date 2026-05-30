---
title: "Superpowers"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md"
  - "../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md"
tags: [Agent, 开发工具, SDD, Skills]
status: active
---

# Superpowers

> 由 Jesse Vincent（obra）开发的 AI 编程方法论工具包，核心是让 AI 像高级工程师一样工作，通过 Skills 系统引导 AI 执行最佳实践。

## 核心要点
- **方法论而非工具**：专注于执行方法论，不是文档管理工具
- **强制 TDD**：先写测试再写实现，写完代码后再重构
- **技能系统**：AI 根据上下文自动加载合适的技能
- **50k+ Stars**：社区认可度高

## 详细内容

### 核心方法论
| 实践 | 说明 |
|------|------|
| TDD-First | 强制 AI 先写测试，再写实现 |
| Sub-Agents | 拆分复杂任务给专门的子代理 |
| Code Review | 实现后自动触发代码审查 |
| Exploration | 实现前先充分探索代码库 |
| Verification | 每步都要验证，不盲目前进 |

### 三大核心命令
1. **brainstorm** — 头脑风暴：探索需求、讨论设计、确定方向
2. **write-plan** — 编写计划：拆分实现步骤、创建书面实施计划
3. **execute-plan** — 执行计划：按书面计划分批执行，含审查检查点

### 技能生态
Superpowers 包含十几个子技能，按上下文自动触发：
- `brainstorm` — 需求探索和设计讨论
- `write-plan` — 编写多步骤实现计划
- `executing-plans` — 执行书面计划
- `receiving-code-review` — 收到代码审查后实施改进
- `requesting-code-review` — 完成重要功能后请求审查
- `systematic-debugging` — 遇到 bug 时的系统化调试
- `test-driven-development` — TDD 实现
- `subagent-driven-development` — 子代理驱动开发
- `using-git-worktrees` — Git 工作树隔离开发
- `verification-before-completion` — 完成前的验证
- `finishing-a-development-branch` — 分支完成后的合并/PR决策

### 中文适配
提供中国特色技能路由：
- `chinese-code-review` — 中文代码审查
- `chinese-commit-conventions` — 中文 Git 提交规范
- `chinese-documentation` — 中文技术文档写作
- `chinese-git-workflow` — 中文 Git 工作流

## 相关页面
- [[规范驱动开发]]
- [[OpenSpec]]
- [[Spec-Kit]]
- [[AI-Skill-生态]]

## 来源
- [[../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md|AI 编程三剑客]]
- [[../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md|推荐我日常高频使用的8个Skills]]
