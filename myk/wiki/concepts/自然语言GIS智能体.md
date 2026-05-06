---
title: "自然语言 GIS 智能体"
created: 2026-05-01
updated: 2026-05-01
sources: ["https://mp.weixin.qq.com/s/DpSWm2y13tfciT57ziFvdQ"]
tags: [GIS, Agent, LLM, GeoAI]
status: active
---

# 自然语言 GIS 智能体

> GeoAgent 是 LLM + GIS 的融合核心，负责将自然语言转换为可执行的地理空间操作。

## 定义

**自然语言 GIS 智能体**（GeoAgent）是一种将大语言模型的语义理解能力与 GIS 空间操作能力相结合的 AI Agent。用户通过自然语言描述任务（如"显示所有人口超过 100 万的城市"），系统自动解析指令、转换为 GIS 操作序列并返回结果。

## 核心能力

1. **自然语言解析**：理解中英文空间查询意图，支持模糊描述
2. **空间操作编排**：将任务分解为标准的 GIS 操作序列
3. **多数据源适配**：自动识别和切换不同数据源的查询接口

## 技术架构

GeoAgent 是 GeoAI Universal Platform 核心引擎层的三大核心组件之一：
- **GeoAgent**：自动语言解析与任务调度
- **LLM 注册中心**：管理多 LLM 供应商配置
- **LLM 管理器**：实现模型调用与响应缓存

## 边界

- 不是传统 GIS 软件（如 QGIS/ArcGIS）的直接替代，而是**自然语言交互层**
- 不提供底层空间算法实现，依赖于已有 GIS 引擎或 Web 服务
- 核心解决的是"**非专业人员如何高效操作 GIS**"的痛点

## 与相邻主题的关系

| 相邻主题 | 关系 |
|---------|------|
| [[空间智能]] | 空间智能是底层能力范畴，GeoAgent 是其应用层实现 |
| [[GIS+AI-交叉生态]] | GeoAgent 是 GIS+AI 交叉生态中的核心产品形态 |
| [[MCP-协议]] | 可通过 MCP 协议暴露 GeoAgent 能力给其他 LLM |

## 相关页面
- [[GeoAI-通用平台]]
- [[空间智能]]
- [[GIS+AI-交叉生态]]

## 来源
- [[https://mp.weixin.qq.com/s/DpSWm2y13tfciT57ziFvdQ|GeoAI Universal Platform 发布文章]] | 2024-04-20
