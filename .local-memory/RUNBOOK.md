# Local Memory System - Operations Runbook

## 运行模型

本地记忆系统现在默认走 **OpenCode hook → resident local service → `.local-memory` ingest** 的自动链路。

- 常驻服务是 **懒启动**：正常情况下不需要手工常驻一个终端。
- 当 `session.created`、`message.updated`、`session.idle`、`session.compacted`、`file.edited` 等 hook 事件到来时，插件会先探测本地服务的 readiness。
- 如果服务未就绪，插件会自动尝试拉起 `.local-memory` 服务。
- 如果本次投递仍然失败，事件会先写入本地 outbox，等服务恢复后由 replay worker 自动补投。

---

## Quick Start

### 1. 初始化运行目录

在仓库根目录执行：

```bash
bun run .local-memory/src/index.ts init
```

常用可选参数：

```bash
bun run .local-memory/src/index.ts init \
  --runtime-root .local-memory \
  --database-path .local-memory/memory.db \
  --projection-root .memory
```

### 2. 手工启动服务（调试/运维场景）

自动记忆链路通常不需要手工启动服务；只有在联调、排障或本地压测时才需要显式启动：

```bash
bun run .local-memory/src/index.ts start --port 37777
```

如果要验证守护进程启动路径，可通过插件侧 launcher 调用的同款命令观察：

```bash
bun run .local-memory/src/index.ts start --daemon --port 37777
```

### 3. 检查 liveness 与 readiness

```bash
curl http://127.0.0.1:37777/health
curl http://127.0.0.1:37777/ready
```

- `/health` 只表示 HTTP 进程还活着（**liveness**）
- `/ready` 表示服务已经具备 ingest 能力（**readiness**）
- hook 自动上报、outbox replay、桥接状态判断都必须以 `/ready` 为准，而不是 `/health`

---

## CLI Reference

### `init`

初始化数据库、schema 与本地运行目录。

```bash
bun run .local-memory/src/index.ts init
```

### `start`

启动本地 HTTP 服务。

```bash
bun run .local-memory/src/index.ts start --port 37777
```

### `status`

读取服务健康状态、readiness 与统计信息。

```bash
bun run .local-memory/src/index.ts status
```

### `projection rebuild`

执行完整 projection 重建。

```bash
bun run .local-memory/src/index.ts projection rebuild --actor cli
```

### `projection verify`

校验 projection 完整性。

```bash
bun run .local-memory/src/index.ts projection verify
```

### `cleanup run`

执行全量 cleanup。

```bash
bun run .local-memory/src/index.ts cleanup run --actor cli
```

### 常用参数

| 参数 | 说明 |
| --- | --- |
| `--runtime-root` | 本地运行根目录 |
| `--database-path` | SQLite 数据库路径 |
| `--projection-root` | Markdown projection 输出目录 |
| `--port` | HTTP 服务端口，默认 `37777` |
| `--actor` | 审计上下文中的执行者标识 |
| `--disable-projection` | 禁用 projection 可写检查 |

---

## HTTP Reference

### `GET /health`

只返回存活状态，不校验 ingest 是否可用。

```bash
curl http://127.0.0.1:37777/health
```

示例响应：

```json
{
  "status": "ok"
}
```

### `GET /ready`

返回 ingest readiness。只有这里返回 ready，hook 自动上报才会把服务视为可投递。

```bash
curl http://127.0.0.1:37777/ready
```

就绪时通常返回 `200`，未就绪返回 `503`。

### `POST /api/ingest`

接收来自 hook bridge 的标准化 `IngestionEventInput`。

```bash
curl -X POST http://127.0.0.1:37777/api/ingest \
  -H "content-type: application/json" \
  -d '{
    "eventId": "opencode-message.updated-demo",
    "batchId": "opencode-batch-message.updated-demo",
    "eventType": "message.updated",
    "sourceType": "opencode",
    "sourceRef": "msg-demo-001",
    "workspace": "demo-workspace",
    "payload": {
      "messageId": "msg-demo-001",
      "role": "user",
      "content": "请把这条消息写进记忆系统"
    }
  }'
```

配套状态查询接口：

```bash
curl "http://127.0.0.1:37777/api/ingest/status?eventId=opencode-message.updated-demo"
curl "http://127.0.0.1:37777/api/ingest/batch?batchId=opencode-batch-message.updated-demo"
```

### `POST /api/search`

对 memory core 执行检索。

```bash
curl -X POST http://127.0.0.1:37777/api/search \
  -H "content-type: application/json" \
  -d '{
    "query": "空格缩进",
    "mode": "hybrid"
  }'
```

请求体会透传给 retrieval service：

- `query`：检索关键词
- `mode`：默认 `hybrid`
- `filters`：可选过滤条件
- `options`：可选检索参数

### `POST /api/context`

根据检索结果组装上下文。

```bash
curl -X POST http://127.0.0.1:37777/api/context \
  -H "content-type: application/json" \
  -d '{
    "query": "帮我回忆一下缩进规范",
    "workspace": "demo-workspace"
  }'
```

### `GET /api/status`

返回 health、readiness 与数据库统计的聚合状态。

```bash
curl http://127.0.0.1:37777/api/status
```

当前还保留以下运维接口：

- `POST /api/projection/rebuild`
- `GET /api/projection/verify`
- `POST /api/cleanup/run`
- `POST /api/rollback/batch`
- `POST /api/promotions/evaluate`
- `POST /api/promotions/promote`
- `POST /api/relations`
- `GET /api/relations/:memoryId`
- `DELETE /api/relations/:id`

---

## 自动投递、Outbox 与 Replay

### 正常路径

1. OpenCode hook 触发事件。
2. 插件桥接层调用 `/ready` 判断服务是否具备 ingest 能力。
3. 若服务未就绪，`ServiceLauncher` 会尝试自动启动 `.local-memory` 常驻服务。
4. 服务 ready 后，桥接层将标准化事件 `POST` 到 `/api/ingest`。

### 服务不可用时

如果以下任一情况发生：

- `/ready` 长时间不可达
- 自动拉起失败
- `/api/ingest` 投递失败

插件会把事件落入本地 outbox，而不是阻塞主流程。

### Outbox 行为

- 存储位置：`<runtime-root>/.outbox/`
- 默认容量：`1000` 条事件
- 默认大小上限：`25 MB`
- 默认 TTL：`7` 天
- 淘汰策略：按时间顺序清理过期项；超限时优先移除最旧条目

### Replay 行为

- `ReplayWorker` 会定时尝试重放 pending 事件
- replay 前先检查 `/ready`
- replay 时先查 `/api/ingest/status?eventId=...`，如果目标事件已入库，则视为幂等成功并从 outbox 删除
- 投递失败会增加 `retryCount`，并按指数退避延迟下一次尝试

---

## 测试与验证

### 关键回归测试

```bash
bun test ./.local-memory/src/test/integration.test.ts
bun test ./.opencode/plugin/memory-system/test/*.test.ts
```

其中 `integration.test.ts` 覆盖了：

- 冷启动时 hook 自动拉起服务并完成 ingest
- 服务不可用时写入 outbox，恢复后 replay 成功
- Local Memory Core 的基础端到端行为

---

## Troubleshooting

### 1. hook 触发了，但没有看到记忆入库

先检查服务是否真的 ready，而不是只看进程是否活着：

```bash
curl http://127.0.0.1:37777/health
curl http://127.0.0.1:37777/ready
```

如果 `/health` 正常但 `/ready` 返回 `503`，说明进程活着但 ingest 依赖还没准备好。

### 2. 服务没有自动拉起

重点检查：

- `bun` 是否可执行：`bun --version`
- `.local-memory/` 是否存在、是否可写
- `runtimeRoot` 下是否残留异常 `.pid` 或 `.launcher-lock`

可以手工执行：

```bash
bun run .local-memory/src/index.ts start --daemon --port 37777
```

如果仍失败，查看插件侧 `ServiceLauncher` 的 debug 日志。

### 3. 事件进了 outbox 但迟迟没有 replay

重点检查：

- `http://127.0.0.1:37777/ready` 是否恢复正常
- `<runtime-root>/.outbox/` 下是否仍有 `.json` 文件
- `/api/ingest/status?eventId=...` 是否已经能查到该事件

如果服务恢复后仍未清空 outbox，优先看 replay worker 是否拿到 `service_unavailable` 或 `delivery_failed`。

### 4. outbox 文件持续增长

这通常说明服务长期不可用，或 ingest 持续返回失败。

排查建议：

- 先修复 `/ready` 与 `/api/ingest`
- 再检查 outbox 默认限制是否被频繁打满（1000 条 / 25MB / 7 天）
- 观察是否出现持续重试同一批事件的模式

### 5. `/api/search` 或 `/api/context` 返回 500

重点检查：

- memory core 是否完成初始化
- 数据库是否可访问
- 查询参数是否缺失或结构不合法

### 6. `init` 或 `status` 失败

先确认运行环境：

```bash
bun --version
bun run .local-memory/src/index.ts init
bun run .local-memory/src/index.ts status
```

如果数据库或 projection 路径不可写，`/api/status` 和 CLI `status` 都会出现异常。
