## 2026-04-10 Task 7

- `PromotionEngine.promote()` 原本只创建内存中的 `Promotion` 对象并写 audit，没有真正落库到 `memory_promotions`。
- `memory_promotions.trigger_scores` 和 `evidence_refs` 需要按现有 repository 风格序列化为 JSON 字符串存储，再在读取时反序列化。
- Promotion 流程里 audit payload 原先误写成 `forced`，实际参数名是 `force`，不修会在 promotion 成功路径直接抛 `ReferenceError`。

## 2026-04-10 Task 8

- Bun 的参数化路由可以把 `req.params` 挂到请求对象上，因此在 handler 层补一个轻量的 `getRouteParam()` 包装就能复用现有 `Request` 风格，不需要把路由参数处理散落到各 handler。
- `RelationEngine` 现有能力已经覆盖 `createRelation()`、`getLineage()`、`deactivateRelation()`，Task 8 的关键并不是重写 engine，而是把 `MemoryCoreService` 的依赖暴露和 HTTP/CLI 编排补齐。
- 为了同时满足“`GET /api/relations/:memoryId` 返回 relations”与“Task 8 要求 query lineage”，最稳的做法是统一返回 `{ relations, lineage }`，这样兼容显式需求，也不丢 lineage 能力。

## 2026-04-10 Task 10

- `ProjectionEngine` / `CleanupService` 本身已经有完整 contract，Task 10 的关键不是重写引擎，而是把 `MemoryCoreService` 继续作为唯一装配出口，补齐 `getProjectionEngine()` 和 `getCleanupService()` 暴露。
- `ops.ts` 的 projection/cleanup handler 可以直接复用 promotion handler 的模式：读取 JSON body、补默认 `actor`、调用 service getter、原样返回 engine/service 结果。
- Bun CLI 要支持 `projection rebuild` / `projection verify` / `cleanup run` 这类二级命令时，最小改法是把连续的非 `--` 参数拼成命令字符串；不需要提前引入完整命令框架。
- `.local-memory` 的全量测试如果在子目录里跑，`event-contract.test.ts` 会因为相对路径指向 `.local-memory/.local-memory/contracts/...` 失败；验证完整套件时要从工作区根目录显式传入 `./.local-memory/src/test/*.test.ts` 文件路径。
