---
title: "AI 编码规范框架对比：SDD 三剑客决策指南"
created: 2026-05-11
updated: 2026-05-11
sources:
  - "../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md"
  - "../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md"
  - "../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md"
tags: [Agent, 开发工具, SDD, 对比, 选型决策]
status: active
---

# AI 编码规范框架对比：SDD 三剑客决策指南

> [[Spec-Kit]]、[[OpenSpec]]、[[Superpowers]] 分别解决"按什么规矩干"、"改了什么"、"怎么干"三个不同层面的问题，不是互斥而是互补。本文给出对比矩阵与协同落地方案。

---

## 一句话决策

| 你的场景 | 选谁 |
|---------|------|
| 从零开始项目，要建立标准化流程 | [[Spec-Kit]] |
| 有历史代码，日常增量变更为主 | [[OpenSpec]] |
| 追求代码质量，需要 TDD + Code Review | [[Superpowers]] |
| 我全都要（推荐） | Spec-Kit 管宏观 + OpenSpec 管变更 + Superpowers 管执行 |

---

## 对比矩阵

### 定位与哲学

| 维度 | [[Spec-Kit]] | [[OpenSpec]] | [[Superpowers]] |
|------|-------------|-------------|----------------|
| **本质** | 规范管理工具 | 变更管理工具 | 执行方法论 |
| **类比** | 建筑规范手册 | 施工变更单 | 施工队工作手册 |
| **解决的问题** | 先写规范再写代码 | 每次变更可追溯 | AI 像高级工程师一样工作 |
| **刚性 vs 灵活** | 刚性强（固定五阶段） | 灵活（OPSX 灵活动作） | 中（技能按需触发） |
| **开发者** | GitHub 官方 | Fission-AI 社区 | obra/jesse |
| **Stars** | 69.1k+ | 23.7k+ | 50k+ |

### 工作流对比

| 阶段 | [[Spec-Kit]] | [[OpenSpec]] | [[Superpowers]] |
|------|-------------|-------------|----------------|
| **启动** | `constitution` 建宪法 | `new` 建变更 | `brainstorm` 探索需求 |
| **规范** | `specify` 写功能规范 | `continue` 写 proposal + specs | `write-plan` 写实施计划 |
| **设计** | `plan` 技术方案 | `design.md` 技术设计 | —（由计划覆盖） |
| **分解** | `tasks` 任务清单 | `tasks.md` 实施清单 | 计划中内置步骤 |
| **执行** | `implement` 实现 | `apply` 执行 task | `execute-plan` 分批执行 |
| **验证** | `analyze` + `checklist` | `verify` 一致检查 | `verification-before-completion` |
| **归档** | 无内置归档 | `archive` 归入知识库 | 分支合并决策 |
| **调试** | 无 | 无 | `systematic-debugging` |
| **审查** | 无 | 无 | `requesting/receiving-code-review` |

### 能力矩阵

| 能力 | [[Spec-Kit]] | [[OpenSpec]] | [[Superpowers]] |
|------|-------------|-------------|----------------|
| 项目宪法/全局约束 | ✅ `constitution.md` | ❌ 需配合 AGENTS.md | ❌ 需外部配置 |
| 功能级规范工件 | ✅ spec/plan/tasks | ✅ proposal/specs/design/tasks | ✅ 计划文档 |
| 变更生命周期管理 | ❌ 一次性流程 | ✅ new→continue→apply→archive | ❌ 无 |
| TDD 强制 | ❌ | ❌ | ✅ 核心纪律 |
| Sub-Agents 拆分 | ❌ | ❌ | ✅ 并行任务 |
| Git Worktree 隔离 | ❌ | ❌ | ✅ |
| 代码审查流程 | ❌ | ❌ | ✅ 双向审查 |
| 系统化调试 | ❌ | ❌ | ✅ |
| AI 工具兼容 | 20+ | 20+ | Claude Code/OpenCode/Codex |
| 中文技能路由 | ❌ | ❌ | ✅ 四件套 |

### 优势与局限

| 框架 | 核心优势 | 核心局限 |
|------|---------|---------|
| [[Spec-Kit]] | 结构最清晰、阶段最明确、适合团队协作、权威性最高 | 流程刚性、无归档机制、不适合快速迭代 |
| [[OpenSpec]] | 灵活迭代、变更可追溯、归档即知识库、轻量 | 无全局约束、无执行纪律、需配合其他工具 |
| [[Superpowers]] | 强制 TDD 保证质量、技能系统自适应、中文友好、子代理并行 | 不是文档管理工具、无变更生命周期、需外部规范 |

---

## 本质关系：不是三选一，而是三层楼

```
┌─────────────────────────────────────────────────┐
│  第一层：项目治理层（Spec-Kit）                    │
│  职责：项目宪法、功能级规范、全局约束              │
│  产出：constitution.md + specs/                  │
├─────────────────────────────────────────────────┤
│  第二层：变更管理层（OpenSpec）                     │
│  职责：每次变更的 lifecycle、可追溯、归档           │
│  产出：changes/ → archive/                       │
├─────────────────────────────────────────────────┤
│  第三层：执行质量层（Superpowers）                  │
│  职责：怎么干、TDD、审查、调试、验证               │
│  产出：代码 + 测试 + 审查记录                      │
└─────────────────────────────────────────────────┘
```

三者关系如同：
- **Spec-Kit** = 城市规划局（制定用地性质、容积率等宏观规则）
- **OpenSpec** = 建房申请局（每次盖房都要申请、审批、归档）
- **Superpowers** = 建筑施工队（按标准工艺施工、质检、返工）

---

## 协同方案：SDD 三剑客组合拳

### 方案 A：轻量组合（个人开发者推荐）

```
OpenSpec（变更管理）+ Superpowers（执行质量）
```

**工作流：**
1. `/opsx:new` 创建变更提案
2. `brainstorm` 探索需求（Superpowers）
3. `/opsx:continue` 完成 specs + design + tasks
4. `write-plan` 编写实施计划（Superpowers）
5. `execute-plan` 分批执行，TDD-first（Superpowers）
6. `verification-before-completion` 验证（Superpowers）
7. `/opsx:archive` 归档变更

**适合场景**：个人项目、中小团队、日常增量开发

### 方案 B：完整组合（团队项目推荐）

```
Spec-Kit（项目规范）+ OpenSpec（变更管理）+ Superpowers（执行质量）
```

**工作流：**
1. `speckit.constitution` 建立项目宪法（仅项目初始化一次）
2. 新功能：`speckit.specify` → `speckit.plan` → `speckit.tasks`
3. 日常变更：`/opsx:new` 关联已有 spec
4. `brainstorm` → `write-plan` → `execute-plan`（Superpowers）
5. TDD + Code Review + 验证（Superpowers）
6. `/opsx:archive` 归档，更新 openspec/specs/
7. `speckit.analyze` 检查跨工件一致性（可选）

**适合场景**：10 人以上团队、长期项目、质量要求高

### 方案 C：Spec-Kit 单用（规范驱动起步）

```
仅 Spec-Kit
```

**工作流：**
1. `speckit.constitution` → `speckit.specify` → `speckit.plan` → `speckit.tasks` → `speckit.implement`
2. 可选：`speckit.clarify`、`speckit.analyze`、`speckit.checklist`

**适合场景**：从零开始项目、需要快速建立标准化流程、团队 AI 编码经验不足

---

## 洋哥应该选哪个？

### 当前现状判断

我们日常工作环境（OpenCode + AGENTS.md + skills 系统）**已经在用 Superpowers 的执行纪律**：
- TDD-first ✅（`test-driven-development` 技能）
- 代码审查 ✅（`requesting/receiving-code-review`）
- 系统化调试 ✅（`systematic-debugging`）
- 中文技能路由 ✅（四件套）
- 子代理 ✅（`subagent-driven-development`）

**缺口在变更管理**：当前没有规范的变更生命周期，功能做完就完了，追溯靠 git log 和记忆。

### 推荐方案

> **优先引入 [[OpenSpec]] 做变更管理，叠加已有的 [[Superpowers]] 执行纪律。**

**理由**：
1. ~~Spec-Kit 的 constitution/specify 我们已有 AGENTS.md 替代，重复建设意义不大~~
2. OpenSpec 轻量、灵活，不改变现有工作习惯，只增加变更记录这一步
3. OpenSpec 的 `archive` 天然形成项目级知识库，与 [[规范驱动开发]] 理念一致
4. Superpowers 的执行质量我们已在用，零成本复用
5. 未来团队扩大时，再引入 Spec-Kit 做全局约束

### 落地步骤

```
第 1 步：openspec init（5 分钟）
第 2 挑：下次新功能先跑一遍 /opsx:new → /opsx:continue → /opsx:apply（磨合流程）
第 3 步：习惯后配合 Superpowers 的 brainstorm + execute-plan（完整协同）
第 4 步：定期 review archive/，提取经验反哺 AGENTS.md
```

---

## 与 [[技能类型对比-认知型-执行型-工作流型|技能类型对比]] 的关系

从技能类型视角看：

| 框架 | 技能类型 | 说明 |
|------|---------|------|
| [[Spec-Kit]] | 工作流型 | 定义"怎么按规范做"的流程 |
| [[OpenSpec]] | 工作流型 | 定义"变更怎么管理"的流程 |
| [[Superpowers]] | 工作流型 + 执行型 | 既定义流程，又提供执行能力（TDD/Debug/Review） |

三者都属于**工作流型技能**的范畴，解决"怎么把活干规范"的问题。与**认知型技能**（决定做什么）和**执行型技能**（决定怎么做到）形成完整的三层能力栈，详见 [[技能类型对比-认知型-执行型-工作流型]]。

## 相关页面

- [[Spec-Kit]] — 五阶段规范驱动框架
- [[OpenSpec]] — 轻量变更管理工具
- [[Superpowers]] — AI 执行方法论
- [[规范驱动开发]] — SDD 方法论基础
- [[技能类型对比-认知型-执行型-工作流型]] — 技能生态分层
- [[AI编程规范框架对比]] — 三框架详细对比

## 来源

- [[../技术沉淀/AI生态/AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南.md|AI 编程三剑客：Spec-Kit、OpenSpec、Superpowers 深度对比与实战指南]]
- [[../技术沉淀/AI生态/[万字长文预警] Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code.md|Harness 最佳实践：在 Java Spring Boot 项目中落地 OpenSpec + Claude Code]]
- [[../技术沉淀/AI生态/推荐我日常高频使用的8个Skills，产出效率翻一倍.md|推荐我日常高频使用的8个Skills]]
