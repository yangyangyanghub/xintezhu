# OpenCode 架构全景分析

> 来源：anomalyco/opencode GitHub 仓库（2.0 分支，2026-05-08 克隆分析）
> 标签: #coding-agent #开源架构 #Bun #Effect #SolidJS

---

## 一、项目定位

OpenCode 是一个**开源 AI 编程代理**（coding agent），直接对标 Claude Code，但核心差异在于：

- **100% 开源**，不绑定任何 LLM 供应商
- **客户端/服务器架构**，支持远程驱动（如手机操控电脑上的 OpenCode）
- **TUI 优先**（终端用户界面），由 neovim 用户 + terminal.shop 创作者打造
- **原生 LSP 支持**，深度语言服务器协议集成

下载量规模：日均增长约 8,000-9,000 次，截至 2025-07 累计超 30 万次下载。

---

## 二、技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **运行时** | **Bun** (1.3.11) | 全栈 JS 运行时，替代 Node.js |
| **包管理** | Bun workspaces (monorepo) | 19 个子包 |
| **构建工具** | Turborepo | 增量构建、typecheck |
| **前端框架** | **SolidJS** + **OpenTUI** | 终端 UI + Web UI 组件 |
| **桌面端** | **Tauri** | 跨平台桌面应用（macOS/Windows/Linux） |
| **后端框架** | **Hono** | 轻量级 HTTP 框架 |
| **数据库** | **SQLite** + **Drizzle ORM** | 本地持久化 |
| **函数式编程** | **Effect** (4.0-beta) | 核心错误处理、依赖注入、异步流 |
| **AI SDK** | **Vercel AI SDK** (ai 6.0) | LLM 抽象层 |
| **Schema 验证** | **Zod 4.x** | 全链路数据类型校验 |

---

## 三、Monorepo 架构（19 个子包）

### 核心包

| 包名 | 职责 | 技术 |
|------|------|------|
| `packages/opencode` | **核心引擎** — 业务逻辑 + HTTP 服务器 | Effect + Hono |
| `packages/console/app` | **TUI 终端界面** | SolidJS + OpenTUI |
| `packages/app` | **Web UI 组件库** | SolidJS |
| `packages/desktop` | **桌面应用**（Tauri 壳） | Tauri |
| `packages/plugin` | **插件系统 SDK** | TypeScript |

### 辅助包

`packages/web`（官网）、`packages/docs`（文档）、`packages/ui`（UI 工具库）、`packages/containers`（容器化）、`packages/enterprise`（企业版）、`packages/function`（云函数）、`packages/identity`（身份认证）、`packages/script`（构建脚本）、`packages/sdk/js`（JS SDK）、`packages/slack`（Slack 集成）、`packages/storybook`（组件文档）、`packages/util`（通用工具）、`packages/extensions/zed`（Zed 插件）

---

## 四、核心引擎架构（packages/opencode/src）

### 1. Agent 系统

```
内置 Agent：
├── build     — 默认全权代理，执行开发工作（全文件读写/命令执行权限）
├── plan      — 只读分析代理，拒绝文件修改，命令执行需审批
└── general   — 子代理（subagent），处理复杂搜索和多步任务

特性：
- Tab 键切换
- 可配置权限规则（Permission.Ruleset）
- 可绑定专用模型（model: {providerID, modelID}）
- 独立温度/topP 参数、系统提示词、最大步数
```

### 2. Provider 层（20+ LLM 供应商）

**内置供应商**：Anthropic、OpenAI、Google/Vertex、Azure、OpenRouter、Groq、Mistral、TogetherAI、Cohere、Amazon Bedrock、GitHub Copilot、GitLab AI、Vercel、DeepInfra、Cerebras、Perplexity、Venice、Alibaba，以及本地模型支持。

通过 `models.dev` 平台统一管理模型元数据（新增 Provider 需先在该仓库 PR）。

### 3. Tool 系统（44 个内置工具）

| 类别 | 工具 |
|------|------|
| **文件操作** | read, write, edit, multiedit, apply_patch, ls, glob |
| **命令行** | bash |
| **代码搜索** | grep, codesearch, lsp（语言服务器：定义跳转/引用查找/诊断） |
| **Web** | webfetch, websearch |
| **AI 能力** | task（子代理调用）、skill（技能加载）、question（向用户提问） |
| **项目管理** | todo, todowrite, plan |
| **其他** | truncate（输出截断）、mcp-exa、invalid（无效调用处理） |

每个工具返回 `Effect<ExecuteResult>`，支持流式输出、附件、元数据。

### 4. Session 管理（20 个文件）

核心模块：
- **消息管理**：`message-v2.ts`、`message.ts`
- **上下文压缩**：`compaction.ts`（长会话自动压缩）
- **溢出处理**：`overflow.ts`（上下文窗口管理）
- **重试 / 回滚**：`retry.ts`、`revert.ts`（支持撤销代理操作）
- **摘要 / 标题**：`summary.ts`、`title.ts`
- **LLM 交互**：`llm.ts`
- **事件投影**：`projectors.ts`

SQLite 存储（`session.sql.ts` + `PartTable` + `SessionTable`），支持 diff 统计（additions/deletions/files）。

### 5. Skill 系统

```
技能发现路径（优先级）：
├── .opencode/skill/          — 项目级技能（最高优先级）
├── ~/.config/opencode/skill/ — 用户级技能
├── .claude/skills/           — 兼容 Claude Code 技能
└── .agents/skills/           — 通用代理技能

加载机制：
- 解析 SKILL.md 的 YAML frontmatter
- 按名称注册到内存（Record<string, Info>）
- 支持 Agent 级别的可见性控制（available per agent）
- 外部技能目录自动发现（discovery.ts）
- 加载失败通过 Bus 发布错误事件
```

### 6. Server 层

- **双适配器**：`adapter.bun.ts`（Bun 原生）、`adapter.node.ts`（Node.js 兼容）
- **mDNS 发现**：`mdns.ts`（局域网设备发现）
- **事件流**：`event.ts`（SSE 实时推送）
- **代理**：`proxy.ts`
- **中间件**：`middleware.ts`
- **控制面**：`control/`（企业工作区管理）

### 7. 其他关键模块

| 模块 | 功能 |
|------|------|
| `config/` | 配置系统（AGENTS.md 解析、TUI 配置、markdown 配置） |
| `permission/` | 权限控制（文件读写、命令执行审批，细粒度 ruleset） |
| `lsp/` | 语言服务器协议（定义跳转、引用查找、诊断、符号搜索） |
| `mcp/` | Model Context Protocol 集成 + OAuth 回调 |
| `plugin/` | 插件系统（Shell 注入、TUI 扩展、自定义工具） |
| `storage/` | SQLite 存储抽象 + 迁移（Drizzle ORM） |
| `sync/` | 跨设备/客户端同步 |
| `share/` | 会话分享 |
| `snapshot/` | 代码快照 |
| `worktree/` | Git 工作树隔离（分支开发不影响主工作区） |
| `auth/` | 认证系统 |
| `bus/` | 事件总线（发布/订阅模式） |
| `flag/` | 功能开关 |
| `git/` | Git 操作封装 |
| `ide/` | IDE 集成 |
| `question/` | 交互式提问（Agent 向用户确认） |
| `pty/` | 伪终端管理（TTY/PTY 生命周期） |
| `account/` | 账户管理 |
| `acp/` | Agent Communication Protocol |
| `npm/` | npm 包管理集成 |
| `control-plane/` | 云端控制面（企业版） |

---

## 五、API 设计（RESTful, Hono 驱动）

```
GET  /project                           — 列出所有项目
POST /project/init                      — 初始化项目
GET  /project/:id/session               — 列出会话
POST /project/:id/session               — 创建会话（支持 parentID 子会话）
POST /project/:id/session/:id/init      — 初始化会话
POST /project/:id/session/:id/abort     — 中止
POST /project/:id/session/:id/compact   — 压缩上下文
POST /project/:id/session/:id/share     — 分享会话
POST /project/:id/session/:id/revert    — 回滚
POST /project/:id/session/:id/message   — 发送消息
GET  /project/:id/session/:id/message   — 获取消息（含 parts）
GET  /project/:id/session/:id/file      — 获取文件状态/补丁
POST /project/:id/session/:id/permission/:id — 权限审批
GET  /provider                          — 解析 Provider
GET  /config                            — 获取配置
GET  /project/:id/agent                 — 列出 Agent
```

---

## 六、部署形态

| 形态 | 说明 |
|------|------|
| **CLI** | `npx opencode-ai` 或全局安装（brew/choco/scoop/pacman） |
| **TUI** | 全功能终端交互界面（SolidJS + OpenTUI） |
| **Web App** | 浏览器前端 |
| **Desktop** | Tauri 打包桌面应用（BETA，macOS/Windows/Linux） |
| **Server 模式** | 远程访问，支持移动端控制 |

---

## 七、代码风格规范（AGENTS.md）

- 单变量名优先（短名优于驼峰复合名）
- 避免不必要的解构，使用点标记
- 优先 `const` 而非 `let`
- 使用 type inference，避免显式类型注解
- 函数式数组方法优先于 for 循环
- 偏好 Bun API（`Bun.file()` 等）
- 自动化优先，无需确认除非阻塞或安全不可逆

---

## 八、与日常工作流的关联

我们在 OpenCode 之上构建了完整的"辛特助"工作体系：

| OpenCode 底层 | 上层扩展 |
|--------------|---------|
| `skill/` 模块 | AGENTS.md 规范 + 13 个本地/用户技能（学术追踪器、GIS、日报分析等） |
| `agent/` 系统 | 自定义代理编排（Sisyphus、Oracle、Librarian、Explore、Metis 等） |
| `session/` 管理 | 记忆系统（.memory/ 四层记忆模型）通过 hook 自动触发 |
| `provider/` 路由 | 自配置模型优先级（MiMo、opencode/claude 等） |
| `config/` 解析 | AGENTS.md 定义工作规范，项目级与用户级分层 |
| `hook/` 机制 | 事件驱动的记忆捕获、日报自动生成、Wiki 维护 |

**一句话总结**：OpenCode 提供**骨架**（Agent/Session/Provider/Skill/Server），我们的 AGENTS.md + Skill 系统注入**灵魂**（工作流/记忆/个性）。
