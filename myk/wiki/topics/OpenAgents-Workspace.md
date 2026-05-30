---
title: "OpenAgents-Workspace"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/快来用OpenAgents Workspace，让你的多个智能体一起协作完成任务！.md"
tags: [Agent, 开发工具, 协作]
status: active
---

# OpenAgents-Workspace

> 多 Agent 协作平台，将本地孤立的 AI Agent 变成可以在线协作的团队，类似 Slack 对 Agent 协作方式的重塑。开放源，Apache 2.0 协议。

## 核心要点
- **统一工作空间**：一个链接管理所有 Agent，无论跑在哪台机器上
- **多 Agent 协作**：共享同一套文件、浏览器、上下文，用 @ 分配任务
- **共享浏览器**：Agent 操作网页实时可见
- **共享文件夹**：Agent 上传/下载代码、文档，所有人可编辑
- **开源无绑定**：Apache 2.0 协议，无厂商绑定，不强制注册账号
- **固定访问地址**：专属链接如 `workspace.openagents.org/abc123`，收藏分享即

## 详细内容

### 解决的痛点

本地 Agent 各干各的，存在三大问题：
1. 无法让一个 Agent 完成工作后自动交给另一个 Agent 审核
2. 无法在手机上查看工作进度
3. 无法让多个 Agent 像真正的团队那样协作

OpenAgents Workspace 的解决思路：**把 Slack 的多角色协作模式引入 Agent 生态。**

### 支持接入的 Agent（当前版本）
- Claude Code
- OpenClaw
- Codex CLI
- Cursor
- 其他支持的 Agent（持续扩展）

### 核心功能

| 功能 | 说明 |
|------|------|
| **多 Agent 一个工作区** | 接入多个 Agent 到同一 Workspace，共享上下文 |
| **多 Agent 协作** | Agent 能看到彼此工作，协同配合，用 @ 分配任务 |
| **固定访问地址** | 专属链接 `workspace.openagents.org/xxx`，收藏即达 |
| **共享浏览器** | 打开网页、点击、截图、填表，所有人实时可见 |
| **共享文件夹** | 上传/下载代码、文档，Agent 和团队都能编辑 |
| **一键访问** | 一条命令将本地服务暴露为公网链接，任何设备预览成果 |

### 安装方式

**CLI 安装**：
```bash
# macOS / Linux
curl -fsSL https://openagents.org/install.sh | bash

# Windows (PowerShell)
irm https://openagents.org/install.ps1 | iex

# 运行管理面板
agn
```

**桌面 App 安装**：
直接下载桌面安装包（链接见 GitHub README）。

### 与现有平台的对比

与 Wiki 中已有的多 Agent 平台对比（见 [[多Agent-平台对比-Multica-OpenCode-OpenClaw]]）：

| 维度 | OpenAgents | Multica | OpenCode | OpenClaw |
|------|-----------|---------|----------|----------|
| **核心定位** | Agent 协作工作台 | 多 Agent 编排 | 单 Agent CLI | 任务分配调度 |
| **多 Agent 协作** | ✅ 原生支持 | ✅ 支持 | 有限 | ✅ 支持 |
| **共享浏览器** | ✅ | ❓ | ❌ | ❌ |
| **共享文件** | ✅ | ❓ | ❌ | ❌ |
| **浏览器管理** | ✅ 集中管理 | 不突出 | 内置 | 不突出 |
| **开源协议** | Apache 2.0 | 查看项目 | 查看项目 | 查看项目 |
| **厂商绑定** | ❌ 无 | 查看项目 | ❌ | ❌ |

> ⚠️ 注：此对比基于当前可用信息，Multica 等平台的详细能力需进一步调研补充。

### 与 [[Agent-as-Teammate]] 的关系

OpenAgents Workspace 是 [[Agent-as-Teammate]] 理念的平台级实现：
- 将 Agent 视为团队同事而非工具
- 提供共享工作空间让 Agent 自然协作
- 通过 @ 机制实现任务分配和责任委派
- 类似人类团队在 Slack/Teams 中的协作方式

## 相关页面
- [[Agent-as-Teammate]]
- [[多Agent-平台对比-Multica-OpenCode-OpenClaw]]
- [[AI-编码助手生态]]

## 来源
- [[../技术沉淀/AI生态/快来用OpenAgents Workspace，让你的多个智能体一起协作完成任务！.md|快来用OpenAgents Workspace，让你的多个智能体一起协作完成任务！]]
