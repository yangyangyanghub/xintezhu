---
title: "GIS专业制图提示词"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/GIS-Mapping-Standards-and-QGIS/GIS-Mapping-Standards-and-QGIS调研报告.md", "../调研笔记/GIS出图规范-QGIS生态"]
tags: [GIS, 制图, 提示词, 配色标准, QGIS]
status: active
---

# GIS专业制图提示词

> 基于国际标准（OGC/ICA/USGS）和中国国标（GB/T）的 GIS 制图规范提示词模板。

---

## 国际标准体系

| 标准 | 版本 | 说明 |
|------|------|------|
| OGC SymCore | 18-067r3 (v3.0, 2024) | 核心符号化概念模型 |
| OGC Symbology Encoding | 05-077r4 | 基于 XML 的符号标记语言，GeoServer 通用 |
| ICA 制图指南 | Mapping for a Sustainable World | UN 联合出版，面向非专业人士 |
| USGS 地形图 | 1:24,000 | 全球参考最多的国家标准 |

## 中国国家标准

| 标准号 | 名称 | 核心要求 |
|--------|------|---------|
| GB/T 20257.1-2017 | 1:500/1:1000 地图图式 | 大比例尺 |
| GB/T 20257.3-2017 | 1:1万-1:10万 地图图式 | 中比例尺 |
| GB/T 24354-2023 | 公共地理信息通用地图符号 | 181页，全面规范 |
| GB 12319-2022 | 中国海图图式 | 124页，海军主管 |

**国标核心要求**：
- CMYK 四色印刷模式
- 水系蓝色调、居民地棕色调、植被绿色调、地貌棕/灰色调
- 注记字体层级清晰，最小字号≥6pt

---

## 专题地图配色标准

### 土地覆盖配色

| 类别 | NLND (美) | CORINE (欧) | 适用场景 |
|------|-----------|-------------|---------|
| 水体 | #476BA5 | — | 江河湖泊 |
| 城市 | #FF0000 | #E6004D | 建成区 |
| 森林 | #658745 | #267300 | 林地覆盖 |
| 耕地 | #BABA40 | #FFFF00 | 农业用地 |
| 草地 | #C8D769 | #F0A000 | 自然植被 |

### 高程分层设色

| 海拔 | 颜色 | HEX |
|------|------|-----|
| 海平面 | 蓝 | #4169E1 |
| 0-200m | 绿 | #32CD32 |
| 200-500m | 浅绿 | #90EE90 |
| 500-1000m | 黄 | #FFD700 |
| 1000-2000m | 橙 | #FF8C00 |
| 2000m+ | 棕 | #8B4513 |

### 色盲友好配色

- **ColorBrewer**：离散色带，内置色盲安全标记
- **viridis**：连续色带，8种变体，均匀感知亮度梯度
- **cividis**：专为全色盲优化，NASA 推荐

---

## QGIS 样式体系

| 组件 | 说明 |
|------|------|
| Style Manager | 管理点/线/面符号、色带、文字格式 |
| Symbol Selector | 可视化编辑符号层次结构 |
| QML 样式文件 | XML 格式，单图层完整样式，同名自动加载 |
| QPT 布局模板 | Print Layout 布局模板 |
| SLD | OGC 标准，跨平台通用（GeoServer/MapServer） |

### 在线样式仓库
- QGIS Hub Styles：https://hub.qgis.org/styles（社区数百种符号/色带）
- QGIS Layout Hub：https://plugins.qgis.org/layouts/（免费布局模板）

---

## 相关页面
- [[QGIS专题地图模板]]

## 来源
- [[myk/调研笔记/GIS-Mapping-Standards-and-QGIS/GIS-Mapping-Standards-and-QGIS调研报告|GIS制图规范与QGIS生态调研报告]]
