## 2026-04-10 Task 7

- `PromotionEngine.promote()` 原本只创建内存中的 `Promotion` 对象并写 audit，没有真正落库到 `memory_promotions`。
- `memory_promotions.trigger_scores` 和 `evidence_refs` 需要按现有 repository 风格序列化为 JSON 字符串存储，再在读取时反序列化。
- Promotion 流程里 audit payload 原先误写成 `forced`，实际参数名是 `force`，不修会在 promotion 成功路径直接抛 `ReferenceError`。
