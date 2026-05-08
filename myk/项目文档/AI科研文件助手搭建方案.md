---
title: "AI Agent 科研文件助手搭建方案"
date: 2026-05-04
tags:
  - 方案设计
  - 知识管理
  - 科研工具
  - Obsidian
  - Zotero
status: draft
---

# AI Agent 科研文件助手搭建方案

> **目标**：结合 DeepXiv、DeepScientist、Lewen/学术鲁班、AutoResearch-RL 四篇调研成果，构建一套 Zotero + Obsidian + AI Agent 的科研文件管理与阅读系统。

---

## 一、整体架构设计

### 传统 vs AI Agent 时代

```
传统工作流（人主导）：
  PDF → Zotero 收藏 → 手动批注 → 手动写笔记 → Obsidian 整理 → 手动建双链

AI Agent 增强工作流（人机协同）：
  PDF → Zotero 自动分类+标签 → AI 提取核心观点 → 自动生成笔记框架
    → Obsidian AI Skills 扩展阅读 → Agent 辅助文献综述 → 智能引用插入
```

### 三层架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层（你的日常操作）                   │
│  Obsidian ↔ 文献笔记 ↔ 知识图谱 ↔ AI 写作辅助              │
├─────────────────────────────────────────────────────────┤
│                    能力层（AI Agent Skills）               │
│  DeepXiv 检索  |  鲁班搜索  |  阅读助手  |  geomaster    │
│  智能引用        │  自动综述  │  代码生成  │  实战复现      │
├─────────────────────────────────────────────────────────┤
│                    底座层（传统工具链）                     │
│  Zotero 文献库  │  原生 citation key │  Obsidian 插件     │
│  PDF 高亮       │  Markdown     │  文件同步          │
└─────────────────────────────────────────────────────────┘
```

---

## 二、底座层搭建（Zotero + Obsidian 基础集成）

### 2.1 Zotero 配置

| 步骤 | 操作 | 说明 |
|-----|------|------|
| 1 | 安装 Zotero 7.x | 支持新版插件系统 |
| 2 | 启用 Zotero 原生 citation key | Zotero 7 已原生支持，无需 Better BibTeX |
| 3 | 安装 ZotFile 或 Attanger | PDF 附件自动重命名与移动 |
| 4 | 安装 Zotero Connector | 浏览器一键保存论文 |

**citation key 配置建议**：
```
Citation key format: [auth:lower:etal]_[year]_[shorttitle:lower]
示例: wang_2024_llm_survey
```

> [!warning] 当前方案调整
> Zotero 已原生支持 citation key，`Better BibTeX` 在这套方案里不再是必需项。
> 你当前已经安装 `Templater`，继续保留 `Better BibTeX` 容易出现模板变量、引用字段或导出链路冲突。
> 结论：这套方案默认使用 `Zotero 原生 citation key + Templater`，不再依赖 `Better BibTeX`。

### 2.2 Obsidian 插件清单

| 插件名                             | 作用                             | 必装   |
| ------------------------------- | ------------------------------ | ---- |
| **Obsidian Zotero Integration** | 从 Obsidian 读取 Zotero 条目、笔记、高亮  | ✅    |
| **Citations**                   | 搜索 Zotero 库并插入引用               | ✅    |
| **Templater**                   | 动态笔记模板（基于 citation key 生成笔记骨架） | ✅    |
| **Dataview**                    | 查询和展示文献列表                      | ✅    |
| **Excalidraw**                  | 绘制文献概念图                        | ⬜ 可选 |
| **QuickAdd**                    | 自动化工作流脚本                       | ⬜ 可选 |

### 2.3 与你现有结构的融合

**原则**：不动现有 `myk/` 目录，只做最小增量。

| 方案中的新内容 | 融合到你现有目录 | 说明 |
|---------------|-------------------|------|
| `00-inbox/` | `myk/调研笔记/inbox/` | 新文献暂存区 |
| `01-literature-notes/` | `myk/调研笔记/文献笔记/` | 单篇论文笔记 |
| `02-concept-notes/` | `myk/技术沉淀/` | 已有，直接用 |
| `03-synthesis/` | `myk/wiki/synthesis/` | 已有，直接用 |

**融合后的完整结构**：
```
myk/
├── 调研笔记/
│   ├── inbox/              # 新增：新文献暂存（待处理）
│   └── 文献笔记/            # 新增：单篇论文笔记
├── 技术沉淀/                 ← 已有：概念笔记、知识点
├── wiki/
│   ├── topics/              ← 已有：领域词条
│   ├── concepts/            ← 已有：概念词条
│   └── synthesis/           ← 已有：多源对比
└── 提示词库/
```

### 2.4 统一笔记模板

**不另外搞一套模板，直接用你 wiki 现有的 Frontmatter 风格。** 只需把 Zotero 的引用信息作为辅助字段写进正文。

```markdown
---
title: "论文完整标题"
created: 2026-05-04
updated: 2026-05-04
sources: ["https://arxiv.org/abs/24xx.xxxx"]
tags: [LLM, Agent, 阅读进度]
status: reading  # reading | done | archived
---

# {{title}}

> **Citation Key**: `wang_2024_llm_survey`  
> **核心结论**: 一句话总结这篇论文的价值

## 核心要点
- 
- 
```

---

## 三、能力层搭建（AI Agent Skills 集成）

### 3.1 DeepXiv 集成：智能文献检索

**调研收获**：DeepXiv 提供分层阅读（brief → head → section），极大节省 token 成本。
**付费风险**：✅ 免费（1,000/10,000 请求/天）。

**集成方式**：
```bash
pip install deepxiv-sdk[all]
# 首次使用自动注册 token
deepxiv search "agentic memory" --limit 10
```

### 3.2 学术鲁班 Skills：Obsidian 内嵌学术搜索

**调研收获**：中科大 `academic-search`，支持 CNKI 和引用关系建模。
**付费风险**：✅ 免费（MIT 开源）。

### 3.3 自动化阅读助手（轻量 DeepScientist 理念）

**调研收获**：结合 PyMuPDF 提取 PDF 内容，生成结构化 Markdown 笔记。

### 3.4 geomaster 集成：空间科学实战

**调研收获**：如果前面的工具是“图书管理员”，那 `geomaster` 就是“特种兵研究员”。它内置了 **30+ 科学领域**（GIS, 遥感, 地球观测等）、**500+ 代码示例**，支持 Python/R/Julia 等 8 种语言。

**角色定位**：
- **DeepXiv** 负责帮你“找到”论文。
- **Obsidian/Zotero** 负责帮你“存好”和“读懂”。
- **geomaster** 负责帮你“跑通”和“复现”。

**闭环工作流（以遥感方向为例）**：
1. **发现 (DeepXiv)**：检索到“基于 Sentinel-2 的超分辨率重建”新论文。
2. **沉淀 (Obsidian)**：生成笔记，提取出核心算法是“使用了 XXX 损失函数”。
3. **实战 (geomaster)**：
   ```text
   提示词："基于这篇笔记中的方法，帮我写一段 PyTorch 训练代码。输入是 Sentinel-2 影像，使用 Rasterio 读取。"
   ```
   → `geomaster` 读取笔记内容，直接输出完整脚本。

---

## 四、应用层：日常工作流

### 4.1 文献收集流

```
浏览器发现论文 → Zotero Connector 一键保存 → Zotero 原生生成 citation key
    │
    ▼
Obsidian Templater 读取 citation key 生成骨架 → Zotero Integration 拉取高亮 → 存入文献笔记/
```

### 4.2 从读到做（Research to Code）

```
1. [DeepXiv] 检索最新趋势 → 存入 inbox/
2. [Obsidian] 阅读并生成结构化笔记 → 存入文献笔记/
3. [geomaster] 读取笔记： "帮我实现笔记里的算法" → 输出 Python/GIS 代码
4. [本地运行] 跑通实验 → 记录结果到笔记中
```

---

## 五、实施路线图

### Phase 1：环境定型（30-60 分钟）

动作：
- [ ] 确认 `Zotero 7` 已安装，并启用原生 `citation key`
- [ ] 确认 `Obsidian` 已安装 `Templater`、`Zotero Integration`、`Citations`、`Dataview`
- [ ] 创建目录：`myk/调研笔记/inbox/` 和 `myk/调研笔记/文献笔记/`

验证点：
- [ ] 任意打开一条 Zotero 文献，能够看到可用的 `citation key`
- [ ] Obsidian 中能正常识别上述 4 个插件

### Phase 2：工作流打通（1-2 小时）

动作：
- [ ] 卸载或禁用 `Better BibTeX`，避免和 `Templater` 冲突
- [ ] 配置 `Zotero Connector`，确保浏览器可以一键保存论文到 Zotero
- [ ] 配置 `Templater`，让模板基于 `citation key` 生成文献笔记骨架
- [ ] 约定新文献默认先进入 `myk/调研笔记/inbox/`，完成阅读后再整理到 `myk/调研笔记/文献笔记/`

验证点：
- [ ] 浏览器保存一篇论文后，Zotero 中能看到新条目和对应 `citation key`
- [ ] 通过 `Templater` 能生成一篇带标题、来源、`Citation Key`、核心结论区块的 Markdown 笔记

### Phase 3：阅读增强（1-2 小时）

动作：
- [ ] 用 `Zotero Integration` 拉取条目元信息、高亮和批注
- [ ] 用 `Citations` 在 Obsidian 中测试引用搜索与插入
- [ ] 给文献笔记补齐统一结构：元信息、核心结论、核心要点、个人理解
- [ ] 用 `Dataview` 做一个基础查询面板，按 `status`、`tags` 或研究主题查看文献

验证点：
- [ ] 单篇文献笔记中同时存在元信息、高亮摘录、摘要骨架
- [ ] 能在另一篇笔记里成功插入该论文引用
- [ ] `Dataview` 能筛出至少 1 篇测试文献

### Phase 4：AI Agent 扩展（持续迭代）

动作：
- [ ] 安装 `DeepXiv SDK`（`pip install deepxiv-sdk[all]`），用于发现新论文
- [ ] 接入学术搜索能力（`academic-search`），补充检索与引用关系探索
- [ ] 将成熟的文献笔记同步沉淀到 `wiki/topics/`、`wiki/synthesis/` 和 `技术沉淀/`
- [ ] 接入 `geomaster`，基于单篇文献笔记直接生成 GIS / 遥感实验代码

验证点：
- [ ] 至少完成 1 次“DeepXiv 检索 -> Zotero 收藏 -> Obsidian 笔记 -> AI 扩展阅读”的闭环
- [ ] 至少完成 1 次“从文献笔记生成代码并落回笔记记录实验结果”的闭环

---

## 六、工具链汇总

| 工具 | 用途 | 费用 | 链接 |
|------|------|------|------|
| Zotero 7 | 文献管理中枢 | 免费 | https://zotero.org |
| Zotero 原生 citation key | 稳定 citation key 生成 | 免费 | https://zotero.org |
| DeepXiv SDK | AI 文献检索 | 免费(API Key需注册) | GitHub: DeepXiv/deepxiv_sdk |
| academic-search | 学术搜索 Skill | 免费 | GitHub: ustc-ai4science/academic-search |
| **geomaster** | **GIS/遥感代码生成** | **免费 (Skill)** | **本地配置** |

---

**方案版本**: v2.2 (切换为 Zotero 原生 citation key，移除 Better BibTeX 依赖)  
**创建时间**: 2026-05-04  
**维护**: 辛特助
