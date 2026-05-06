---
title: "AI Skill 生态"
created: 2026-04-19
updated: 2026-04-19
sources: ["../技术沉淀/AI生态/AI生态收藏索引.md"]
tags: [AI, Skill, 技能工程, 最佳实践, Harness, OpenClaw, OpenCode]
status: active
---

# AI Skill 生态

> 2026 年 AI 编码助手的核心能力载体——从"插件"升级为"可进化的专业技能包"。

---

## 核心认知演进

| 阶段 | 认知 | 特征 |
|------|------|------|
| 1.0 | Skill = 插件 | 被动调用，一次性使用 |
| 2.0 | Skill = 方法论固化 | 将领域最佳实践写入 Markdown（SKILL.md + references） |
| 3.0 | Skill = 可进化资产 | 通过评测闭环自动优化，团队共享 |

**关键转折**：Karpathy 开源编程经验 Skills（Star 涨疯）标志着 Skill 从"工具配置"升级为"知识资产"。

---

## Skill 开发方法论

### Harness Engineering 范式

将领域最佳实践写入结构化文档，通过多智能体闭环自优化。核心原则：
- **约束先行**：告诉 AI"不要做什么"比"能做什么"更重要
- **双层架构**：SKILL.md（索引层 <1000 行）+ references/（详情层 200-500 行）
- **评测闭环**：EvalAgent → RenderAgent → AnalyzeAgent → OptimizeAgent → ↻
- **安全护栏**：Git Worktree 隔离 + 内容防退化 + 责任判断

**效果**：从 80% 成功率提升至 **98.2%**（174 测试用例验证）。

### 开源 Skill 项目管理器

| 项目 | Stars | 特点 |
|------|-------|------|
| **SkillHub** | — | 开源 Skill 市场 |
| **darwin.skill** | — | 无限进化的 skill 系统 |
| **repo2skill** | — | 一键将任意仓库转换为 AI 技能 |
| **Agent Skills 市场**（OpenClaw） | — | 官方 Skill 分发渠道 |

---

## 高频推荐 Skill 清单

### 研发场景（Top 10）

1. **chart-visualization-skills**（蚂蚁集团）— 6 大可视化 Skill，覆盖所有图表场景
2. **web-design-guidelines**（Vercel）— 把顶级设计师直觉变为代码审查，每周 13 万次安装
3. **claude-mem** — AI 自动记忆系统，记住上次干什么
4. **excalidraw-diagram-generator** — 让 AI 画图不再只会输出文字
5. **OpenSpec** — 3 步工作流 × 3 种场景，新老项目通用的 Spec 驱动发
6. **colleague-skill** — 把同事蒸馏成 AI Skill，3 天近 5000 Star
7. **Apifox CLI + Claude Skills** — 接口自动化测试融入研发工作流

### 一人公司/创业场景

- **16 个 Skill 组合**：无员工运营一家公司
- **花叔 20 个 AI 创作 Skills**：从选题到发布全链路
- **baoyu-skills**：AI 内容创业神器

### 数据分析场景

- 数据分析流程 Skill 化
- AI 驱动 Excel 可视化报告

---

## Skill 管理最佳实践

| 实践 | 说明 |
|------|------|
| **从"装得多"到"装得准"** | 用了 3 个月近百个 Skills，最后只剩高频实用的 |
| **Skill 不是插件** | 不能当插件用，要当方法论固化 |
| **能进化的才是好 Skill** | 静态 Skill 会过时，自进化系统才有长期价值 |
| **团队共享 > 个人沉淀** | Multica 的 Skill 共享模式值得借鉴 |

---

## 2026 Skill 资源站

| 资源 | 内容 |
|------|------|
| Skill 资源站大盘点 | 10 个必收藏的 Skills 宝藏入口 |
| 423 个神级 Skills 一键下载 | Agent 能力开始被"工程化" |
| 30+ 插件让 AI 编码如虎添翼 | OpenCode 生态全解析 |
| OpenClaw 官宣 ClawHub 中国镜像站 | 与火山引擎共建，解决限速问题 |

---

## 与 [[Agent-as-Teammate]] 的关系

Skill 是 Agent 的**能力载体**，Agent-as-Teammate 是**组织范式**：

```
Agent 个体能力 = 内置能力 + 加载的 Skills
Agent 团队协作 = 各自加载不同技能包的 Agent 协同工作
```

## 与 [[Harness-Engineering-技能工程|Harness Engineering 技能工程]] 的关系

Harness Engineering 是 Skill 开发的**方法论框架**，本页面是从 209 篇 AI 生态收藏中提炼出的**实践全景**。

## 来源
- [[myk/技术沉淀/AI生态/AI生态收藏索引|AI 生态微信收藏索引]]（209 篇）
