---
title: "cc-connect 使用手册"
created: 2026-05-11
updated: 2026-05-11
sources: ["../../../技术沉淀/cc-connect使用手册.md"]
tags: [开发工具, 规范, 模板]
status: active
---

# cc-connect 使用指南

> 将本地 AI 编码助手（Claude Code / OpenCode / Codex 等）桥接到飞书、钉钉、Telegram 等消息平台的工具，支持多项目、多平台、定时任务。

## 核心要点

- **核心定位**：AI Agent 与消息平台之间的桥梁，无需公网 IP 即可实现聊天交互和定时任务
- **支持矩阵**：7 种 AI Agent（Claude Code / Codex / Cursor / Gemini / OpenCode 等）× 9 种消息平台（飞书 / 钉钉 / Telegram / Slack / Discord / 企微 / 个人微信 / QQ）
- **关键能力**：多会话管理、工作目录切换、权限模式控制、自然语言定时任务、多项目单进程管理
- **配置核心**：`config.toml` 采用 TOML 格式，`[[projects]]` 数组管理多项目，每个项目包含 `agent` + `platforms`
- **权限双控**：`admin_from` 控制特权命令（如 `/shell`、`/dir`），`allow_from` 控制平台访问用户
- **定时任务**：通过 `/cron add` 聊天命令或 `cc-connect cron add` CLI 创建，支持自然语言调度
- **后台服务**：Linux/macOS 用 `cc-connect daemon`，Windows 推荐 nssm 或 pm2

## 详细内容

### 一、安装与配置

#### 1.1 安装方式

| 方式 | 命令 | 说明 |
|------|------|------|
| npm（推荐） | `npm install -g cc-connect` | 稳定版 |
| npm Beta | `npm install -g cc-connect@beta` | 含个人微信等新功能 |
| 二进制 | GitHub Releases 下载 | 对应平台可执行文件 |
| 源码构建 | `git clone && make build` | 开发用途 |

#### 1.2 配置文件

**配置优先级**（从高到低）：
1. `-config <path>` 命令行参数
2. `./config.toml` 当前目录
3. `~/.cc-connect/config.toml` 全局配置（推荐）

**创建配置**：
```bash
mkdir -p ~/.cc-connect
cp config.example.toml ~/.cc-connect/config.toml
```

#### 1.3 配置文件结构

```toml
[log]
level = "info"  # debug | info | warn | error

[[projects]]
name = "my-project"
admin_from = "ou_xxx,ou_yyy"  # 特权命令权限

[projects.agent]
type = "opencode"  # claudecode | codex | cursor | gemini | qoder | opencode | iflow

[projects.agent.options]
work_dir = "/absolute/path/to/project"
mode = "default"  # 不同 agent 有不同模式

[[projects.platforms]]
type = "feishu"  # feishu | dingtalk | telegram | slack | discord | wecom | weixin | qq

[projects.platforms.options]
app_id = "cli_xxx"
app_secret = "xxx"
allow_from = "*"  # 或指定用户ID
```

### 二、平台连接方式

| 平台 | 连接模式 | 需要公网IP | 核心凭证 |
|------|---------|-----------|---------|
| 飞书 | WebSocket | 否 | `app_id` + `app_secret` |
| 钉钉 | Stream | 否 | `client_id` + `client_secret` |
| Telegram | Long Polling | 否 | `token` |
| Slack | Socket Mode | 否 | `bot_token` + `app_token` |
| Discord | Gateway WS | 否 | `token` |
| 企业微信 | WebSocket/Webhook | 否(WS)/是(Webhook) | `corp_id` + `corp_secret` + `agent_id` |
| 个人微信(beta) | HTTP 长轮询 | 否 | 扫码登录 |
| QQ(NapCat) | WebSocket | 否 | `ws_url` |

**飞书推荐配置**（最易上手）：
```bash
cc-connect feishu setup --project my-project
```

### 三、聊天命令体系

#### 3.1 会话管理

| 命令 | 功能 |
|------|------|
| `/new [name]` | 开始新会话 |
| `/list` | 列出所有会话 |
| `/switch <id>` | 切换会话 |
| `/stop` | 停止当前执行 |

#### 3.2 工作目录

| 命令 | 功能 |
|------|------|
| `/dir` | 显示当前目录 |
| `/dir <path>` | 切换目录 |
| `/dir -` | 回到上一个目录 |
| `/cd <path>` | `/dir` 别名 |

#### 3.3 权限模式

| 模式 | 说明 |
|------|------|
| `default` | 每个工具调用需确认 |
| `yolo` | 自动批准所有操作（⚠️ 谨慎） |
| `edit` | 自动接受编辑类操作 |
| `plan` | 仅规划不执行 |

切换：`/mode <模式名>`

#### 3.4 工具权限回复

在聊天中直接回复：
- `allow` / `允许` → 批准本次请求
- `deny` / `拒绝` → 拒绝本次请求
- `allow all` / `允许所有` → 会话内自动批准

### 四、定时任务

#### 4.1 聊天命令创建

```
/cron add 0 6 * * * 每天早上6点收集GitHub趋势并发送摘要
```

**Cron 格式**：`分 时 日 月 星期`

| 表达式 | 含义 |
|--------|------|
| `0 6 * * *` | 每天 6:00 |
| `0 9 * * 1` | 每周一 9:00 |
| `0 0 1 * *` | 每月1号 0:00 |
| `*/30 * * * *` | 每30分钟 |

#### 4.2 任务管理

| 命令 | 功能 |
|------|------|
| `/cron list` | 列出所有定时任务 |
| `/cron del <id>` | 删除指定任务 |

#### 4.3 自然语言调度（AGENTS.md 集成）

在项目 `AGENTS.md` 中添加：

````markdown
## Scheduled tasks (cron)
When the user asks you to do something on a schedule,
use the Bash tool to run:

cc-connect cron add --cron "<min> <hour> <day> <month> <weekday>" --prompt "<task>" --desc "<label>"

Examples:
cc-connect cron add --cron "0 6 * * *" --prompt "Summarize GitHub trending" --desc "Daily Trending"
````

添加后，用户可直接说"每天早上6点发送项目日报"，AI 会自动创建定时任务。

#### 4.4 CLI 方式创建

```bash
cc-connect cron add --cron "0 6 * * *" --prompt "执行每日数据同步" --desc "Daily Sync"
```

### 五、权限控制

**双层权限体系**：

| 配置项 | 层级 | 控制范围 | 示例 |
|--------|------|---------|------|
| `allow_from` | 平台级 | 谁能访问机器人 | `"ou_xxx,ou_yyy"` 或 `"*"` |
| `admin_from` | 项目级 | 谁能执行特权命令（`/shell`、`/dir`） | `"ou_xxx"` |

**获取用户 ID**：向机器人发送 `/whoami` 或 `/status`。

### 六、后台运行

#### 6.1 Linux/macOS

```bash
cc-connect daemon install --config ~/.cc-connect/config.toml
cc-connect daemon start|stop|restart|status|logs|uninstall
```

#### 6.2 Windows

| 方式 | 推荐度 | 说明 |
|------|--------|------|
| nssm | ⭐⭐⭐⭐⭐ | 最稳定，注册为 Windows 服务 |
| 任务计划程序 | ⭐⭐⭐ | 系统自带，开机启动 |
| pm2 | ⭐⭐⭐ | 需要 Node.js 环境 |
| 快捷方式 | ⭐⭐ | 最简单，需手动启动 |

**nssm 示例**：
```bash
nssm install cc-connect "C:\path\to\cc-connect.exe" "--config C:\path\to\config.toml"
nssm start cc-connect
```

**pm2 示例**：
```bash
pm2 start cc-connect -- --config config.toml
pm2 save
pm2 startup
```

### 七、配置模板场景

#### 场景一：多项目独立管理

一个进程同时服务多个代码仓库，每个项目绑定独立 agent 和平台。

```toml
# 项目一：Claude Code + 飞书
[[projects]]
name = "backend"
admin_from = "ou_xxx"

[projects.agent]
type = "claudecode"

[projects.agent.options]
work_dir = "/path/to/backend"

[[projects.platforms]]
type = "feishu"

[projects.platforms.options]
app_id = "cli_xxx"
app_secret = "xxx"
allow_from = "ou_xxx"

# 项目二：OpenCode + Telegram
[[projects]]
name = "frontend"
admin_from = "123456789"

[projects.agent]
type = "opencode"

[projects.agent.options]
work_dir = "/path/to/frontend"

[[projects.platforms]]
type = "telegram"

[projects.platforms.options]
token = "xxx"
allow_from = "123456789"
```

#### 场景二：单项目多平台

同一项目同时接入多个消息平台。

```toml
[[projects]]
name = "my-project"
admin_from = "ou_xxx"

[projects.agent]
type = "opencode"

[projects.agent.options]
work_dir = "/path/to/my-project"

# 飞书
[[projects.platforms]]
type = "feishu"
[projects.platforms.options]
app_id = "cli_xxx"
app_secret = "xxx"
allow_from = "ou_xxx"

# Telegram
[[projects.platforms]]
type = "telegram"
[projects.platforms.options]
token = "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
allow_from = "123456789"

# 钉钉
[[projects.platforms]]
type = "dingtalk"
[projects.platforms.options]
client_id = "dingxxxxxxxxxxxxxxxxx"
client_secret = "xxx"
allow_from = "manager001"
```

### 八、常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| `session already in use` | 会话被占用 | 使用 `/new` 开始新会话 |
| 机器人无响应 | 进程崩溃或网络问题 | 检查日志 → 重启服务 |
| 企微消息发送失败 | 出口 IP 不在白名单 | 管理后台添加可信 IP |
| macOS 二进制无法打开 | 系统安全限制 | `xattr -d com.apple.quarantine cc-connect` |
| `admin_from is not set` 警告 | 特权命令未限制用户 | 设置 `admin_from = "ou_xxx"` |
| 所有用户都能访问 | 未设置访问限制 | 设置 `allow_from = "ou_xxx"` |

### 九、升级

```bash
# npm 方式
npm install -g cc-connect

# 二进制自更新
cc-connect update           # 稳定版
cc-connect update --pre     # Beta 版
```

## 相关页面

- [[AGENTS.md集成规范]] — 定时任务自然语言调度的配置方法
- [[cc-connect-定时任务CLI]] — `cc-connect cron add` 命令详细用法
- [[消息平台权限配置]] — `allow_from` 与 `admin_from` 权限模型详解

## 来源

- [[../../../技术沉淀/cc-connect使用手册.md|cc-connect使用手册]]
- GitHub: https://github.com/chenhg5/cc-connect
