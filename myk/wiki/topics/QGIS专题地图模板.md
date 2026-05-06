---
title: "QGIS专题地图模板"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/GIS-Mapping-Standards-and-QGIS/GIS-Mapping-Standards-and-QGIS调研报告.md"]
tags: [QGIS, 模板, 出图, Atlas, 空间分析]
status: active
---

# QGIS专题地图模板

> QGIS 专题地图模板库，涵盖 Print Layout、Atlas 批量出图、1300+ Processing 算法和 2900+ 插件生态。

---

## Print Layout 核心能力

| 功能 | 说明 |
|------|------|
| 地图项 | 2D/3D 地图画布 |
| 图例/比例尺/指北针 | 自动/手动配置 |
| HTML 框架 | 嵌入 HTML 内容 |
| 高程剖面图 | 新增布局项 |
| 导出格式 | PNG/BMP/TIF/JPG/SVG/PDF（含地理参考）/PostScript |

## Atlas 批量出图

**工作原理**：基于 Coverage Layer 的每个要素自动迭代生成整套地图。
- 主地图按要素缩放 + 概述图固定范围
- 支持 PDF/PNG/SVG 导出
- PyQGIS API 程序化控制
- 典型场景：行政区划批量出图、站点监测报告批量生成

---

## Processing 框架（1300+ 算法）

| 提供者 | 算法数 | 特点 |
|--------|--------|------|
| QGIS Native (C++) | 316 | 核心空间分析、矢量几何、栅格分析 |
| GDAL | 57 | 栅格处理、投影转换、插值、镶嵌 |
| GRASS GIS | 307 | 高级水文拓扑、视域分析、流域分析 |
| SAGA Next Gen | 589 | 空间统计、地形分析、GWR、监督分类 |
| QGIS 3D | 1 | 3D 镶嵌 |
| PDAL (点云) | 新增 | LiDAR 点云处理 |

### 核心分析能力

| 类别 | 典型工具 |
|------|---------|
| 矢量叠置 | Buffer、Clip、Intersection、Union、Difference、Dissolve |
| 网络分析 | 最短路径（Dijkstra）、服务区（等时圈/等距圈） |
| 空间统计 | 字段统计、多边形内点数统计、距离矩阵、最近邻、DBSCAN、K-Means |
| 栅格计算 | Raster Calculator、Zonal Statistics、重分类 |
| 地形分析 | Slope/Aspect、Hillshade、Roughness、Color Relief |
| 水文分析 | 集水区、河网提取、洼地填平、TWI、SPI |
| 3D/点云 | 3D Map View、点云 Clip/Merge/Filter/Export |

---

## 必装插件（第一梯队）

| 插件 | 下载量 | 说明 |
|------|--------|------|
| QuickMapServices | 1057万+ | 一键加载 Google/Bing/OSM/Esri 等 650+ 底图 |
| SCP 半自动分类 | 248万+ | 遥感图像处理全流程 |
| QuickOSM | 275万+ | Overpass API 直接下载 OSM 数据 |
| qgis2web | 140万+ | 导出为 Leaflet/OpenLayers 交互式 Web 地图 |

## 高频推荐（第二梯队）

| 插件 | 下载量 | 说明 |
|------|--------|------|
| Google Earth Engine | 55万+ | GEE 集成 |
| Qgis2threejs | 50万+ | three.js 3D 可视化 |
| HCMGIS | 198万+ | 全能工具箱 |
| Profile Tool | — | 地形剖面图 |
| Mapflow | — | AI 遥感目标提取 |

---

## 相关页面
- [[GIS专业制图提示词]] — 制图配色与规范
- [[教育资源评估体系]] — 教育数据空间可视化场景

## 来源
- [[myk/调研笔记/GIS-Mapping-Standards-and-QGIS/GIS-Mapping-Standards-and-QGIS调研报告|GIS制图规范与QGIS生态调研报告]]
