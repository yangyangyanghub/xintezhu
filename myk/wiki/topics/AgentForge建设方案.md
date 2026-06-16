# AgentForge 建设方案

> Route B：AgentForge 保持 Agent 编排核心定位，优先复用 OpenChamber 作为 UI/workbench 集成目标，底层继续依托 OpenCode 与 Worktree 隔离。

---

## 核心要点

### 项目定位
- **路线选择**：Route B，AgentForge Core + OpenChamber UI/workbench
- **AgentForge 定位**：本地 Agent 执行编排核心，不被 OpenChamber 替代
- **关键杠杆**：`opencode run --session` 作为无头执行和会话续接核心
- **Worktree 必须项**：解决 Agent 改脏主工作区问题
- **Phase 3 重点**：先验证 OpenChamber 复用价值，再决定是否补充自建观测能力

### MVP 不做事项
- 不做自定义复杂 Dashboard，先做 OpenChamber 复用验证
- 不做云端 Runtime、向量 Skill 匹配
- 不做自动 merge、多人 RBAC
- 不强依赖 ACP、PTY WebSocket

### MVP Agent 配置
只建 4 类角色：`orchestrator / developer / reviewer / docwriter`

新增 Agent 标准：高频出现 + 职责边界清晰 + 输出格式稳定

---

## 关键决策

| 决策 | 定位 |
|---|---|
| OpenChamber | Route B 首选 UI/workbench 集成目标，优先做 PoC 与复用验证 |
| PTY | Phase 0 验证基础能力，后续按 OpenChamber 集成需要决定深度 |
| ACP | 后置，不作为调度核心；仅在 UI/workbench 集成确有收益时接入 |
| Dashboard | 不先自建复杂 Dashboard；Phase 3 以 OpenChamber 集成验证为主 |
| Session ID | Agent 间"信箱"，但需配合 artifact 文件，不作为唯一上下文来源 |
| oh-my-openagent | 能力层，与 AgentForge（调度器）不互斥 |

---

## 五层架构

```text
OpenChamber/Obsidian 工作台层 → 协调层 → AgentForge 编排层 → OpenCode 执行层 → Worktree/artifacts 基础设施层
```

- **OpenChamber/Obsidian 工作台层**：任务查看、人工介入、结果回看、知识入口
- **协调层**：任务拆分、角色选择、执行策略与人工确认
- **AgentForge 编排层**：SQLite jobs 表 + worker loop + 状态机
- **OpenCode 执行层**：`opencode run --session --prompt-file`
- **Worktree/artifacts 基础设施层**：Git Worktree + stdout/stderr 日志 + result.json 协议

---

## 实施阶段

| 阶段 | 目标 | 关键交付 |
|---|---|---|
| Phase 0 | 能力验证 | capability-check.ts |
| Phase 0.5 | OpenChamber PoC | 验证 UI/workbench 复用路径与接入边界 |
| Phase 1 | 最小队列执行器 | jobs 表 + worker loop + worktree 创建 |
| Phase 2 | Agent 角色与产出协议 | Agent prompt templates + result.json schema |
| Phase 2.5 | 能力配置 | Agent 能力、工具边界、产出协议配置化 |
| Phase 3 | OpenChamber 集成验证 | 任务流、日志、artifacts 与人工确认链路打通 |
| Phase 4 | 定时任务 | cron/scheduler + 周期性任务触发 |
| Phase 5 | 知识与记忆 | Obsidian wiki、session、artifact 的沉淀与检索 |

---

## 原文档

完整方案详见：[[myk/项目文档/基于 Opencode 的多 Agent 协作流水线建设方案]]（669 行）

---

## 关联主题

- [[OpenChamber]] - 首选 UI/workbench 集成目标
- [[OpenCode架构分析]] - OpenCode 底层能力全景
- [[Agent-as-Teammate]] - Agent 协作理念
- [[PTY-伪终端]] - PTY 技术原理
- [[MCP-协议]] - Agent 工具连接协议
