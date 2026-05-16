---
title: "Multica 官方文档参考"
created: 2026-05-15
updated: 2026-05-15
source: https://multica.ai/docs/zh
tags: [Multica, 多智能体, Agent平台, 任务协作, 官方文档]
status: active
related_concepts: ["concepts/Agent-as-Teammate", "concepts/MCP-协议"]
related_synthesis: ["synthesis/多Agent-平台对比-Multica-OpenCode-OpenClaw"]
---

# Multica 官方文档参考

> Multica 是一个任务协作平台——人类和 AI 智能体在同一个工作区里共同工作。本文档整理自 [Multica 官方文档](https://multica.ai/docs/zh)（2026年4月版）。

---

## 一、核心架构

Multica 是一个**分布式**平台，由三个核心组件构成：

```
┌─────────────────────────────────────────────────────────────┐
│                       你的机器（本地侧）                       │
│  ┌──────────────┐     ┌──────────────────────────────┐     │
│  │  守护进程     │ ◄──► │  AI 编程工具（Claude Code,    │     │
│  │  (daemon)    │     │  Codex, Cursor, OpenCode...）│     │
│  │  轮询任务、   │     │  真正执行代码的那一环           │     │
│  │  调用AI工具  │     └──────────────────────────────┘     │
│  └──────┬───────┘                                          │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ WebSocket / HTTP
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Multica 服务器（云端或自部署）               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  工作区/成员  │  │  Issue/任务   │  │  WebSocket Hub   │  │
│  │  (数据库)    │  │  队列        │  │  (实时推送)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  **不执行任何智能体任务**                                    │
└─────────────────────────────────────────────────────────────┘
```

### 三个组件的职责

| 组件 | 位置 | 职责 | 备注 |
|------|------|------|------|
| **Multica 服务器** | 云端或自部署服务器 | 工作区、Issue、评论、智能体配置的存储；WebSocket 实时推送 | **不执行任何 AI 任务** |
| **守护进程 (daemon)** | 你自己的机器 | 每 3 秒轮询任务、每 15 秒发心跳；探测本地 AI 工具；调用 AI 编程工具执行任务 | Multica CLI 的一部分 |
| **AI 编程工具** | 你自己的机器 | 真正写代码/执行任务的那一环 | 支持 11 款工具 |

关键设计原则：**你的 API 密钥、代码目录、已授权的工具都只在本地**；Multica 服务器一个都看不到。

---

## 二、三种使用方式

### 1. Multica Cloud（托管后端）
- 安装命令行工具，在本地运行守护进程，连接到 Multica 托管的服务器
- 约 5 分钟完成
- **目前处于等待名单阶段**（Cloud 服务）

### 2. 自部署（Self-Host）
- 用 Docker Compose 在自己的服务器上运行完整后端
- 数据库、服务器、存储都在你自己的基础设施上
- **约 10 分钟完成**

### 3. 桌面应用
- 原生多标签窗口
- 内置命令行工具并在启动时自动拉起守护进程
- 可连接 Multica Cloud 或自部署后端

---

## 三、自部署快速上手

### 前置要求
- Docker 已安装（支持 `docker compose`）
- Git（可选）
- 一台能长期开机的机器（本地/内网/云主机）
- 至少一款 AI 编程工具装在**运行守护进程的机器上**

### 一键启动

```bash
git clone https://github.com/multica-ai/multica.git
cd multica
make selfhost
```

`make selfhost` 会：
1. 如无 `.env` 文件，从 `.env.example` 自动生成并生成随机 `JWT_SECRET`
2. 拉取官方 Docker 镜像（PostgreSQL、Multica backend、Multica frontend）
3. 用 `docker-compose.selfhost.yml` 启动全部服务
4. 等后端 `/health` 端点准备就绪

启动完成后：
- **前端**：`http://localhost:3000`
- **后端**：`http://localhost:8080`

### 生产安全配置
- `docker-compose.selfhost.yml` 默认 `APP_ENV=production`
- 公网部署前检查 `.env` 里 `APP_ENV=production`，且 `MULTICA_DEV_VERIFICATION_CODE` 为空
- 如从源码构建：`make selfhost-build`
- 生产探针可用 `/readyz`（包含数据库和 migration 状态）

### 可选：配置邮件服务
不配邮件时，验证码会打印到 server stdout。支持两种通道：
- **Resend**（公网部署推荐）
- **SMTP relay**（内网/自部署）

---

## 四、工作区与团队

### 工作区（Workspace）
- 一群人一起协作的独立空间——所有 Issue、成员、评论、智能体都属于它
- 创建工作区时需要：名字、Slug（短链标识，**创建后不能改**）、Issue 前缀
- Issue 编号格式：`<前缀>-<数字>`，如 `MUL-123`
- 删除工作区不可恢复

### 成员角色
- **Owner** — 最高权限，可删除工作区
- **Admin** — 管理类操作
- **Member** — 常规成员

---

## 五、Issue 与任务

### Issue（工作项）
Multica 的核心工作单位，支持七种状态、五档优先级。

**与 Linear/Jira 最大的区别**：Issue 的分配人可以是人，也可以是**智能体**。

| 状态 | 含义 |
|------|------|
| `backlog` | 还没排期 |
| `todo` | 已排期、准备开工 |
| `in_progress` | 正在做 |
| `in_review` | 等待 review |
| `done` | 已完成 |
| `blocked` | 被外部因素卡住 |
| `cancelled` | 已取消 |

### 执行任务（Task）
智能体每一次工作的单位。分配 Issue、@ 提及智能体、聊天、Autopilot 触发都会产生一个 task。

**状态机**：
`queued` → `dispatched` → `running` → `completed` / `failed` / `cancelled`

**超时机制**：
- 派发后 5 分钟不开始 → timeout
- 运行超过 2.5 小时 → timeout
- 两种 timeout 均自动重试（最多 1 次）

**重试规则**：
- 可重试：`runtime_offline`、`runtime_recovery`、`timeout`（最多 2 次：1 次原任务 + 1 次重试）
- 不可重试：`agent_error`（AI 工具自身报错）
- Autopilot 触发的任务**不自动重试**

---

## 六、智能体系统

### 智能体（Agent）
智能体是工作区里的一等公民成员——和人一样能被分配 Issue、发评论、被 @ 点名。核心差异：
- **自动开工**——分配或 @ 后立刻执行，不用催
- **不收通知**——不在收件箱里出现
- **背后绑定一款 AI 编程工具**
- **可以被归档**——归档时正在跑的任务会被取消

### 创建智能体
最小字段：**名字** + **选一款 AI 编程工具**。可选配置：
- **系统指令（instructions）**——角色定义和规则
- **模型选择**——留空用工具默认
- **自定义环境变量（custom_env）**——注入 API key 等
  - ⚠️ 值在数据库中是明文存储，非创建者/admin 看到 `****`
  - **不要把高价值 secret 放进去**
- **可见性**——`workspace`（工作区可见）或 `private`（默认，仅 owner/admin/创建者可用）
- **并发上限**——默认 1，避免同一智能体同时跑多个任务
- **自定义命令行参数**

### Skills（技能）
Skill 是给智能体的**专业知识包**——一个 `SKILL.md` + 可选支持文件。Multica 采用 [Anthropic Agent Skills](https://agentskills.io) 开放标准。

**两类来源**：
- **工作区 Skill** — 存在 Multica 云端，团队共享的标准方式
- **本机 Skill** — 存在本地 skill 目录

**导入方式**：
1. 新建——UI 里直接写 SKILL.md
2. 从 GitHub——贴仓库 URL 自动拉取
3. 从 ClawHub——公开市场搜索导入
4. 从本机——守护进程扫描后选入

**安全提醒**：从 GitHub/ClawHub 导入的 Skill 可能包含脚本。Multica **不做签名验证、代码审查、沙盒隔离**。导入前审查所有文件。

### 小队（Squad）
一组智能体（可选附带人类成员）的命名集合，由一名指定的队长智能体领导。适合**按主题派活，而不是按名字派活**。

**工作方式**：把 Issue 分配给小队 → 队长读 Issue，判断谁最合适，然后用 @ 提及派活。

---

## 七、守护进程与运行时

### 守护进程（Daemon）

```bash
multica daemon start        # 启动（默认后台）
multica daemon start --foreground  # 前台运行
multica daemon stop
multica daemon restart
multica daemon status
multica daemon logs          # -f 跟随
```

启动后自动完成四件事：
1. 读取登录凭证
2. 探测本机已安装的 AI 编程工具
3. 向服务器注册运行时
4. 持续每 3 秒轮询任务、每 15 秒发心跳

**桌面应用自带守护进程**，无需手动启动。

### 运行时（Runtime）
运行时 = 「守护进程 × 一款 AI 编程工具 × 工作区」的组合。一台机器可以注册多个运行时。

**运行时状态**：
- 守护进程超过 45 秒没发心跳 → 判定为离线
- 重启守护进程后，失联运行时会逐步恢复
- 离线不会删除运行时记录，守护进程回来后自动恢复

---

## 八、AI 编程工具对照

Multica 内置支持 **11 款** AI 编程工具：

| 工具 | 厂商 | 会话恢复 | MCP | Skill 注入路径 | 模型选择 |
|------|------|---------|-----|---------------|---------|
| **Claude Code** | Anthropic | ✅ | **✅（唯一真用）** | `.claude/skills/` | 静态 + flag |
| **Codex** | OpenAI | ⚠️ 代码存在但不可达 | ❌ | `$CODEX_HOME/skills/` | 静态 |
| **Copilot** | GitHub | ✅ | ❌ | `.github/skills/` | 静态（账号权益） |
| **Cursor** | Anysphere | ⚠️ 代码存在但不可用 | ❌ | `.cursor/skills/` | 动态发现 |
| **Gemini** | Google | ❌ | ❌ | `.agent_context/skills/` | 静态 |
| **Hermes** | Nous Research | ✅ | ❌ | `.agent_context/skills/` (fallback) | 动态发现 |
| **Kimi** | Moonshot | ✅ | ❌ | `.kimi/skills/` | 动态发现 |
| **Kiro CLI** | Amazon | ✅ | ❌ | `.kiro/skills/` | 动态发现 |
| **OpenCode** | SST | ✅ | ❌ | `.opencode/skills/` | 动态发现 |
| **OpenClaw** | 开源项目 | ✅ | ❌ | `.agent_context/skills/` (fallback) | 绑定在智能体上 |
| **Pi** | Inflection AI | ✅（session=文件路径） | ❌ | `.pi/skills/` | 动态发现 |

**推荐**：新用户首选 **Claude Code**——功能最完整，会话恢复真用，唯一真读 MCP 配置的工具。

---

## 九、CLI 命令速查

### 认证与初始化
| 命令 | 用途 |
|------|------|
| `multica login` | 登录并保存 PAT |
| `multica auth status` | 查看登录状态、用户、工作区 |
| `multica auth logout` | 清除本地 PAT |
| `multica setup cloud` | Cloud 一键初始化 |
| `multica setup self-host` | 自部署一键初始化 |

### 工作区与成员
| 命令 | 用途 |
|------|------|
| `multica workspace list` | 列出工作区 |
| `multica workspace get <slug>` | 查看工作区详情 |
| `multica workspace members` | 列出成员 |
| `multica workspace create` | 创建工作区 |

### Issue 管理
| 命令 | 用途 |
|------|------|
| `multica issue list` | 列出 issue |
| `multica issue get <id>` | 查看单个 issue |
| `multica issue create --title "..."` | 创建 issue |
| `multica issue assign <id> --agent <slug>` | 分配给智能体 |
| `multica issue status <id> --set <status>` | 改状态 |
| `multica issue search <query>` | 关键字搜索 |

### 智能体
| 命令 | 用途 |
|------|------|
| `multica agent list` | 列出智能体 |
| `multica agent get <slug>` | 查看智能体 |
| `multica agent create` | 创建智能体 |

### 小队
| 命令 | 用途 |
|------|------|
| `multica squad list` | 列出小队 |
| `multica squad create --name "..." --leader <agent>` | 创建小队 |
| `multica squad member add <id> --member-id <uuid> --type agent --role "..."` | 添加成员 |

---

## 十、环境变量配置（自部署）

### 核心变量

| 变量 | 默认值 | 生产必须 | 说明 |
|------|--------|---------|------|
| `DATABASE_URL` | `postgres://multica:multica@localhost:5432/multica?sslmode=disable` | **是** | 数据库连接 |
| `PORT` | `8080` | 否 | 服务端口 |
| `JWT_SECRET` | `multica-dev-secret-change-in-production` | **是** | JWT 密钥（默认值不安全） |
| `APP_ENV` | 空 | **是** | 必须设为 `production` |
| `FRONTEND_ORIGIN` | 空 | **是** | 自部署要填域名 |
| `MULTICA_DEV_VERIFICATION_CODE` | 空 | 否（生产保持空） | 固定验证码 |

### 数据库连接池
- `DATABASE_MAX_CONNS` — 默认 `25`
- `DATABASE_MIN_CONNS` — 默认 `5`

### 邮件配置
- **Resend**：`RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- **SMTP relay**：`SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD`
- 都不配时：验证码只打到 server stdout（生产环境是黑洞！）

### 登录方式
- **Email + 验证码**（默认）
- **Google OAuth**（可选）
- 注册白名单控制
- 登录后签发 30 天有效期的 JWT cookie

---

## 十一、相关资源

- 官方文档：[multica.ai/docs/zh](https://multica.ai/docs/zh)
- GitHub：[github.com/multica-ai/multica](https://github.com/multica-ai/multica)
- Skill 标准：[agentskills.io](https://agentskills.io)
- Skill 市场：[ClawHub](https://clawhub.io)
- 本地项目方案：[[myk/项目文档/Multica-nanobot多智能体平台建设方案-v1.1.md]]
- 平台对比：[[myk/wiki/synthesis/多Agent-平台对比-Multica-OpenCode-OpenClaw]]
- 概念关联：[[myk/wiki/concepts/Agent-as-Teammate]]

---

> 本文档基于 Multica 官方文档（zh，2026年4月版）整理，覆盖全部 28 个页面内容，适合作为本地知识库的快速参考。
