# Local Memory System - Operations Runbook

## 当前已支持的运行面

当前仓库已经实现并验证了以下运行能力：

- `bun run src/index.ts init`：初始化本地运行目录、数据库和 schema
- `bun run src/index.ts start`：启动本地 HTTP 服务
- `bun run src/index.ts status`：读取服务状态与统计信息
- `bun run src/index.ts projection rebuild`：执行完整 projection 重建
- `bun run src/index.ts projection verify`：校验 projection 完整性
- `bun run src/index.ts cleanup run`：执行全量 cleanup
- `GET /health`：读取服务健康状态
- `GET /api/status`：读取详细状态与统计信息
- `POST /api/projection/rebuild`：执行完整 projection 重建
- `GET /api/projection/verify`：校验 projection 完整性
- `POST /api/cleanup/run`：执行全量 cleanup
- `bun test ./.local-memory/src/test`：执行本地完整测试套件

以下模块已经在代码内实现并通过单元/集成测试覆盖核心路径，并已暴露对应运维入口：

- ingest gateway
- retrieval service
- governance / rollback
- projection engine
- cleanup service
- promotion engine

---

## Quick Start

### 1. 初始化

在仓库根目录执行：

```bash
bun run .local-memory/src/index.ts init
```

也可以在 `.local-memory/` 目录内执行：

```bash
cd .local-memory
bun run src/index.ts init
```

可选参数：

```bash
bun run src/index.ts init \
  --runtime-root .local-memory \
  --database-path .local-memory/memory.db \
  --projection-root .memory
```

### 2. 启动服务

```bash
bun run .local-memory/src/index.ts start --port 37777
```

或在 `.local-memory/` 目录内：

```bash
cd .local-memory
bun run src/index.ts start --port 37777
```

### 3. 检查健康状态

```bash
curl http://127.0.0.1:37777/health
```

预期返回示例：

```json
{
  "status": "ok",
  "localOnly": true,
  "runtimeRoot": ".local-memory",
  "version": "1.0.0",
  "timestamp": "2026-04-09T00:00:00.000Z",
  "checks": {
    "database": {
      "status": "ok"
    },
    "projection": {
      "status": "ok"
    }
  }
}
```

---

## CLI Reference

### init

初始化数据库和本地运行目录。

```bash
bun run src/index.ts init \
  --runtime-root .local-memory \
  --database-path .local-memory/memory.db \
  --projection-root .memory
```

### start

启动 HTTP 服务，暴露 health 和运维 API。

```bash
bun run src/index.ts start --port 37777
```

### status

读取当前服务状态与统计信息。

```bash
bun run src/index.ts status
```

### projection rebuild

执行完整 projection 重建。

```bash
bun run src/index.ts projection rebuild --actor cli
```

### projection verify

校验 projection 完整性。

```bash
bun run src/index.ts projection verify
```

### cleanup run

执行全量 cleanup。

```bash
bun run src/index.ts cleanup run --actor cli
```

### 参数说明

| 参数 | 说明 |
|---|---|
| `--runtime-root` | 本地运行根目录 |
| `--database-path` | SQLite 数据库路径 |
| `--projection-root` | Markdown projection 输出目录 |
| `--port` | HTTP 服务端口，默认 `37777` |
| `--actor` | 审计上下文中的执行者标识 |
| `--disable-projection` | 禁用 projection 可写检查 |

---

## HTTP Reference

### `GET /health`

返回当前服务状态。

```bash
curl http://127.0.0.1:37777/health
```

### `GET /api/status`

返回详细健康状态、数据库统计和时间戳。

```bash
curl http://127.0.0.1:37777/api/status
```

### `POST /api/projection/rebuild`

执行完整 projection 重建。

```bash
curl -X POST http://127.0.0.1:37777/api/projection/rebuild \
  -H "content-type: application/json" \
  -d '{"actor":"api"}'
```

### `GET /api/projection/verify`

校验 projection 完整性。

```bash
curl http://127.0.0.1:37777/api/projection/verify
```

### `POST /api/cleanup/run`

执行全量 cleanup。

```bash
curl -X POST http://127.0.0.1:37777/api/cleanup/run \
  -H "content-type: application/json" \
  -d '{"actor":"api"}'
```

当前版本仍未暴露以下 HTTP API：

- `/ingest`
- `/search`
- `/context`
- `/rollback/*`
- `/promotion/*`

其中 status / projection / cleanup 已通过 `/api/*` 暴露，其余仍位于内部 service/gateway 层。

---

## 测试与验证

### 运行完整测试

```bash
bun test ./.local-memory/src/test
```

当前测试覆盖以下修复面：

- schema/bootstrap
- CLI init
- 事件契约
- classification activation
- rollback source-event linkage
- degraded provider status
- projection path correctness
- projection/cleanup CLI & HTTP ops
- adapter forwarding thinness
- integration smoke paths

---

## 已验证的行为

### Bootstrap

- 可在仓库根目录运行
- 可在 `.local-memory/` 目录内运行
- schema 会正确初始化
- projection 目录会在启用时自动准备

### Retrieval / Governance

- classification 后 memory 会进入 `active`
- keyword retrieval 默认只检索 `active`
- batch rollback 可通过 `sourceEventId` 找到 memory 并回滚

### Provider degraded mode

- 未配置 embedding provider 时进入 `keyword-only` 降级模式
- adapter 状态会显式反映 degraded 原因

### Projection

- singleton 文件写入映射目录，如 `.memory/core/preferences.md`
- per-item 文件不会重复拼接 `.memory/.memory/...`

### Operations API / CLI

- `projection rebuild` 会调用 `ProjectionEngine.rebuild()`
- `projection verify` 会调用 `ProjectionEngine.verifyIntegrity()`
- `cleanup run` 会调用 `CleanupService.runFullCleanup()`

---

## 故障排查

### 1. init 失败

先确认 Bun 可用：

```bash
bun --version
```

再重新执行：

```bash
bun run .local-memory/src/index.ts init
```

### 2. health 返回 error

重点检查：

- `databasePath` 是否可写
- `projectionRoot` 是否可写
- 运行目录是否存在权限问题

### 3. 启动后访问不到 `/health`

确认端口没有冲突：

```bash
bun run .local-memory/src/index.ts start --port 37777
```

如果 37777 被占用，换一个端口：

```bash
bun run .local-memory/src/index.ts start --port 38888
```

---

## 说明

本文档只记录**已落地并已验证**的运行方式。凡是代码中尚未暴露的 service 能力，均不在此文档中伪装成可运维命令。
