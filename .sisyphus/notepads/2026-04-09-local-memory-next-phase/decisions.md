## 2026-04-10 Task 7

- 新增 `PromotionRepository` / `SQLitePromotionRepository`，接口只覆盖当前计划要求的 `create`、`findById`、`findByMemoryId`、`updateStatus`，保持最小实现。
- `MemoryCoreService` 补齐 `promotionRepo`、`relationEngine`、`promotionEngine` 装配，继续让它承担依赖注入入口职责，即便当前 HTTP 面还没直接消费这些实例。
- `PromotionStatus` 从 `Promotion` 内联联合类型提取为独立类型别名，避免 repository 接口和实体定义重复写状态集合。
