---
title: "GeoAI Universal Platform: 多 LLM 兼容的地理空间 AI 平台"
created: 2026-05-01
updated: 2026-05-01
sources: ["https://mp.weixin.qq.com/s/DpSWm2y13tfciT57ziFvdQ"]
tags: [GIS, LLM, Agent, GeoAI, 开源]
status: active
---

# GeoAI Universal Platform

> TypeScript 实现的低门槛地理空间 AI 通用平台，实现"LLM + GIS"落地，支持多 LLM 供应商无关性和多数据源无缝集成。

## 核心定位

做一款"降低门槛、灵活适配、可扩展"的通用平台，服务于 GIS 分析师、开发人员、政企负责人、科硏师生等各类人群，解决真实场景中的落地难题。

## 核心功能

### 1. LLM 提供商无关性
原生支持通义千问、Ollama、Anthropic Claude、OpenAI GPT，还支持**自定义提供商**，无需修改代码就能无缝切换模型，适配不同团队的选型偏好和成本预算。

### 2. 多数据源无缝集成
无需手动转换格式，直接查询本地文件（GeoJSON、Shapefile、CSV、Excel）、数据库（PostGIS）和 Web 服务（WFS、PostgREST），实现多数据源统一管理。

### 3. 双模式灵活部署
- **SDK 模式**：作为 SDK 导入项目，快速集成地理 AI 能力
- **独立服务器**：作为 REST API 服务器运行，支持多终端调用，适配个人开发、中小团队、政企系统

### 4. 插件化可扩展
预置行业插件接口，后续可快速扩展水务、电网、交通等垂直领域的专属工具，无需重构核心代码。

### 5. 自然语言交互
支持中英文自然语言查询，非 GIS 专业人员也能快速上手。

## 技术架构

采用清晰的分层架构设计，包括四大核心模块：

| 层级 | 名称 | 核心组件 | 职责 |
|------|------|---------|------|
| 顶层 | 接口层 | REST API、WebSocket、CLI、Web 演示界面 | 对外提供交互入口 |
| 第二层 | 核心引擎层 | [[自然语言GIS智能体]]、LLM 注册中心、LLM 管理器 | 负责"大脑"调度 |
| 第三层 | 数据与服务层 | IData Source 接口、适配器 | 多数据源统一接入 |
| 底层 | 插件层 | 行业插件接口 | 领域特定功能扩展 |

## 关键技术实现

### 多 LLM 兼容（接口抽象 + 工厂模式）
- 定义 `LLMProvider` 接口，包含初始化、生成回答、验证配置等核心方法
- 通过 `LLMProviderFactory` 工厂类动态创建实例，实现"配置即切换"
- 配置文件存储在 `data/lim-configs/` 目录，配置变更无需重启

### 多数据源集成（统一接口 + 适配器模式）
- 通过 `IDataSource` 接口实现标准化访问
- 支持数据格式自动类型推断，避免内存溢出
- 数据库层重点支持 PostGIS，实现连接池管理、SQL 注入防护

## 相关页面
- [[GIS+AI-交叉生态]]
- [[自然语言GIS智能体]]
- [[AI-一人公司模式]]

## 来源
- [[https://mp.weixin.qq.com/s/DpSWm2y13tfciT57ziFvdQ|GeoAI Universal Platform 发布文章]] | 2024-04-20
