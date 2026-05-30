# 基于 OpenCode 的 Agent 执行编排系统建设方案 v2

---

## 0. 结论先行

建议把本项目定位为：**基于 OpenCode 的 Agent 执行编排系统**，而不是一开始就做完整的“多 Agent 协作平台”。

核心判断：

1. **第一阶段不复刻 Multica**，先做轻量本地执行编排。
2. **OpenCode 做执行引擎**，外部 Orchestrator 做任务调度。
3. **`opencode run --session` 是关键杠杆**，用于无头执行和会话续接。
4. **Worktree 是必须项**，解决 Agent 改脏主工作区的问题。
5. **PTY / Dashboard / ACP 都后置**，不要在 MVP 阶段过早引入复杂 UI 和 IDE 协议。

一句话：

> 先把“任务入队 → 创建沙箱 → 调用 OpenCode 执行 → 产出 diff / 日志 → 人工 review”跑通，再逐步升级为 Agent-as-Teammate 平台。

---

## 1. 背景与参考依据

### 1.1 背景

当前直接使用 OpenCode / Claude Code / Codex 这类编码 Agent 时，常见问题是：

- **会话孤岛**：每个 Session 独立，Agent 之间不能自然接力。
- **执行不可控**：Agent 在当前工作区直接改代码，容易污染本地环境。
- **过程不可见**：长任务执行期间只看到最终结果，缺乏状态、日志和中间产物。
- **协作不工程化**：架构、开发、测试、审查之间仍靠人工复制粘贴上下文。

### 1.2 已有资料依据

本方案基于以下内部资料和调研沉淀：

- [[myk/wiki/topics/OpenCode架构分析]]
- [[myk/调研笔记/Multica/Multica调研报告]]
- [[myk/wiki/concepts/Agent-as-Teammate]]
- [[myk/wiki/synthesis/多Agent-平台对比-Multica-OpenCode-OpenClaw]]

关键启示：

| 来源 | 启示 |
|---|---|
| OpenCode 架构分析 | OpenCode 已具备 Agent / Session / Tool / Provider / Worktree / ACP / PTY 等底层能力 |
| Multica 调研 | 多 Agent 平台的核心不是聊天，而是任务生命周期和可观测性 |
| Agent-as-Teammate | Agent 应具备角色身份、任务责任、反馈闭环和协作协议 |
| 多平台对比 | OpenCode 适合作为可定制执行引擎，Multica 更像完整团队协作平台 |

---

## 2. 项目定位

### 2.1 不做什么

一期不做完整 Multica 替代品，不做大而全平台。

MVP 阶段明确不做：

- 不做复杂 Web Dashboard。
- 不做云端 Runtime。
- 不做 pgvector / 向量 Skill 自动匹配。
- 不做自动 merge。
- 不做多人 RBAC / 权限后台。
- 不强依赖 ACP。
- 不强依赖 OpenCode 内部 PTY WebSocket。

### 2.2 要做什么

MVP 只做一个本地可用的执行编排器：

```text
任务入队 → Worker 领取 → 创建 Worktree → opencode run 执行
       → 捕获日志 / diff → 标记完成 → 人工 Review
```

核心目标：

| 目标 | 说明 |
|---|---|
| 可调度 | 任务可以入队、领取、执行、完成、失败重试 |
| 可隔离 | 每个任务在独立 Git Worktree 中执行 |
| 可追踪 | 每个任务有日志、diff、执行状态、产物路径 |
| 可接力 | 后续阶段支持 Agent A 产出 `nextTasks`，触发 Agent B |
| 可审查 | 所有代码进入主分支前必须人工 Review |

---

## 3. 总体架构

### 3.1 四层架构

```text
┌──────────────────────────────────────────────┐
│  1. 协作层                                    │
│  - 人工 Review                                │
│  - 后续 Dashboard                             │
│  - 后续 ACP IDE 集成                           │
├──────────────────────────────────────────────┤
│  2. 编排层                                    │
│  - Queue                                      │
│  - Orchestrator                               │
│  - 状态机 / 重试 / 超时 / 取消                 │
├──────────────────────────────────────────────┤
│  3. 执行层                                    │
│  - opencode run                               │
│  - --session 会话续接                         │
│  - --agent / --model 角色和模型选择            │
│  - stdout / stderr 捕获                       │
├──────────────────────────────────────────────┤
│  4. 隔离与产物层                               │
│  - Git Worktree                               │
│  - diff artifact                              │
│  - log artifact                               │
│  - task result JSON                           │
└──────────────────────────────────────────────┘
```

### 3.2 核心链路

```text
用户 / 主 Agent
  │
  ▼
enqueue job
  │
  ▼
SQLite jobs 表
  │
  ▼
worker claim job
  │
  ▼
git worktree add .worktrees/<job-id>
  │
  ▼
opencode run "prompt" --dir <worktree> --agent <agent> --format json
  │
  ├─ stdout / stderr → logs/<job-id>.log
  ├─ git diff        → artifacts/<job-id>.diff
  └─ result.json     → artifacts/<job-id>.json
  │
  ▼
人工 Review
  │
  ├─ 通过：人工 merge / cherry-pick
  └─ 拒绝：discard worktree / 重新入队
```

### 3.3 技术栈选型

| 模块 | MVP 选型 | 版本要求 | 说明 |
|---|---|---|---|
| 运行时 | Bun | ≥ 1.2 | 优先 Bun（启动快、兼容 Node）；如遇兼容问题可切 Node |
| 包管理器 | Bun 内置 | — | 不混用 npm/pnpm，避免 lock 冲突 |
| 语言 | TypeScript | 5.x | 类型安全，利于后续扩展 |
| 编译/运行 | tsx | latest | 直接运行 .ts，无需编译步骤 |
| SQLite 客户端 | `better-sqlite3` | latest | 同步 API，调试友好；iOS 用户用 `sql.js` 替代 |
| OpenCode | opencode | ≥ 0.3 | 必须支持 `--format json` 和 `--session` |
| Git | 系统自带 | — | Worktree 依赖系统 git |
| 测试框架 | vitest | latest | 轻量、快速、TypeScript 原生支持 |
| 进程管理 | 外部脚本 + cron | — | 不引入 PM2，MVP 简单可控 |

### 3.4 项目目录结构

```
agentforge/
├── src/
│   ├── commands/
│   │   ├── enqueue.ts        # 任务入队 CLI
│   │   ├── worker.ts         # Worker 启动入口
│   │   └── status.ts         # 查询任务状态
│   ├── core/
│   │   ├── database.ts       # SQLite 连接和迁移
│   │   ├── job-queue.ts     # 队列操作（入队/领取/状态更新）
│   │   ├── worktree.ts      # Worktree 生命周期管理
│   │   ├── opencode-exec.ts # opencode run 封装
│   │   └── result-validator.ts  # result.json 验证
│   ├── agents/
│   │   ├── orchestrator.md  # 角色描述
│   │   ├── developer.md
│   │   ├── reviewer.md
│   │   └── docwriter.md
│   └── types/
│       └── index.ts          # Job、Result 等类型定义
├── scripts/
│   └── capability-check.ts   # Phase 0 验证脚本
├── tests/
│   ├── queue.test.ts
│   ├── worktree.test.ts
│   └── opencode-exec.test.ts
├── artifacts/               # 任务产物（worktree 外）
│   ├── <job-id>.diff
│   ├── <job-id>.json
│   └── <job-id>.log
├── .worktrees/               # Git Worktree 根目录
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 3.5 依赖清单

```json
{
  "dependencies": {
    "better-sqlite3": "^11.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

安装命令：`bun add better-sqlite3 && bun add -d tsx typescript vitest`

---

## 4. Phase 0：OpenCode 原生能力验证

### 4.1 目标

在写 Orchestrator 之前，先确认 OpenCode 原生 CLI 能稳定支撑执行系统。

### 4.2 验证清单

| 编号 | 验证项 | 命令示例 | 通过标准 |
|---|---|---|---|
| C1 | 新建无头会话 | `opencode run "创建 hello.txt" --format json` | 返回 JSON，可解析出 session 信息或事件流 |
| C2 | 续接会话 | `opencode run "继续修改刚才文件" --session <id> --format json` | 能继承上一轮上下文 |
| C3 | 指定目录执行 | `opencode run "读取目录" --dir <worktreeDir> --format json` | 所有读写发生在指定目录 |
| C4 | 指定 Agent | `opencode run "只分析不修改" --agent plan --format json` | 能切换 Agent 行为 |
| C5 | 指定模型 | `opencode run "执行任务" --model provider/model --format json` | 能按任务选择模型 |
| C6 | 错误捕获 | 故意传入错误目录或错误模型 | 能捕获非 0 exit / stderr / JSON error |
| C7 | 超时控制 | 外部 wrapper 设置 timeout | 超时后能杀掉进程并标记 failed |

### 4.3 Phase 0 产物

- `scripts/capability-check.ts`
- `docs/OpenCode能力验证报告.md`
- 一组最小测试记录：session 新建、session 续接、worktree 执行、失败捕获

### 4.4 通过门槛

Phase 0 全部通过，才进入 Phase 1。验证采用**全有或全无**策略：任何一项 fail，整个 Phase 0 必须重来。

| 编号 | 验证项 | 通过判断标准 |
|---|---|---|
| C1 | 新建无头会话 | stdout 包含 JSON 输出（事件流或最终结果），parse 后有 `sessionId` 或等效字段 |
| C2 | 续接会话 | 第二次调用 `--session <id>` 后，Agent 能准确描述前一次会话中完成的动作 |
| C3 | 指定目录执行 | worktree 目录内确实生成了指定的文件或修改，主目录未被污染 |
| C4 | 指定 Agent | 不同 `--agent` 参数产生明显不同的行为（如 `plan` 不修改文件，`build` 修改文件） |
| C5 | 指定模型 | `--model` 传入不存在模型时，stderr 包含模型错误信息，exit code 非 0 |
| C6 | 错误捕获 | 非 0 exit / stderr 有内容 / JSON 输出包含 `error` 字段，三者至少满足其一 |
| C7 | 超时控制 | 进程超时后被 SIGKILL 杀死，数据库中任务状态为 `failed`，`error` 字段包含 `timeout` |

如果 `--session` 不稳定（ C1 或 C2 fail ），则不要用 Session ID 做 Agent 间通信，改为 artifact 文件传递上下文。

---

## 5. Phase 1：最小队列执行器

### 5.1 目标

实现个人本地可用的最小执行系统。

### 5.2 技术选型

详细选型见「3.3 技术栈选型」，此处列出核心模块决策：

| 模块 | MVP 选型 | 原因 |
|---|---|---|
| 队列 | SQLite | 单机足够、可持久化、便于调试 |
| Worker | Bun 子进程 | 直接调用 `opencode run`，tsx 运行 TS |
| 隔离 | Git Worktree | 原生稳定，不污染主目录 |
| 日志 | 文件日志 | 简单可靠，先不接 PTY |
| Review | 人工查看 diff | 防止自动 merge 风险 |

### 5.3 jobs 表设计

```text
jobs
├── id              任务 ID
├── parentId        父任务 ID，用于任务拆解
├── dependsOn       依赖任务 ID 列表，JSON
├── title           短标题
├── prompt          原始任务指令
├── agent           OpenCode agent，如 build / plan / reviewer
├── model           provider/model，可为空
├── sessionId       OpenCode session ID
├── worktreePath    当前任务沙箱目录
├── status          pending / claimed / running / review / done / failed / cancelled
├── attempts        已重试次数
├── maxAttempts     最大重试次数
├── timeoutMs       超时时间
├── logPath         stdout / stderr 日志
├── diffPath        git diff 产物
├── resultPath      Agent 输出 JSON
├── error           失败原因
├── createdAt
├── updatedAt
├── startedAt
└── completedAt
```

### 5.4 状态机

```text
pending
  │ claim
  ▼
claimed
  │ start worker
  ▼
running
  │ success
  ▼
review
  ├─ accept  → done
  ├─ reject  → failed
  └─ requeue → pending

running
  ├─ timeout → failed
  ├─ error   → failed
  └─ cancel  → cancelled
```

### 5.5 Worker 执行规则

MVP Worker 必须满足：

1. 领取任务必须原子化，避免多个 Worker 同时领取一个任务。
2. 每个任务必须创建独立 Worktree。
3. 所有 stdout / stderr 必须写入日志文件。
4. 执行结束后必须收集 `git diff`。
5. 不自动 merge。
6. 不删除失败任务的 Worktree，便于排查。
7. 成功进入 `review` 状态，等待人工确认。

---

## 6. Agent 输出协议

### 6.1 为什么需要协议

如果 Agent 只输出自然语言，后续 Agent 很难可靠接力。

因此每个任务完成时，应要求 Agent 输出统一 JSON 摘要。

### 6.2 result.json 示例

```json
{
  "status": "success",
  "summary": "完成 JWT 鉴权中间件实现",
  "changedFiles": [
    "src/auth/middleware.ts",
    "src/auth/token.ts"
  ],
  "commands": [
    {
      "command": "npm test",
      "passed": true,
      "outputSummary": "所有 auth 相关测试通过"
    }
  ],
  "risks": [
    "refresh token 存储策略需要进一步确认"
  ],
  "nextTasks": [
    {
      "agent": "reviewer",
      "title": "审查 JWT 安全实现",
      "prompt": "请审查 JWT 鉴权实现是否存在安全风险，重点关注 token 过期、刷新、存储策略。"
    }
  ]
}
```

### 6.3 协议使用方式

- Phase 1：只保存 `result.json`，人工查看。
- Phase 2：Orchestrator 读取 `nextTasks` 自动创建后续任务。
- Phase 3：Reviewer 不通过时，自动生成 Developer 修复任务。

### 6.4 result.json 验证规则

Worker 执行结束后，必须对 `result.json` 进行**两阶段验证**：

**阶段一：JSON 合法性**

- 文件存在且可解析为 JSON
- 解析失败 → 任务标记 `failed`，`error.code = 'INVALID_JSON'`

**阶段二：必需字段**

| 字段 | 类型 | 必需 | 缺失时行为 |
|---|---|---|---|
| `status` | `string` | 是 | 标记 `failed`，`error.code = 'MISSING_STATUS'` |
| `summary` | `string` | 是 | 标记 `review_required`，提示缺少 summary |
| `changedFiles` | `string[]` | 否 | 允许空数组 |
| `commands` | `object[]` | 否 | 允许空数组 |
| `risks` | `string[]` | 否 | 允许空数组 |
| `nextTasks` | `object[]` | 否 | 允许空数组 |

**status 合规值**：`success` | `failure` | `review_required`

传入其他值时，Worker 将其视为 `review_required` 并记录警告。

**nextTasks 中每个对象必须包含**：

| 字段 | 类型 |
|---|---|
| `agent` | `string`（非空） |
| `prompt` | `string`（非空） |

缺少任一字段的 `nextTasks` 项会被忽略，并记录一条警告。

---

## 7. Worktree 生命周期

### 7.1 生命周期

```text
prepare
  │ 检查主仓库状态
  ▼
create
  │ git worktree add
  ▼
run
  │ opencode run --dir <worktree>
  ▼
collect
  │ 收集 diff / log / result
  ▼
review
  │ 人工审查
  ├─ accept  → merge / cherry-pick
  ├─ reject  → discard
  └─ retry   → 新任务 / 新 worktree
  ▼
cleanup
```

### 7.2 安全检查

创建 Worktree 前必须检查：

- 当前目录必须是 Git 仓库。
- 当前分支不能处于 rebase / merge 冲突状态。
- worktree 目标目录不能已存在。
- 目标分支名不能冲突。
- 主工作区未提交改动不会被 Agent 修改。

### 7.3 清理策略

| 状态 | 清理策略 |
|---|---|
| `done` | 可自动清理 worktree，但保留 diff 和 result |
| `failed` | 不自动清理，保留现场 |
| `cancelled` | 可人工确认后清理 |
| `review` | 不清理，等待人工处理 |

---

## 8. 失败恢复机制

### 8.1 错误码体系

所有失败类型统一使用 `error.code` 字段记录，便于程序化处理和排查。

| error.code | 含义 | 对应场景 | 处理方式 |
|---|---|---|---|
| `CLI_NOT_FOUND` | OpenCode CLI 不存在或不在 PATH | `opencode` 命令找不到 | 标记 failed，不重试 |
| `CLI_MODEL_ERROR` | 模型配置错误 | 传入不存在的 `--model` | 标记 failed，记录 stderr |
| `CLI_STARTUP_FAILED` | OpenCode 启动失败（非模型原因） | 权限问题、参数错误 | 标记 failed，记录 stderr |
| `TIMEOUT` | 执行超时 | Agent 卡住、命令不退出 | kill 进程，标记 failed |
| `WORKTREE_CREATE_FAILED` | Worktree 创建失败 | 分支冲突、目录存在、不是 Git 仓库 | 标记 failed，不重试，不启动 Worker |
| `WORKTREE_CLEANUP_FAILED` | Worktree 清理失败 | 目录被占用、权限不足 | 记录 `cleanup_error`，人工处理 |
| `INVALID_JSON` | result.json 解析失败 | Agent 输出不是合法 JSON | 标记 failed |
| `MISSING_STATUS` | result.json 缺少 status 字段 | — | 标记 failed |
| `INVALID_RESULT` | result.json 合规性验证失败 | status 值非法、nextTasks 格式错误 | 标记 `review_required` |
| `TEST_FAILED` | 测试执行失败 | `npm test` exit code 非 0 | 保留 worktree，进入 review |
| `WORKER_CANCELLED` | 任务被人为取消 | 调用 cancel API | 标记 cancelled |

### 8.2 失败类型（语义分类）

> 以下表格保留语义分类视角，程序化处理请以错误码为准。

| 类型 | 例子 | 处理方式 |
|---|---|---|
| CLI 启动失败 | `opencode` 不存在、模型错误 | 标记 `CLI_*`，记录 stderr |
| 执行超时 | Agent 卡住、命令不退出 | kill 进程，标记 `TIMEOUT` |
| Worktree 创建失败 | 分支冲突、目录存在 | 标记 `WORKTREE_CREATE_FAILED`，不重试 |
| Agent 输出不合规 | 没有 result.json / JSON 不合法 | 标记 `INVALID_JSON` / `MISSING_STATUS` |
| 测试失败 | `npm test` 失败 | 保留 worktree，进入 review |
| 清理失败 | worktree remove 失败 | 记录 `WORKTREE_CLEANUP_FAILED`，人工处理 |

### 8.3 重试策略

基于错误码决定是否重试：

| error.code | 可重试 | 重试行为 |
|---|---|---|
| `CLI_MODEL_ERROR` | 否 | 模型配置错误，重试也无用 |
| `TIMEOUT` | 是 | 创建新 worktree，最多重试 1 次 |
| `TEST_FAILED` | 是 | 保留原 worktree 进入 review，不自动重试 |
| `INVALID_RESULT` | 是 | 创建新 worktree 重试 |
| `INVALID_JSON` | 是 | 创建新 worktree 重试 |
| `MISSING_STATUS` | 是 | 创建新 worktree 重试 |
| 其他 | 否 | 标记 failed，不重试 |

默认规则：

- 最多重试 1 次。
- Worktree 创建失败（`WORKTREE_CREATE_FAILED`）不自动重试。
- 同一个 worktree 不重复运行不同任务，避免现场污染。

---

## 9. 安全边界

### 9.1 禁止默认开启的能力

MVP 阶段禁止：

- 自动 `git push`
- 自动 merge 到主分支
- 修改 `.env` / token / 证书
- 数据库迁移和批量改数
- 删除主工作区文件
- 对外发布、部署生产

### 9.2 权限策略

`--dangerously-skip-permissions` 只能在受控沙箱 Worktree 中使用。

推荐策略：

| 环境 | 权限 |
|---|---|
| 本地实验 | 可跳过权限，但必须在 worktree 内 |
| 团队环境 | 不跳过权限，关键操作进入人工审批 |
| CI 环境 | 白名单命令 + 超时限制 |

---

## 10. Agent 角色建设原则

### 10.1 不按“所有可能工种”拆 Agent

Agent 数量不是越多越强。过早拆出大量 Agent，会带来调度复杂、职责重叠、上下文传递困难、Prompt 难维护等问题。

本项目不建议一开始建设十几个甚至二十个 Agent。所谓“20 个 Agent”不是开发流程天然需要 20 个环节，而是多 Agent 系统在缺少边界时容易自然膨胀：

```text
按流程拆：需求 / 架构 / 调研 / 开发 / 测试 / 审查 / 安全 / 性能 / 文档 / 发布
按领域拆：前端 / 后端 / 数据库 / GIS / DevOps / UIUX / 依赖升级
按管理拆：任务拆解 / 进度汇总 / 失败恢复 / 质量验收
```

这些角色未来可能有价值，但不应进入 MVP。

### 10.2 MVP 只建设 4 类 Agent

第一版只需要四类稳定角色：

| Agent | 职责 | 是否修改代码 | 输出物 |
|---|---|---|---|
| `orchestrator` | 拆任务、分派、汇总、生成 `nextTasks` | 否 | 任务列表、依赖关系、验收标准 |
| `developer` | 在 Worktree 中实现明确任务 | 是 | diff、result.json、测试结果 |
| `reviewer` | 审查 diff、指出阻塞问题 | 否 | pass/fail、blockingIssues、修复建议 |
| `docwriter` | 更新 README、方案、使用说明、Obsidian 文档 | 是，仅文档 | 文档变更、引用来源 |

MVP 主链路：

```text
orchestrator → developer → reviewer → 人工 Review
                              └→ docwriter（需要文档时触发）
```

### 10.3 新增 Agent 的判断标准

后续只有同时满足以下三个条件，才新增 Agent：

1. **任务高频出现**：不是偶发需求。
2. **职责边界清晰**：与现有 Agent 不明显重叠。
3. **输出格式稳定**：能被 Orchestrator 或下游 Agent 消费。

推荐扩展顺序：

| 阶段 | 可新增 Agent | 触发条件 |
|---|---|---|
| Phase 2 后 | `tester` | 测试编写 / 测试修复任务高频出现 |
| Phase 2 后 | `security-reviewer` | 涉及认证、权限、数据安全等高风险任务 |
| Phase 3 后 | `ui-engineer` | 前端 UI / 样式任务稳定出现 |
| Phase 3 后 | `gis-engineer` | GIS / 地图组件任务稳定出现 |
| Phase 4 后 | `release-manager` | 发布、打包、版本检查进入流程 |

### 10.4 Agent 描述存放建议

AgentForge 自身应单独维护角色定义，避免散落在各项目中：

```text
agentforge/
├── agents/
│   ├── orchestrator.md
│   ├── developer.md
│   ├── reviewer.md
│   └── docwriter.md
```

Worker 启动时根据 `job.agent` 注入对应角色描述，并调用 OpenCode：

```bash
opencode run "$PROMPT" \
  --agent developer \
  --dir .worktrees/task-001 \
  --format json
```

---

## 11. Phase 2：Agent 接力协议

### 11.1 目标

从单任务执行升级为 Agent 接力。

典型链路：

```text
Architect → Developer → Reviewer → Developer 修复 → 人工 Review
```

### 11.2 实现方式

1. Architect 任务输出 `nextTasks`。
2. Orchestrator 读取 `nextTasks` 并创建子任务。
3. 子任务继承 `parentId` 和 artifact 路径。
4. Developer 完成后生成 diff。
5. Reviewer 读取 diff 和 result，输出审查意见。
6. 如果 Reviewer 不通过，创建修复任务。

### 11.3 Session ID 的使用原则

Session ID 可以作为“信箱”，但不要作为唯一上下文来源。

推荐组合：

```text
sessionId：保留对话连续性
artifactPath：保存可审计上下文
result.json：结构化传递结果
diffPath：传递代码改动
```

---

## 12. Phase 3：可观测性

### 12.1 MVP 后再做 Dashboard

Dashboard 技术选型（Phase 3 再定，此处给出推荐路径）：

| 方案 | 适用场景 | 推荐度 |
|---|---|---|
| 纯 HTML + 系统 WebView | 个人极简使用 | 仅临时演示 |
| Astro + SQLite 直连 | 有一定前端能力，想快速出活 | MVP 推荐 |
| Next.js + API Route + SQLite | 需要后续扩展、接 Auth | 长期推荐 |

Dashboard 最小功能：

- jobs 列表（筛选：状态、Agent 类型、日期范围）
- 当前状态
- Agent 名称
- worktree 路径（点击打开）
- 日志查看（实时 tail 或全量）
- diff 查看（side-by-side）
- retry / cancel / approve 按钮

### 12.2 日志路线

推荐演进：

```text
Phase 1：stdout / stderr 文件日志
Phase 3：WebSocket 推送日志
Phase 4：评估是否接入 OpenCode PTY WebSocket
```

注意：OpenCode 内部 PTY 很强，但 MVP 不应依赖它。先用进程日志，跑通系统。

---

## 13. Phase 4：ACP IDE 协作

### 13.1 定位

ACP 用于 IDE 内介入，不是调度核心。

优先支持：

- Zed ACP 集成
- 打开指定 worktree
- 人类在 IDE 中继续追问 / 修正 Agent 改动

### 13.2 谨慎点

当前应写为：

> 优先验证 Zed ACP。VSCode 是否可用，需要确认插件或协议适配，不作为一期承诺。

---

## 14. 推荐实施路线

### Phase 0：能力验证，1 天

产物：

- `capability-check.ts`
- `OpenCode能力验证报告.md`

通过标准：

- `run / session / dir / agent / model / error / timeout` 全部验证。

### Phase 1：最小队列执行器，2-3 天

产物：

- SQLite jobs 表
- enqueue 命令
- worker loop
- worktree 创建 / 收集 diff / 日志保存

通过标准：

- 一个任务能在独立 worktree 中完成修改，并进入 review 状态。

### Phase 2：Agent 接力，3-5 天

产物：

- `result.json` 协议
- `nextTasks` 自动入队
- Architect → Developer → Reviewer 链路

通过标准：

- Reviewer 能基于 Developer 的 diff 产出审查意见，不通过时能自动生成修复任务。

### Phase 3：可观测性，3-5 天

产物：

- 简单 Dashboard
- 日志实时查看
- diff 查看
- retry / cancel / approve 操作

### Phase 4：IDE 协作，后置

产物：

- Zed ACP 集成验证
- worktree 一键打开
- IDE 内追加指令

---

## 15. 最终建议

### 15.1 近期建议

不要先做 Dashboard，也不要先接 ACP。

先做：

1. Phase 0 能力验证。
2. Phase 1 本地队列执行器。
3. Worktree + diff + log 三件套。

这三件跑通后，系统才有工程价值。

### 15.2 中期建议

接入 Agent-as-Teammate 思路，但不要一开始做复杂身份系统。

先用简单角色：

- `architect`
- `developer`
- `reviewer`
- `docwriter`

等接力稳定后，再补头像、技能、团队空间、看板。

### 15.3 长期建议

最终形态可以逐步靠近 Multica：

```text
本地 Daemon + Web Dashboard + Agent 身份 + Skill 复用 + LLM Gateway
```

但这是后续演进，不是 MVP。

---

## 16. 参考资料

- [[myk/wiki/topics/OpenCode架构分析]]
- [[myk/调研笔记/Multica/Multica调研报告]]
- [[myk/wiki/concepts/Agent-as-Teammate]]
- [[myk/wiki/synthesis/多Agent-平台对比-Multica-OpenCode-OpenClaw]]
