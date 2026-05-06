---
title: "Agent-as-Teammate"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/Multica/Multica调研报告.md"]
tags: [Agent, 多Agent协作, 架构模式]
status: active
---

# Agent-as-Teammate

> 多 Agent 协作的顶层范式：不再将 Agent 视为工具调用者，而是视为**具有自主性和角色身份的团队同事**。

---

## 核心概念

传统的自动化工作流中，AI 是**工具**——人类输入指令，AI 返回结果。Agent-as-Teammate 将 Agent 提升为**团队成员**，每个 Agent 具有独立的角色、能力、记忆和决策权。

类比：
- **工具模式**：人用刀切菜 → 刀无自主性
- **Teammate 模式**：主厨 + 配菜师 + 火候师协作完成一道菜 → 各 Agent 有各自专长和分工

---

## 关键特征

| 特征 | 说明 |
|------|------|
| **角色身份** | 每个 Agent 有明确的角色定义（如代码审查专家、测试专家、文档专家） |
| **自主决策** | Agent 可以在其角色范围内自主决定调用哪些工具、何时输出 |
| **记忆共享** | Agent 之间可以共享上下文和决策历史，不需要人类中转 |
| **编排机制** | 通过 Orchestrator（协调者）或去中心化协议管理 Agent 间协作 |
| **反馈闭环** | Agent 可以评价彼此的输出，形成 peer review 机制 |

---

## 与本 Wiki 的关联

| 关联页面 | 关联点 |
|---------|--------|
| [[Harness-Engineering-技能工程|Harness Engineering 技能工程]] | 多智能体闭环（EvalAgent→RenderAgent→AnalyzeAgent）是 Agent-as-Teammate 的工程实现 |
| [[LLM-Gateway-选型-New-API-vs-LiteLLM|LLM Gateway 选型：New-API vs LiteLLM]] | LiteLLM 支持 A2A Agent 协议，是实现 Agent 间通信的基础设施 |

---

## 参考资料
- [[myk/调研笔记/Multica/Multica调研报告|Multica 调研报告]] — 开源多 Agent 管理平台
