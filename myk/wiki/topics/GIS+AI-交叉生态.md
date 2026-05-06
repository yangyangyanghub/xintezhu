---
title: "GIS+AI 交叉生态"
created: 2026-04-19
updated: 2026-04-19
sources: ["../技术沉淀/AI生态/AI生态收藏索引.md", "../技术沉淀/GIS与时空智能/GIS与时空智能收藏索引.md", "../调研笔记/GeoAI-Agent-Research/GeoAI-Agent论文清单.md"]
tags: [GIS, AI, 空间智能, MCP, QGIS, 遥感]
status: active
---

# GIS+AI 交叉生态

> 地理空间与 AI 的深度融合——从传统 GIS 向"空间智能体"范式跃迁。

---

## 核心趋势：从 GIS 到空间智能

| 阶段 | 范式 | 代表技术 |
|------|------|---------|
| 传统 GIS | 手动操作软件 | QGIS/ArcGIS 人工操作 |
| AI 辅助 GIS | AI 辅助特定任务 | 深度学习+遥感影像 |
| 空间智能体（GeoAgent） | AI 自主完成 GIS 工作流 | OpenEarthAgent, GeoJSON Agents |

---

## 空间智能体框架

### OpenEarthAgent
统一的工具增强型地理空间智能体框架：
- 集成多模态工具和地理空间分析能力
- Agent 自主规划任务路径

### GeoJSON Agents
面向地理空间分析的多智能体模型新架构：
- 通过 GeoJSON 实现 Agent 与地理数据的标准化交互
- 支持空间查询、分析、可视化

## 开源产品：GeoAI Universal Platform

由 GeoAI-UP 团队开发的 TypeScript 实现的低门槛地理空间 AI 通用平台：
- **多 LLM 兼容**：原生支持通义千问、Ollama、Claude、OpenAI GPT，支持自定义提供商
- **多数据源适配**：GeoJSON、Shapefile、CSV、Excel、PostGIS、WFS、PostgREST 统一接入
- **分层架构**：接口层、核心引擎层（[[自然语言GIS智能体]]）、数据与服务层、插件层
- **双模式部署**：SDK 嵌入模式 + REST API 独立服务器模式
- 仓库：`https://gitee.com/rzcgis/geo-ai-universal-platform`

## QGIS 集成

| 工具 | 说明 |
|------|------|
| **DeepSeek+GIS-MCP** | 无需网，本地大模型驱动 QGIS 智能操作 |
| **Cesium MCP** | 用 AI 驱动 Cesium（一） |
| **BlenderMCP + QGIS_MCP** | 最强 3D 辅助自动建模：Claude+Blender+MCP |
| **Smart-QGIS** | 最新制图智能体，代码已开源，论文已发表到 EI 期刊 |

---

## AI 遥感能力

### 深度学习应用
| 场景 | 技术 | 效果 |
|------|------|------|
| 语义分割 | QGIS 深度学习 | 建筑/道路/农田/飞机地物提取 |
| 目标检测 | YOLOv8 | 遥感影像建筑物提取 |
| 变化检测 | ENVI 深度学习 | 遥感变化监测 |
| 超分辨率重建 | 预训练模型 | 影像增强 |

### 基础模型
- **40 个遥感基础模型**：GPU 型号、训练规模汇总
- **AutoSAM**（TGRS 发表）：基于自动提示 Mamba 的多模态遥感语义分割
- **ERNIE-Image**（开源 SOTA）：消费级显卡搞定顶级渲染

---

## 行业应用

### 政策驱动
| 方向 | 政策依据 |
|------|---------|
| AI+教育 | 五部门部署，"十五"顶层设计 |
| AI+巡检 | "十五五"数字化转型部署 |
| 数据集建设 | 自然资源行业高质量数据集建设 |

### 深圳"十五五"规划
人工智能作为核心方向，GIS 空间智能是重要应用场景。

---

## 相关页面
- [[QGIS专题地图模板]] — QGIS 能力扩展
- [[GIS专业制图提示词]] — 制图规范
- [[多Agent-平台对比-Multica-OpenCode-OpenClaw|多 Agent 平台对比：Multica / OpenCode / OpenClaw]] — Agent 基础设施

## 来源
- [[myk/技术沉淀/AI生态/AI生态收藏索引|AI 生态微信收藏索引]]
- [[myk/调研笔记/GeoAI-Agent-Research/GeoAI-Agent论文清单|GeoAI Agent Research]]
- [[https://mp.weixin.qq.com/s/DpSWm2y13tfciT57ziFvdQ|GeoAI Universal Platform 发布文章]] | GeoAI-UP 团队官方发布
