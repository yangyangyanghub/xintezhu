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
│  Zotero 文献库  │  Better BibTeX │  Obsidian 插件     │
│  PDF 高亮       │  Markdown     │  文件同步          │
└─────────────────────────────────────────────────────────┘
```

---

## 二、底座层搭建（Zotero + Obsidian 基础集成）

### 2.1 Zotero 配置

| 步骤 | 操作 | 说明 |
|-----|------|------|
| 1 | 安装 Zotero 7.x | 支持新版插件系统 |
| 2 | 安装 Better BibTeX | 生成稳定 citation key，支持 Markdown |
| 3 | 安装 ZotFile 或 Attanger | PDF 附件自动重命名与移动 |
| 4 | 安装 Zotero Connector | 浏览器一键保存论文 |

**Better BibTeX 设置建议**：
```
Citation key format: [auth:lower:etal]_[year]_[shorttitle:lower]
示例: wang_2024_llm_survey
```

### 2.2 Obsidian 插件清单

| 插件名 | 作用 | 必装 |
|--------|------|------|
| **Obsidian Zotero Integration** | 从 Obsidian 读取 Zotero 条目、笔记、高亮 | ✅ |
| **Citations** | 搜索 Zotero 库并插入引用 | ✅ |
| **Templater** | 动态笔记模板（配合 Zotero API） | ✅ |
| **Dataview** | 查询和展示文献列表 | ✅ |
| **Excalidraw** | 绘制文献概念图 | ⬜ 可选 |
| **QuickAdd** | 自动化工作流脚本 | ⬜ 可选 |

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

> **Zotero Key**: @wang2024_paper  
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
浏览器发现论文 → Zotero Connector 一键保存 → Better BibTeX 生成 Key
    │
    ▼
Obsidian Templater 生成骨架 → Zotero Integration 拉取高亮 → 存入文献笔记/
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

### Phase 1：基础搭建（1-2 小时）
- [ ] 安装 Zotero 7 + Better BibTeX
- [ ] 安装 Obsidian 插件：Zotero Integration、Citations、Templater、Dataview
- [ ] 创建目录结构：`myk/调研笔记/inbox/` 和 `myk/调研笔记/文献笔记/`

### Phase 2：工作流打通（2-3 小时）
- [ ] 配置 Zotero Connector 浏览器插件
- [ ] 测试一键保存论文 → 自动生成笔记
- [ ] 配置 Templater 自动化笔记生成

### Phase 3：AI Agent 增强（2-4 小时）
- [ ] 安装 DeepXiv SDK (`pip install deepxiv-sdk[all]`)
- [ ] 学术鲁班 Skill 集成 (`academic-search`)

### Phase 4：实战与沉淀（持续）
- [ ] **geomaster 实战集成**：基于笔记生成 GIS/遥感代码
- [ ] 沉淀调研笔记到 wiki/topics/ 和 technical-precipitations/
- [ ] 用 Dataview 配置查询面板

---

## 六、工具链汇总

| 工具 | 用途 | 费用 | 链接 |
|------|------|------|------|
| Zotero 7 | 文献管理中枢 | 免费 | https://zotero.org |
| Better BibTeX | 稳定 citation key 生成 | 免费 | https://retorque.re/zotero-better-bibtex |
| DeepXiv SDK | AI 文献检索 | 免费(API Key需注册) | GitHub: DeepXiv/deepxiv_sdk |
| academic-search | 学术搜索 Skill | 免费 | GitHub: ustc-ai4science/academic-search |
| **geomaster** | **GIS/遥感代码生成** | **免费 (Skill)** | **本地配置** |

---

**方案版本**: v2.1 (加入 geomaster 实战环节，精简架构)  
**创建时间**: 2026-05-04  
**维护**: 辛特助
