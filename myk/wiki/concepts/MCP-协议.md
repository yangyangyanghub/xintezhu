---
title: "MCP 协议"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/new-api-vs-LiteLLM/new-api-vs-LiteLLM调研报告.md", "../调研笔记/cc-connect/cc-connect调研报告.md"]
tags: [MCP, 协议, AI工具调用, 标准化]
status: active
---

# MCP 协议（Model Context Protocol）

> Anthropic 于 2024 年底推出的 **Model Context Protocol**，是连接大模型与外部工具/数据源的标准化协议，类似 USB-C 之于硬件外设接口。

---

## 核心概念

MCP 的核心思想是：**模型不应该被锁定在特定的工具/数据集成中**，而应该通过标准化的协议层接入任何外部能力。

### 解决什么问题

在 MCP 之前，每个 AI 工具（Claude、ChatGPT、Gemini）要访问外部数据（GitHub、数据库、Google Drive），开发者需要为**每个模型 + 每个数据源**编写独立的 integration 代码。

MCP 将问题解耦为：
- 数据源/工具只需实现 **一次** MCP Server
- 任何支持 MCP 的模型（Host）即可连接

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Claude Host │     │  ChatGPT    │     │ 其他 Host   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                  │                   │
       └────────────┬─────┘                   │
                    │                         │
              ┌─────▼─────┐                   │
              │ MCP Host  │ ←── 标准化协议层  │
              └─────┬─────┘                   │
                    │                         │
              ┌─────▼─────┐                   │
              │MCP Server │                   │
              │ (GitHub)  │                   │
              └───────────┘                   │
```

---

## MCP 三大组件

| 组件 | 说明 | 类比 |
|------|------|------|
| **Host** | 运行大模型的应用程序（Claude Desktop、IDE、网关） | USB 主机 |
| **Server** | 暴露工具/数据的程序（GitHub MCP、数据库 MCP） | USB 外设 |
| **Client** | 嵌入在 Host 中，负责与 Server 通信的客户端 | USB 控制器 |

---

## MCP 能力

| 能力 | 说明 |
|------|------|
| **Tools** | 暴露可调用函数（如数据库查询、API 调用），模型可动态发现并调用 |
| **Resources** | 暴露可读数据（文件内容、数据库记录），支持实时订阅 |
| **Prompts** | 暴露预定义模板（如 commit message 模板、代码审查模板） |

---

## 与本 Wiki 的关联

| 关联页面/资料 | 关联点 |
|---------------|--------|
| [[LLM-Gateway-选型-New-API-vs-LiteLLM|LLM Gateway 选型：New-API vs LiteLLM]] | LiteLLM 已支持 MCP 协议桥接，New-API 暂不支持 |
| [[myk/调研笔记/OpenCode-Skill管理|OpenCode Skill 管理]] | OpenCode skill 机制可作为 MCP Server 暴露 |
| [[Harness-Engineering-技能工程|Harness Engineering 技能工程]] | 技能文档可通过 MCP Prompts 暴露 |

---

## 参考资料
- MCP 官方规范：https://modelcontextprotocol.io
