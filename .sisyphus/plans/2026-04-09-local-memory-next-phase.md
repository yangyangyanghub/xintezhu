# Local Memory Next Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `.local-memory` 从“内部能力已存在”推进到“可通过 API/CLI 实际操作”，并补齐真实 semantic retrieval、promotion/relations 闭环、projection/cleanup 运维化。

**Architecture:** 继续沿用 `MemoryCoreService` 作为启动与依赖装配入口，在其上新增一层薄 HTTP/CLI 暴露层。HTTP 只负责编排与校验，业务逻辑继续留在 `ingest`、`retrieval`、`governance`、`promotion`、`relations`、`projection`、`cleanup` 等内部模块，避免把控制器写成大杂烩。语义检索单独补 embeddings 持久化与 provider-backed 查询，其他能力通过显式命令与端点暴露，不在 adapter 里偷塞业务规则。

**Tech Stack:** Bun (`Bun.serve`, `bun:test`, `bun:sqlite`), SQLite/FTS5, TypeScript, 本地文件 projection。

---

## Phase 0: Documentation Discovery & Guardrails

### 当前已验证边界

- 已暴露运行面：`src/index.ts` 的 `init`、`start` 与 `GET /health`
- 已实现但未暴露：
  - `src/ingest/gateway.ts` → `ingestEvent` / `ingestBatch` / `getEventStatus` / `getBatchEvents`
  - `src/retrieval/service.ts` → `search` / `semanticSearch` / `hybridSearch`
  - `src/context/assembly.ts` → `assemble`
  - `src/governance/index.ts` → `rollback*` / `forgetMemory` / `restoreMemory`
  - `src/promotion/engine.ts` → `evaluate` / `promote` / `batchEvaluate` / `autoPromote`
  - `src/relations/engine.ts` → `createRelation` / `getRelationsFrom` / `getRelationsTo` / `getLineage`
  - `src/projection/engine.ts` → `rebuild` / `projectMemory` / `verifyIntegrity`
  - `src/cleanup/service.ts` → `runFullCleanup` / `decayEpisodic` / `cleanupEmbeddings` / `repairOrphanedRelations`

### Allowed APIs (must follow)

- Bun HTTP
  - `Bun.serve({ routes, fetch })`
  - `Response.json(...)`
  - `await req.json()`
  - `req.params` for parameterized routes
  - Source: Bun official docs (`routing`, `api/http`) via librarian research on 2026-04-09
- Bun SQLite
  - `new Database(path)` / `new Database(':memory:')`
  - `db.run(...)`, `db.query(...).get()/.all()`, `db.transaction(fn)`
  - `PRAGMA journal_mode = WAL` for file-backed runtime DB
  - Source: Bun official sqlite docs via librarian research on 2026-04-09

### Anti-pattern guards

- 不要把新业务逻辑塞回 `src/adapter/opencode.ts`
- 不要在 HTTP handler 里直接写 SQL；统一走 repository/service
- 不要把 semantic retrieval 做成“假成功 + 空数组”；provider 不可用时要显式 degraded
- 不要在 RUNBOOK 里写尚未暴露的命令/接口

---

## File Map

### 新增文件

- `/.local-memory/src/http/server.ts` — 创建 `Bun.serve` 实例，集中注册 routes
- `/.local-memory/src/http/routes.ts` — 导出 routes 对象与公共错误响应
- `/.local-memory/src/http/handlers/ingest.ts` — `/api/ingest` 与事件状态相关 handler
- `/.local-memory/src/http/handlers/search.ts` — `/api/search` 与 `/api/context` handler
- `/.local-memory/src/http/handlers/ops.ts` — `/api/status`、`/api/projection/*`、`/api/cleanup/*`、`/api/rollback/*`
- `/.local-memory/src/repository/embedding.ts` — embeddings 的增删查改与 query helper
- `/.local-memory/src/repository/promotion.ts` — `memory_promotions` 的持久化访问
- `/.local-memory/src/test/http.server.test.ts` — HTTP server smoke tests
- `/.local-memory/src/test/http.ingest-search.test.ts` — ingest/search/context API tests
- `/.local-memory/src/test/http.ops.test.ts` — rollback/projection/cleanup/status API tests
- `/.local-memory/src/test/cli.ops.test.ts` — CLI 新命令 smoke tests
- `/.local-memory/src/test/retrieval.semantic.test.ts` — semantic/hybrid retrieval tests
- `/.local-memory/src/test/promotion.engine.test.ts` — promotion persistence & flow tests
- `/.local-memory/src/test/relations.engine.test.ts` — relation creation/query tests
- `/.local-memory/src/test/cleanup.service.test.ts` — cleanup/report/projection cleanup tests

### 修改文件

- `/.local-memory/src/index.ts` — 从单一 `init/start` 入口扩展为命令分发器
- `/.local-memory/src/service/core.ts` — 暴露 HTTP/CLI 所需依赖装配 helper
- `/.local-memory/src/retrieval/service.ts` — 实现真实 semantic retrieval 与 hybrid merge
- `/.local-memory/src/provider/router.ts` — provider 就绪、模型元信息、降级原因一致化
- `/.local-memory/src/promotion/engine.ts` — 把 promotion record 真正写入 `memory_promotions`
- `/.local-memory/src/relations/engine.ts` — 增加更清晰的 query surface，支持 API 直接调用
- `/.local-memory/src/projection/engine.ts` — 暴露 rebuild / verify / remove 的稳定返回结构
- `/.local-memory/src/cleanup/service.ts` — 统一报告结构，便于 CLI/API 返回
- `/.local-memory/RUNBOOK.md` — 同步新增命令与端点

---

## Phase 1: Expose HTTP API Surface

### Task 1: Extract HTTP server wiring from `src/index.ts`

**Files:**
- Create: `/.local-memory/src/http/server.ts`
- Create: `/.local-memory/src/http/routes.ts`
- Modify: `/.local-memory/src/index.ts`
- Test: `/.local-memory/src/test/http.server.test.ts`

- [x] **Step 1: Write the failing HTTP smoke test**

```ts
import { describe, expect, it } from 'bun:test';
import { createServer } from '../http/server.ts';

describe('HTTP server', () => {
  it('serves /health and returns 404 for unknown routes', async () => {
    const server = await createServer({ port: 0 });
    const baseUrl = `http://127.0.0.1:${server.port}`;

    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);

    const notFound = await fetch(`${baseUrl}/api/unknown`);
    expect(notFound.status).toBe(404);

    server.stop(true);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test ./.local-memory/src/test/http.server.test.ts`
Expected: FAIL with `Cannot find module '../http/server.ts'`

- [x] **Step 3: Add minimal HTTP server module**

```ts
// /.local-memory/src/http/server.ts
import { buildRoutes } from './routes.ts';

export function createServer(options: { port?: number }) {
  const server = Bun.serve({
    port: options.port ?? 37777,
    routes: buildRoutes(),
    fetch() {
      return Response.json({ error: 'Not Found' }, { status: 404 });
    },
  });

  return server;
}
```

- [x] **Step 4: Update `src/index.ts` to call `createServer()` for `start`**

Run: `bun test ./.local-memory/src/test/http.server.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add .local-memory/src/http/server.ts .local-memory/src/http/routes.ts .local-memory/src/index.ts .local-memory/src/test/http.server.test.ts
git commit -m "feat: 提取 local-memory HTTP 服务入口"
```

### Task 2: Add ingest/search/context endpoints

**Files:**
- Create: `/.local-memory/src/http/handlers/ingest.ts`
- Create: `/.local-memory/src/http/handlers/search.ts`
- Modify: `/.local-memory/src/http/routes.ts`
- Test: `/.local-memory/src/test/http.ingest-search.test.ts`

- [x] **Step 1: Write failing API tests**

```ts
it('accepts /api/ingest and returns ingestion ids', async () => {
  const response = await fetch(`${baseUrl}/api/ingest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: 'evt-api-001',
      batchId: 'batch-api-001',
      eventType: 'message.updated',
      sourceType: 'manual',
      sourceRef: 'api-test',
      payload: { messageId: 'msg-api-001', role: 'user', content: '来自 API 的记忆' },
    }),
  });

  expect(response.status).toBe(200);
});

it('returns search results from /api/search', async () => {
  const response = await fetch(`${baseUrl}/api/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: 'API 的记忆', mode: 'keyword' }),
  });

  expect(response.status).toBe(200);
  expect((await response.json()).results.length).toBeGreaterThan(0);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test ./.local-memory/src/test/http.ingest-search.test.ts`
Expected: FAIL with `404` or missing route/module

- [x] **Step 3: Implement thin handlers**

```ts
// /.local-memory/src/http/handlers/ingest.ts
export async function handleIngest(req: Request, deps: HttpDeps) {
  const body = await req.json();
  const result = await deps.ingestGateway.ingestEvent(body);
  return Response.json(result, { status: result.accepted ? 200 : 400 });
}

// /.local-memory/src/http/handlers/search.ts
export async function handleSearch(req: Request, deps: HttpDeps) {
  const body = await req.json();
  const result = await deps.retrieval.search(body.query, body.mode ?? 'hybrid', body.filters, body.options);
  return Response.json(result);
}
```

- [x] **Step 4: Add `/api/context` endpoint**

```ts
export async function handleContext(req: Request, deps: HttpDeps) {
  const body = await req.json();
  const assembly = await deps.contextAssembly.assemble(body.query, body.workspace);
  return Response.json(assembly);
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `bun test ./.local-memory/src/test/http.ingest-search.test.ts`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add .local-memory/src/http/handlers/ingest.ts .local-memory/src/http/handlers/search.ts .local-memory/src/http/routes.ts .local-memory/src/test/http.ingest-search.test.ts
git commit -m "feat: 暴露 local-memory ingest 与 search API"
```

### Task 3: Add operational endpoints

**Files:**
- Create: `/.local-memory/src/http/handlers/ops.ts`
- Modify: `/.local-memory/src/http/routes.ts`
- Test: `/.local-memory/src/test/http.ops.test.ts`

- [x] **Step 1: Write failing ops tests**

```ts
it('returns detailed status from /api/status', async () => {
  const response = await fetch(`${baseUrl}/api/status`);
  expect(response.status).toBe(200);
});

it('triggers projection rebuild via /api/projection/rebuild', async () => {
  const response = await fetch(`${baseUrl}/api/projection/rebuild`, { method: 'POST' });
  expect(response.status).toBe(200);
});
```

- [x] **Step 2: Implement ops handlers**

Expose:
- `GET /api/status`
- `POST /api/projection/rebuild`
- `POST /api/cleanup/run`
- `POST /api/rollback/batch`

- [x] **Step 3: Run test to verify it passes**

Run: `bun test ./.local-memory/src/test/http.ops.test.ts`
Expected: PASS

- [x] **Step 4: Commit**

```bash
git add .local-memory/src/http/handlers/ops.ts .local-memory/src/http/routes.ts .local-memory/src/test/http.ops.test.ts
git commit -m "feat: 暴露 local-memory 运维 API"
```

---

## Phase 2: Expand CLI Surface

### Task 4: Add CLI commands for ingest/search/context/status

**Files:**
- Modify: `/.local-memory/src/index.ts`
- Test: `/.local-memory/src/test/cli.ops.test.ts`
- Docs: `/.local-memory/RUNBOOK.md`

- [x] **Step 1: Write failing CLI smoke tests**

```ts
it('supports search command', () => {
  const result = Bun.spawnSync({
    cmd: ['bun', 'run', 'src/index.ts', 'search', '--query', '测试'],
    cwd: localMemoryRoot,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  expect(result.exitCode).toBe(0);
});
```

- [x] **Step 2: Add commands**

Support these commands:
- `status`
- `ingest --event-file <path>`
- `search --query <text> --mode keyword|hybrid|semantic`
- `context --query <text>`

- [x] **Step 3: Run test to verify it passes**

Run: `bun test ./.local-memory/src/test/cli.ops.test.ts`
Expected: PASS

- [x] **Step 4: Update RUNBOOK**

Document only commands actually implemented.

- [x] **Step 5: Commit**

```bash
git add .local-memory/src/index.ts .local-memory/src/test/cli.ops.test.ts .local-memory/RUNBOOK.md
git commit -m "feat: 扩展 local-memory CLI 命令"
```

---

## Phase 3: Implement Real Semantic Retrieval

### Task 5: Add embedding repository and persistence path

**Files:**
- Create: `/.local-memory/src/repository/embedding.ts`
- Modify: `/.local-memory/src/repository/index.ts`
- Modify: `/.local-memory/src/classifier/service.ts`
- Test: `/.local-memory/src/test/retrieval.semantic.test.ts`

- [x] **Step 1: Write failing semantic persistence test**

```ts
it('stores embeddings for active memories when provider is healthy', async () => {
  const result = await retrieval.search('语义查询', 'semantic');
  expect(result.mode).toBe('semantic');
  expect(result.results.length).toBeGreaterThan(0);
});
```

- [x] **Step 2: Implement `EmbeddingRepository`**

```ts
export interface EmbeddingRepository {
  upsert(memoryId: string, embedding: Float32Array, meta: { modelName: string; modelVersion: string }): Promise<void>;
  findByMemoryId(memoryId: string): Promise<StoredEmbedding | null>;
  listByMemoryIds(memoryIds: string[]): Promise<StoredEmbedding[]>;
}
```

- [x] **Step 3: Persist embedding during classification or post-classification hook**

Only generate embeddings when:
- memory is `active`
- embedding provider is healthy

- [ ] **Step 4: Run targeted test**

Run: `bun test ./.local-memory/src/test/retrieval.semantic.test.ts`
Expected: PASS or next failure moves to search ranking

### Task 6: Replace placeholder semantic search with provider-backed similarity

**Files:**
- Modify: `/.local-memory/src/retrieval/service.ts`
- Modify: `/.local-memory/src/provider/router.ts`
- Test: `/.local-memory/src/test/retrieval.semantic.test.ts`

- [x] **Step 1: Extend the failing test**

```ts
it('degrades hybrid to keyword when provider is unavailable, but uses semantic mode when provider is healthy', async () => {
  const result = await retrieval.search('偏好', 'hybrid');
  expect(result.degraded).toBe(false);
});
```

- [x] **Step 2: Implement cosine similarity over stored embeddings**

```ts
private cosineSimilarity(a: Float32Array, b: Float32Array): number {
  // dot(a,b) / (|a| * |b|)
}
```

- [x] **Step 3: Query all candidate embeddings, score, merge with keyword RRF**

Do not invent vector SQL extensions; V1 can compute similarity in process.

- [x] **Step 4: Run tests**

Run: `bun test ./.local-memory/src/test/retrieval.semantic.test.ts ./.local-memory/src/test/integration.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add .local-memory/src/repository/embedding.ts .local-memory/src/repository/index.ts .local-memory/src/classifier/service.ts .local-memory/src/retrieval/service.ts .local-memory/src/provider/router.ts .local-memory/src/test/retrieval.semantic.test.ts
git commit -m "feat: 实现 local-memory 真实语义检索"
```

---

## Phase 4: Close Promotion & Relations Loop

### Task 7: Persist promotion records to `memory_promotions`

**Files:**
- Create: `/.local-memory/src/repository/promotion.ts`
- Modify: `/.local-memory/src/repository/index.ts`
- Modify: `/.local-memory/src/promotion/engine.ts`
- Test: `/.local-memory/src/test/promotion.engine.test.ts`

- [ ] **Step 1: Write failing promotion persistence test**

```ts
it('writes approved promotion records to memory_promotions', async () => {
  const result = await promotionEngine.promote(memoryId, { actor: 'test' }, true);
  expect(result.promoted).toBe(true);
  expect(await promotionRepo.findByMemoryId(memoryId)).toHaveLength(1);
});
```

- [ ] **Step 2: Implement repository and persist from engine**

- [ ] **Step 3: Run test**

Run: `bun test ./.local-memory/src/test/promotion.engine.test.ts`
Expected: PASS

### Task 8: Expose relation/promotion management surfaces

**Files:**
- Modify: `/.local-memory/src/relations/engine.ts`
- Modify: `/.local-memory/src/http/handlers/ops.ts`
- Modify: `/.local-memory/src/index.ts`
- Test: `/.local-memory/src/test/relations.engine.test.ts`
- Test: `/.local-memory/src/test/http.ops.test.ts`

- [ ] **Step 1: Add relation tests**

Cover:
- create relation
- query lineage
- deactivate relation

- [ ] **Step 2: Add API/CLI for promotion + relations**

Expose:
- `POST /api/promotions/evaluate`
- `POST /api/promotions/promote`
- `POST /api/relations`
- `GET /api/relations/:memoryId`
- CLI counterparts: `promote`, `relations`

- [ ] **Step 3: Run tests**

Run: `bun test ./.local-memory/src/test/promotion.engine.test.ts ./.local-memory/src/test/relations.engine.test.ts ./.local-memory/src/test/http.ops.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add .local-memory/src/repository/promotion.ts .local-memory/src/repository/index.ts .local-memory/src/promotion/engine.ts .local-memory/src/relations/engine.ts .local-memory/src/http/handlers/ops.ts .local-memory/src/index.ts .local-memory/src/test/promotion.engine.test.ts .local-memory/src/test/relations.engine.test.ts .local-memory/src/test/http.ops.test.ts
git commit -m "feat: 打通 local-memory promotion 与 relation 管理面"
```

---

## Phase 5: Operationalize Projection & Cleanup

### Task 9: Standardize projection/cleanup result contracts

**Files:**
- Modify: `/.local-memory/src/projection/engine.ts`
- Modify: `/.local-memory/src/cleanup/service.ts`
- Test: `/.local-memory/src/test/cleanup.service.test.ts`
- Test: `/.local-memory/src/test/projection.engine.test.ts`

- [ ] **Step 1: Write failing ops result tests**

```ts
it('returns structured rebuild report from projection engine', async () => {
  const result = await projectionEngine.rebuild({ actor: 'test' });
  expect(result.projected).toBeGreaterThanOrEqual(0);
});

it('returns structured cleanup report', async () => {
  const report = await cleanupService.runFullCleanup({ actor: 'test' });
  expect(report.results.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Normalize return payloads**

Projection should return counts and errors.
Cleanup should keep current report shape but ensure API-safe serialization.

- [ ] **Step 3: Run tests**

Run: `bun test ./.local-memory/src/test/cleanup.service.test.ts ./.local-memory/src/test/projection.engine.test.ts`
Expected: PASS

### Task 10: Expose projection/cleanup commands and endpoints

**Files:**
- Modify: `/.local-memory/src/http/handlers/ops.ts`
- Modify: `/.local-memory/src/index.ts`
- Modify: `/.local-memory/RUNBOOK.md`
- Test: `/.local-memory/src/test/http.ops.test.ts`
- Test: `/.local-memory/src/test/cli.ops.test.ts`

- [ ] **Step 1: Add failing smoke tests**

Cover:
- `POST /api/projection/rebuild`
- `GET /api/projection/verify`
- `POST /api/cleanup/run`
- `bun run src/index.ts projection rebuild`
- `bun run src/index.ts cleanup run`

- [ ] **Step 2: Implement handlers and commands**

- [ ] **Step 3: Update RUNBOOK with only verified commands**

- [ ] **Step 4: Run tests**

Run: `bun test ./.local-memory/src/test/http.ops.test.ts ./.local-memory/src/test/cli.ops.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .local-memory/src/projection/engine.ts .local-memory/src/cleanup/service.ts .local-memory/src/http/handlers/ops.ts .local-memory/src/index.ts .local-memory/src/test/cleanup.service.test.ts .local-memory/src/test/http.ops.test.ts .local-memory/src/test/cli.ops.test.ts .local-memory/RUNBOOK.md
git commit -m "feat: 暴露 local-memory projection 与 cleanup 运维面"
```

---

## Final Verification Phase

### Task 11: Verify implementation matches plan and docs

**Files:**
- Modify: `/.local-memory/RUNBOOK.md` (only if verification reveals drift)
- Test: existing full test suite + new API/CLI tests

- [ ] **Step 1: Run targeted suite by phase**

```bash
bun test ./.local-memory/src/test/http.server.test.ts
bun test ./.local-memory/src/test/http.ingest-search.test.ts
bun test ./.local-memory/src/test/http.ops.test.ts
bun test ./.local-memory/src/test/cli.ops.test.ts
bun test ./.local-memory/src/test/retrieval.semantic.test.ts
bun test ./.local-memory/src/test/promotion.engine.test.ts
bun test ./.local-memory/src/test/relations.engine.test.ts
bun test ./.local-memory/src/test/cleanup.service.test.ts
```

- [ ] **Step 2: Run full suite**

Run: `bun test ./.local-memory/src/test`
Expected: all green

- [ ] **Step 3: Run manual smoke commands**

```bash
bun run .local-memory/src/index.ts init
bun run .local-memory/src/index.ts start --port 37777
curl http://127.0.0.1:37777/health
curl http://127.0.0.1:37777/api/status
```

- [ ] **Step 4: Anti-pattern grep checks**

Run:

```bash
Get-ChildItem -Path ".local-memory/src" -Recurse -File | Select-String -Pattern "Semantic search not fully implemented"
Get-ChildItem -Path ".local-memory/src" -Recurse -File | Select-String -Pattern "In real implementation"
```

Expected: no matches in newly implemented surfaces

- [ ] **Step 5: Final commit (if docs drift fix needed)**

```bash
git add .local-memory/RUNBOOK.md
git commit -m "docs: 对齐 local-memory 最终运行面"
```

---

## Verification Checklist

- [ ] `/health` 之外新增 API 路由全部有 smoke tests
- [ ] CLI 新命令全部有 spawn smoke tests
- [ ] semantic retrieval 在 provider healthy/unhealthy 两种状态都被测试
- [ ] promotion 记录真实写入 `memory_promotions`
- [ ] relations 查询与 lineage 有回归测试
- [ ] projection rebuild / verify / cleanup run 都返回结构化 JSON
- [ ] RUNBOOK 只包含真实存在且已验证的命令/端点

## Anti-pattern Guards

- 不要引入未文档化的 Bun router 库；继续使用 `Bun.serve`
- 不要把 DB 操作放进 route handler；统一通过现有 service/repository
- 不要在 provider unavailable 时返回伪 semantic 成功
- 不要把 promotion 持久化继续留在 audit-only 状态
- 不要让 projection/cleanup 只有内部方法，没有可测试的调用面

## Self-review

- 需求覆盖：API 暴露、CLI 暴露、真实 semantic retrieval、promotion/relations、projection/cleanup 全部有独立任务
- 占位扫描：计划内没有 `TODO` / `TBD` / “以后再实现” 占位
- 类型一致性：端点、命令与现有模块命名保持 `ingest/search/context/status/projection/cleanup/promote/relations`

---

Plan complete and saved to `.sisyphus/plans/2026-04-09-local-memory-next-phase.md`. Two execution options:

**1. Subagent-Driven (recommended)** - 我按 task 分发新子代理逐个执行，阶段间做审查，节奏快。

**2. Inline Execution** - 我在当前会话里按这个计划连续执行，并在阶段点停下来校验。

Which approach?
