## 2026-04-10 Task 7

- 新增 `PromotionRepository` / `SQLitePromotionRepository`，接口只覆盖当前计划要求的 `create`、`findById`、`findByMemoryId`、`updateStatus`，保持最小实现。
- `MemoryCoreService` 补齐 `promotionRepo`、`relationEngine`、`promotionEngine` 装配，继续让它承担依赖注入入口职责，即便当前 HTTP 面还没直接消费这些实例。
- `PromotionStatus` 从 `Promotion` 内联联合类型提取为独立类型别名，避免 repository 接口和实体定义重复写状态集合。

## 2026-04-10 Task 8

- `MemoryCoreService` 新增 `getPromotionEngine()` / `getRelationEngine()`，继续让 service 作为 HTTP/CLI 的单一装配入口，避免在 handler 或 CLI 里二次拼依赖。
- promotion/relation 管理面仍放进 `http/handlers/ops.ts`，保持运维/管理接口集中，不额外拆新 handler 文件，避免把这一层切得过碎。
- CLI 只新增 `promote --memory-id <id> [--force]` 和 `relations --memory-id <id>` 两个顶层命令，不提前扩展成多级子命令，先和 Task 8 的最小交付面保持一致。
