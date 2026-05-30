---
title: "AI 工作空间配置指南"
created: 2026-05-11
updated: 2026-05-11
sources: ["../../技术沉淀/AI工作空间配置指南.md"]
tags: [开发工具, 规范, 模板, Agent]
status: active
---

# AI 工作空间配置指南

> my-ai-workspace（Obsidian Vault + OpenCode 工作空间）的完整配置方案，涵盖目录结构、技能体系、记忆系统、Obsidian 插件、Git 配置及灾难恢复步骤。

## 核心要点

- **定位**：AI 助理（辛特助/阿辛）日常工作空间 + 洋哥个人知识库，采用左右脑协作模式
- **核心配置**：`AGENTS.md`（项目级工作规范）+ `.opencode/`（OpenCode 配置）+ `~/.config/opencode/opencode.json`（用户级配置）
- **技能体系**：17 个本地项目技能 + 多个用户级技能，覆盖学术追踪、GIS、图像处理、文档生成等场景
- **记忆系统**：Core/Episodic/Semantic/Working 四层架构，通过 Hook 自动触发
- **安全红线**：`.obsidian/`、`.memory/`、敏感配置均被 gitignore 排除，禁止提交

## 详细内容

### 一、空间定位与身份

| 维度 | 说明 |
|------|------|
| 名称 | my-ai-workspace |
| 类型 | Obsidian Vault + OpenCode 工作空间 |
| AI 身份 | 辛特助（阿辛）— 最强大脑·隐藏左脑 |
| 搭档 | 洋哥（右脑）— 主导决策，阿辛负责落地 |
| 协作原则 | 洋哥主导决策，阿辛执行兜底，共同成长 |

### 二、目录结构全景

```
my-ai-workspace/
├── AGENTS.md                    # 【核心】项目级工作规范（必须提交 Git）
├── .gitignore                   # 根目录忽略规则
├── GLOBAL_WORKFLOW_REFERENCE.md # 全局工作流参考
│
├── .opencode/                   # OpenCode 项目配置
│   ├── package.json             # 插件依赖（@opencode-ai/plugin 1.3.17）
│   ├── .gitignore               # OpenCode 忽略规则
│   └── skill/                   # 本地技能库（17 个）
│
├── .memory/                     # 记忆系统（隐藏目录，gitignore 排除）
│   ├── snapshot.md              # 启动加载快照
│   ├── core/                    # 核心记忆（永久）
│   ├── episodic/                # 情景记忆（7 天有效期）
│   ├── semantic/                # 语义记忆（按需）
│   └── working/                 # 工作记忆（会话级）
│
├── .obsidian/                   # Obsidian 配置（gitignore 排除）
├── 00 templates/                # 模板目录
├── assets/                      # 图片资产（generated/posters/tokens）
│
├── dailynews/                   # 每日 AI 新闻（gitignore 排除）
├── daily-report/                # 工作日报系统（.today.md / .tdlist.md）
│
├── myk/                         # 个人知识库
│   ├── 调研笔记/ / 技术沉淀/ / 技术文章/
│   ├── 提示词库/ / 闪念/ / wiki/
│   └── 设计规范/ / 项目文档/
│
├── projects/                    # 独立项目目录（academic-search 等）
├── qgis/ / qgis-source/         # QGIS 相关资源
├── scripts/                     # 脚本目录
└── temp/ / exports/ / src/      # 临时/导出/源代码
```

**Git 提交策略**：
- **必须提交**：`AGENTS.md`、`.gitignore`、技能目录（不含敏感配置）
- **禁止提交**：`.obsidian/`、`.memory/`、`dailynews/`、`daily-report/`、`assets/`、`myk/`、`*.env`

### 三、核心配置文件

#### 3.1 AGENTS.md（项目级工作规范）

包含身份性格、目录规范、每日工作流程（早间/日间/下班）、技能清单、记忆系统配置、铁律、自更新机制。

**关键铁律**：
- 新闻日期校验：涉时任务必须先输出 `当前日期：YYYY-MM-DD`
- 改完必验：改完主动跑验证命令
- 先读后改：修改文件前必须先读取确认当前状态
- 简单优先：能写 50 行就不要写 200 行

#### 3.2 OpenCode 配置

**项目级**（`.opencode/package.json`）：
```json
{
  "dependencies": {
    "@opencode-ai/plugin": "1.3.17"
  }
}
```

**用户级**（`~/.config/opencode/opencode.json`）关键内容：
- **Provider 配置**：newapi（`https://yy.cool/v1`），支持 gpt-5.4-mini / gpt-5.4 / gpt-5.3-codex / gpt-5.2 等模型
- **插件**：opencode-agent-skills、plannotator、molt-kit、claude-mem、antigravity-skills
- **自定义命令**：`/mystatus`（配额查询）、`/cmem-start`（启动 claude-mem Worker）、`/cmem-stop`、`/cmem-status`

### 四、技能体系（17 个本地技能）

#### 本地项目技能（`.opencode/skill/`）

| 技能 | 触发场景 |
|------|---------|
| `academic-tracker` | Coze 学术追踪器搭建 |
| `academic-tracker-local` | 本地学术追踪（脱离第三方） |
| `daily-report-analyzer` | 钉钉日报智能评分分析 |
| `deep-research` | 深度调研 |
| `defuddle` | 网页内容提取 |
| `gis-frontend` | GIS 前端开发 |
| `html-ppt-gen` | HTML 演示文稿生成 |
| `image-service` | 多模态图像处理 |
| `json-canvas` | JSON Canvas 文件处理 |
| `obsidian-bases` | Obsidian Bases 视图 |
| `obsidian-cli` | Obsidian CLI 交互 |
| `obsidian-markdown` | Obsidian Markdown 语法 |
| `qgis-map-maker` | PyQGIS 自动化制图 |
| `rss-news` | RSS 新闻收集 |
| `skill-creator` | 技能创建与优化 |
| `sqlite-query` | SQLite 数据库查询 |
| `token-usage-report` | API Token 使用量统计 |

#### 用户级技能（`~/.config/opencode/skill/`）

`darwin-skill`（自主优化）、`docx`（Word 文档）、`remotion-best-practices`（视频）、`smart-query`（数据库查询）、`frontend-design`（前端）、`ui-ux-pro-max`（UI/UX 设计）等。

**优先级规则**：本地项目技能优先于用户配置技能，同名以 `.opencode/skill/` 为准。

### 五、记忆系统（四层架构）

| 层级 | 目录 | 生命周期 | 用途 |
|------|------|---------|------|
| Core | `.memory/core/` | 永久 | 身份、偏好、习惯、流程 |
| Episodic | `.memory/episodic/` | 7 天 | 每日对话摘要、重要事件 |
| Semantic | `.memory/semantic/` | 按需 | 项目上下文、决策理由 |
| Working | `.memory/working/` | 会话级 | 当前任务进度、临时状态 |

**Hook 触发流程**：
- `session.created` → 加载 snapshot.md 到 working/current.md
- `message.updated` → 追加到 episodic/当天.md
- `session.idle` → 保存 working → episodic
- `session.compacted` → 触发 consolidate（合并到 core）

**核心记忆文件**：`identity.md`、`preferences.md`、`habits.md`、`workflows.md`、`token_stats.md`

### 六、Obsidian 配置

#### 核心设置
- 垃圾桶：本地（`local`）
- 新文件位置：`00 inbox` 文件夹
- 附件目录：`attachment`

#### 已安装插件（14 个）
| 插件 | 用途 |
|------|------|
| `calendar` | 日历视图 |
| `dataview` | 数据查询 |
| `obsidian-citation-plugin` | 文献引用 |
| `obsidian-image-auto-upload-plugin` | 图片自动上传 |
| `obsidian-kanban` | 看板视图 |
| `obsidian-mind-map` | 思维导图 |
| `obsidian-minimal-settings` | Minimal 主题设置 |
| `obsidian-pandoc` | Pandoc 导出 |
| `obsidian-proxy-github` | GitHub 代理 |
| `obsidian-tasks-plugin` | 任务管理 |
| `obsidian-zotero-desktop-connector` | Zotero 集成 |
| `opencode-obsidian` | OpenCode 集成 |
| `quickadd` | 快速添加 |
| `templater-obsidian` | 模板引擎 |

### 七、自定义命令

| 命令 | 描述 |
|------|------|
| `/mystatus` | 查询 AI 账户配额使用情况 |
| `/cmem-start` | 启动 claude-mem Worker 服务 |
| `/cmem-stop` | 停止 claude-mem Worker 服务 |
| `/cmem-status` | 检查 claude-mem Worker 状态 |

### 八、恢复步骤

```bash
# 1. 克隆仓库
git clone <repository-url>
cd my-ai-workspace

# 2. 安装 OpenCode 依赖
cd .opencode && bun install && cd ..

# 3. 初始化记忆系统
mkdir -p .memory/core .memory/episodic .memory/semantic .memory/working

# 4. 手动恢复敏感配置（不提交 Git）
# - .opencode/skill/image-service/config/settings.json
# - ~/.config/opencode/opencode.json（API Key 等）

# 5. 验证
opencode --version
opencode
```

### 九、故障排查

| 问题 | 解决方案 |
|------|---------|
| OpenCode 无法启动 | 清除 `~/.cache/opencode` + `~/.local/share/opencode`，重新安装 |
| 技能加载失败 | 检查 `.opencode/skill/` 目录，确认 SKILL.md 存在 |
| 记忆系统异常 | 删除 `.memory/snapshot.md`，重启 OpenCode 自动生成 |

## 相关页面
- [[OpenCode架构分析]]
- [[闪念系统配置与恢复指南]]
- [[AI-研发工具链]]

## 来源
- [[../../技术沉淀/AI工作空间配置指南.md|AI 工作空间配置指南]]
