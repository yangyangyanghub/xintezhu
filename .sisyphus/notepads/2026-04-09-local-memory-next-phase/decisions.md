## 2026-04-10 Task 7

- 新增 `PromotionRepository` / `SQLitePromotionRepository`，接口只覆盖当前计划要求的 `create`、`findById`、`findByMemoryId`、`updateStatus`，保持最小实现。
- `MemoryCoreService` 补齐 `promotionRepo`、`relationEngine`、`promotionEngine` 装配，继续让它承担依赖注入入口职责，即便当前 HTTP 面还没直接消费这些实例。
- `PromotionStatus` 从 `Promotion` 内联联合类型提取为独立类型别名，避免 repository 接口和实体定义重复写状态集合。

## 2026-04-10 Task 8

- `MemoryCoreService` 新增 `getPromotionEngine()` / `getRelationEngine()`，继续让 service 作为 HTTP/CLI 的单一装配入口，避免在 handler 或 CLI 里二次拼依赖。
- promotion/relation 管理面仍放进 `http/handlers/ops.ts`，保持运维/管理接口集中，不额外拆新 handler 文件，避免把这一层切得过碎。
- CLI 只新增 `promote --memory-id <id> [--force]` 和 `relations --memory-id <id>` 两个顶层命令，不提前扩展成多级子命令，先和 Task 8 的最小交付面保持一致。

## 2026-04-10 Task 10

- `MemoryCoreService` 继续承担 projection/cleanup 的依赖注入入口职责，新增 `getProjectionEngine()` / `getCleanupService()`，保持 HTTP handler 和 CLI 都只依赖 service 暴露面。
- CLI 命令风格从纯顶层命令扩展为“顶层 + 动作”字符串匹配（如 `projection rebuild`），只覆盖当前 Task 10 所需的三个运维命令，不额外引入命令解析库。
- RUNBOOK 直接把 projection/cleanup/status 写成已验证的运维入口，并明确全量测试与 Bun 构建的正确验证命令，避免后续因 cwd 或 build target 误判实现状态。

## 2026-04-10 Task 15

- Task 15 测试直接使用真实 `SQLiteMemoryRepository + RetrievalService` 组合，而不是把 `ContextAssemblyService` 全部 mock 掉；这样预算、active 状态、keyword 降级和上下文拼装能在同一套数据上一起验证。
- 端到端断言只固定对外 contract（四类分类、`budgetsUsed`、active-only），不把内部 token 估算或 assemblyTime 这种易波动字段写死，避免测试过度耦合实现细节。
