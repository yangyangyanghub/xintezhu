---
title: "Harness-OpenSpec-最佳实践"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md"
tags: [Agent, 开发工具, SDD, 规范, 实践]
status: active
---

# Harness-OpenSpec-最佳实践

> 在真实生产级 Java Spring Boot 项目中落地 OpenSpec + Claude Code 的 Harness 工程最佳实践，将不可控的 AI 编码变为可控、可审计、可复用的流程能力。

## 核心要点
- **四大核心原则**：OpenSpec 管变更生命周期 / AGENTS.md 只做导航 / 硬约束靠 permissions + hooks / 团队专用能力放 skills 和 subagents
- **七条最佳实践**：AGENTS.md 导航化 / 隐性约定文档化 / OpenSpec 只管变更 / 实现评审验证分离 / 硬护栏权限化 / hooks 自动化校验 / skills 做团队专长
- **一句话总结**：需求先工件化，知识先显性化，执行先加护栏，评审与验证必须分离
- **适用场景**：有历史包袱的业务系统、增量改造项目、需要把 AI 编码变成流程能力的团队

## 详细内容

### 推荐的仓库组织结构
```
repo/
├─ AGENTS.md                             # 通用规则：AI 入口地图
├─ CLAUDE.md                             # Claude 系统提示词
├─ REVIEW.md                             # 只读评审代理提示词
├─ docs/                                 # 项目知识库
│  ├─ architecture/
│  │  ├─ index.md                        # 项目架构总览
│  │  └─ implicit-contracts.md          # 隐性业务约定/项目坑点 ⚠️ 关键
│  ├─ product/
│  │  └─ index.md                        # 产品规则
│  └─ standards/
│     ├─ testing.md                      # 测试规范
│     └─ database.md                     # 数据库与 SQL 规范
├─ openspec/                             # OpenSpec 执行目录
│  ├─ changes/                           # 变更目录
│  │  ├─ <changes名>/
│  │  │  ├─ specs/                       # 该 change 如何工作
│  │  │  ├─ proposal.md                  # 需求拆解提案
│  │  │  ├─ design.md                    # 执行方案
│  │  │  └─ task.md                      # 执行步骤节点
│  │  └─ archive/                        # 归档
│  └─ specs/                             # 当前系统如何工作
├─ .claude/                              # Claude 项目级配置
│  ├─ settings.local.json                # 项目级权限设置
│  ├─ skills/                            # 项目级 Skills
│  │  ├─ prepare-review/                 # review 前变更审计
│  │  ├─ spring-architecture-review/     # Spring Boot 分层架构检查
│  │  └─ sql-risk-review/               # SQL/Mapper/批量更新检查
│  ├─ agents/
│  │  └─ reviewer.md                     # 只读评审代理
│  └─ hooks/
│     ├─ guard_write.py                  # 文件写入保护
│     ├─ ensure_change_context.py        # 上下文变更保护
│     └─ run_checks.sh                   # 编译检查
└─ src/
```

### 四大核心原则

| 原则 | 实现方式 |
|------|---------|
| OpenSpec 管变更生命周期 | `/opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive` |
| AGENTS.md 只做导航 | 告诉 AI"先看什么、按什么流程做"，知识放到 docs/ |
| 硬约束靠 permissions + hooks | 规则写文档是"软约束"，权限和 hook 才能拦住危险动作 |
| 团队专用动作放 skills/subagents | review 摘要、Spring 分层审查、SQL 风险审查沉淀为可复用能力 |

### 七条最佳实践

#### 1. AGENTS.md 只做导航，不做知识库
- AGENTS.md 是"入口地图"而非"百科全书"
- 必须说明：仓库工作流 / AI 先读哪些文件 / 无 change 是否允许开发 / 受保护目录 / 命令入口
- 如果 AGENTS.md 越来越长 → 说明知识没有被正确拆分到 docs/

#### 2. 隐性约定单独文档化
- 最危险的是"大家都知道，但没人写下来"的东西
- 例如：`status = null` 和 `status = 0` 不等价、前端依赖某个字段做回显
- 最佳实践：沉淀到 `docs/architecture/implicit-contracts.md`
- OpenSpec propose 阶段和 review 阶段都应检查这些约定
- **这一步做得好不好，直接决定 AI 产出的可落地程度**

#### 3. OpenSpec 只管变更生命周期，不代替全部治理
```
/opsx:propose → 需求拆解为 change 工件（proposal.md + design.md + task.md）
/opsx:apply   → 按确认的工件实施代码变更
/opsx:verify  → 检查实现是否与 change 工件一致（≠ 代码评审）
/opsx:archive → 归档完成 change，保持上下文干净
```
- **关键经验**：第一版 proposal 往往不靠谱，宁可废弃重来也不硬做

#### 4. 把"实现、评审、验证"彻底拆开
| 职责 | 工具 | 检查内容 |
|------|------|---------|
| 实现 | `/opsx:apply` | 按 tasks.md 执行 |
| OpenSpec 对齐 | `/opsx:verify` | 实现 vs 工件一致性 |
| 变更整理 | `/prepare-review` | 这次改了什么 |
| 架构审查 | `/spring-architecture-review` | Spring 分层 |
| SQL 审查 | `/sql-risk-review` | SQL/Mapper/索引风险 |
| 代码审查 | `reviewer` 子代理 | 只读视角代码审计 |

#### 5. 硬护栏必须落在 permissions + hooks
- **权限保护路径**：`application*.yml` / `bootstrap*.yml` / `db/sql/` / `infra/` / `secrets/`
- **permissions.deny** 禁止修改 + **guard_write.py** 路径校验
- **Bash 命令分层**：安全命令（`mvn test`、`git status`）放入 allow，危险命令（`git push`、`kubectl`、`rm -rf`）默认禁止

#### 6. Hooks 不只拦截，还要自动检查
| Hook | 时机 | 功能 |
|------|------|------|
| `guard_write.py` | 写入前 | 拦截受保护路径写入 |
| `ensure_change_context.py` | 命令前 | 检查是否存在 OpenSpec change |
| `run_checks.sh` | 写入后 | 自动执行编译/测试/打包检查 |

关键：让"检查会不会跑"不依赖模型自觉，变成流程自动发生。

#### 7. Skills 和 Subagent 只做团队专用能力
- 不适合塞入主提示词的能力沉淀到 `.claude/skills/` 和 `.claude/agents/`
- 三好处：**可复用**（每个 change 复用）、**可组合**（按需调用）、**可演进**（持续补充）
- 主流程负责通用约束，skills/agents 负责团队私有经验

### 标准工作流（8 步）
1. **初始化仓库**：`openspec init` → 补齐 AGENTS.md / CLAUDE.md / REVIEW.md / docs/ / .claude/
2. **创建 change**：`/opsx:propose`，需求先变工件
3. **人工审 proposal**：检查边界 / 隐性约定 / 多问题是否混成一个 change / tasks 可执行性
4. **必要时废弃重来**：proposal 拆错直接重开，比修补更省成本
5. **执行 apply**：基于确认的工件实施代码
6. **跑专项审查**：prepare-review → spring-architecture-review → sql-risk-review → reviewer agent
7. **执行 verify**：确认实现与 OpenSpec change 对齐
8. **归档**：`/opsx:archive` 结束当前 change

## 相关页面
- [[OpenSpec]]
- [[Harness-Engineering-技能工程]]
- [[规范驱动开发]]
- [[AI-Skill-生态]]
- [[AI-编码助手生态]]

## 来源
- [[../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md|[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code]]
