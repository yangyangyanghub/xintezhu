# AgentForge 建设方案

> 基于 OpenCode 的 Agent 执行编排系统，从队列调度到 Worktree 隔离的工程化建设路径。

---

## 核心要点

### 项目定位
- **第一阶段**：轻量本地执行编排器，不复刻 Multica
- **关键杠杆**：`opencode run --session` 作为无头执行和会话续接核心
- **Worktree 必须项**：解决 Agent 改脏主工作区问题

### MVP 不做事项
- 不做 Web Dashboard、云端 Runtime、向量 Skill 匹配
- 不做自动 merge、多人 RBAC
- 不强依赖 ACP、PTY WebSocket

### MVP Agent 配置
只建 4 类角色：`orchestrator / developer / reviewer / docwriter`

新增 Agent 标准：高频出现 + 职责边界清晰 + 输出格式稳定

---

## 关键决策

| 决策 | 定位 |
|---|---|
| PTY | Phase 0 验证，Phase 3 正式建设，不进 MVP |
| ACP | 后置，不作为调度核心，优先 VSCode 打开 worktree |
| Session ID | Agent 间"信箱"，但需配合 artifact 文件，不作为唯一上下文来源 |
| oh-my-openagent | 能力层，与 AgentForge（调度器）不互斥 |

---

## 四层架构

```text
协作层 → 编排层 → 执行层 → 基础设施层
```

- **编排层**：SQLite jobs 表 + worker loop + 状态机
- **执行层**：`opencode run --session --prompt-file`
- **基础设施层**：Git Worktree + stdout/stderr 日志 + result.json 协议

---

## 实施阶段

| 阶段 | 目标 | 关键交付 |
|---|---|---|
| Phase 0 | 能力验证 | capability-check.ts |
| Phase 1 | 最小队列执行器 | jobs 表 + worker loop + worktree 创建 |
| Phase 2 | Agent 角色与产出协议 | Agent prompt templates + result.json schema |
| Phase 3 | PTY 与实时可观测 | PTY WebSocket 集成 + Dashboard |

---

## 原文档

完整方案详见：[[myk/项目文档/基于 Opencode 的多 Agent 协作流水线建设方案]]（669 行）

---

## 关联主题

- [[OpenCode架构分析]] - OpenCode 底层能力全景
- [[Agent-as-Teammate]] - Agent 协作理念
- [[PTY-伪终端]] - PTY 技术原理
- [[MCP-协议]] - Agent 工具连接协议