# LLM Wiki 操作日志

> 记录所有 wiki 操作。每条以 `## [YYYY-MM-DD] action | 标题` 开头

---

## [2026-04-13] init | LLM Wiki 骨架创建

- 创建目录结构：`myk/wiki/topics/`、`concepts/`、`synthesis/`
- 创建 `schema.md`：wiki 维护规范 v1.0
- 创建 `index.md`：初始扫描 80+ 原始文档，按 8 大领域分类
- 创建 `log.md`：本文件
- 下一步：增量填充，下次新增调研时开始 ingest 流程

## [2026-04-13] ingest | Hyper-Extract 与 Free-FS 调研报告

- 使用横纵分析法调研两个技术项目
- Hyper-Extract：清华博士后开发的 LLM 知识提取工具，8 种图谱格式+80+领域模板
- Free-FS：Dromara 社区 Java 文件存储系统，插件化SPI架构+8种存储后端
- 4 个并行 librarian agent 完成纵向/横向调研
- 更新 `index.md`：新增 "开发工具链与部署" 分类 2 个条目

## [2026-04-13] ingest | GeoAI 开源项目调研报告（最新版）

- 2 个并行 librarian agent 全面调研 opengeos/geoai 项目
- 涵盖 GitHub 元数据、README、官方文档、代码级架构、API 设计
- 核心发现：v0.37.1，NASA 资助，PEP 562 懒加载架构，80+ Notebook，QGIS 插件，MCP Server
- 更新 `index.md`："数据与 GIS" 分类新增条目

---

*日志创建：2026-04-13*
