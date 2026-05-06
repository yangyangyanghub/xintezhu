---
title: "Harness Engineering 技能工程"
created: 2026-04-13
updated: 2026-04-19
sources: ["../调研笔记/AntV图表可视化技能调研.md"]
tags: [Harness, 技能工程, BM25, LLM, 自我评价]
status: active
---

# Harness Engineering（技能工程）

> LLM 时代的技术文档编写范式——通过结构化约束 + 评测闭环让 AI 技能自我进化

---

## 核心概念

**Harness Engineering** 是一种将领域最佳实践、常见陷阱、API 参考全量固化到结构化文档（SKILL.md + references）中，并通过多智能体评测闭环持续提升文档质量的方法论。

**效果**：让 LLM 生成代码的成功率从 80% 提升到 **98.2%**（174 测试用例验证）。

---

## 双层文档架构

| 层级 | 文件 | 作用 | 篇幅控制 |
|------|------|------|---------|
| **索引层** | `SKILL.md` | 核心铁律 + 决策表 + 目录路由 | <1000 行 |
| **详情层** | `references/*.md` | 独立"自救包"（核心概念 + 最小示例 + 变体 + 常见错误） | 200-500 行 |

**设计原则**：约束先行 > 信息堆砌。告诉 AI"不要做什么"比"能做什么"更重要。

---

## BM25 领域检索引擎

基于标准 BM25 公式（k1=1.8, b=0.5），针对 LLM 场景做了三项定制：

| 定制项 | 说明 |
|--------|------|
| **停用词表** | 过滤领域无关高频词（如"图表、绘制、使用"） |
| **同义词词典** | 双向映射（中文↔英文技术词），打分叠加 |
| **Primary Tokens** | 核心领域词触发 Title ×4 超级加权 + 二次特征抑制 |

**分词策略**：字典匹配 + N-gram 兜底，零外部依赖。

**可复用到任何需要精确领域检索的场景**（GIS、医疗、教育等）。仅替换停用词、同义词、Primary Tokens 三套配置即可。

---

## Harness 多智能体闭环

```
EvalAgent（代码生成）→ RenderAgent（浏览器验证）→ AnalyzeAgent（错误归因）
         ↓
OptimizeAgent（重写文档）→ IndexAgent（重建索引）→ ↻ 循环直到零错误
```

**核心安全护栏**：
- **跨轮 Memory**：累计错误和优化历史，持续错误标记⚠️
- **Git Worktree 隔离**：全量回归对比确认净提升才 merge
- **内容防退化**：LLM 输出短 50% → 跳过（防删减）
- **责任判断**：非本文件责任 → 原样输出（不瞎改）

---

## 潜在应用场景

| 场景 | 同义词示例 | Primary Tokens |
|------|-----------|----------------|
| GIS 地图开发 | 地图↔map, 标注↔marker | GeoJSON, KML, 坐标转换 |
| 教育数据大屏 | 大屏↔dashboard, 同比↔yoy | 优质均衡, 师资配置 |
| 前端组件开发 | 弹窗↔modal, 表格↔table | Vue 组件, React Hooks |

---

## 相关页面
- [[BM25 领域检索引擎]] — 检索引擎定制方法论
- [[Agent-as-Teammate]] — 多智能体闭环的顶层范式

## 参考资料

- [[myk/调研笔记/AntV图表可视化技能调研|AntV 图表可视化技能调研]] — 完整调研报告
- [antvis/chart-visualization-skills](https://github.com/antvis/chart-visualization-skills) — GitHub 源仓库
