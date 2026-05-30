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

## [2026-04-16] ingest | cc-connect 使用手册配置模板补充

- 更新 cc-connect 使用手册，新增 3 种常用配置模板：多项目、单项目多平台、同平台多实例
- 补充 `allow_from`/`admin_from` 权限说明和 `/whoami` 获取用户 ID 指南
- 更新 `index.md`：cc-connect 条目摘要从"定时任务工具"改为"cc-connect 配置/多平台/多项目模板 + 定时任务"

## [2026-04-18] ingest | 微信收藏夹批量整理（723 条 URL → 622 篇笔记）

- 从 `D:\Desktop\wechat\微信收藏连接.xlsx` 导出 723 条收藏链接
- 提取标题 + 按主题分类 → 去重合并 77 条重复 → 646 篇独立文章
- 分 6 批次整理到 `myk/技术沉淀/`：
  - 第 1 批 AI 生态：209 篇
  - 第 2 批 GIS 与时空智能：132 篇
  - 第 3 批 技术工具：37 篇
  - 第 4 批 职场与商业：40 篇
  - 第 5 批 政策与科普：29 篇
  - 第 6 批 教育与待确认：175 篇
- 总计成功 **622 篇** Obsidian 笔记，失败 22 篇（正文无法提取）
- 每批含完整索引文件（含双链引用 + 失败列表）
- 原始 Excel 和 URL 清单保留在 `D:\Desktop\wechat\`
- 更新 `index.md`：新增 "微信收藏" 分类 6 个批次条目

## [2026-04-19] lint | Wiki 首次健康检查

- 🔴 **索引不一致**：index.md 引用 6 个 topics，实际 topics/ 目录只有 1 个文件，5 个页面从未创建（教育资源评估体系/教育系统数据资源/GIS专业制图提示词/QGIS专题地图模板/皮皮狗主题信息图）
- 🟡 **覆盖率低**：Raw Sources 索引 80+ 文档，仅 2.5% 已提炼为 wiki 页面
- 🟡 **Synthesis 为空**：无跨领域对比/综合页面
- 🟡 **缺失概念页**：MCP 协议、Agent-as-Teammate、SPI 架构、LLM Gateway 等关键概念缺少独立页面
- ✅ **无矛盾**：现有 2 个页面逻辑一致，引用关系正确
- ✅ **无孤立页面**：现有页面均有入链
- 下一步：修复索引不一致 → 优先补充 5 个缺失 topic 页面 → 建立首批 synthesis 对比页

## [2026-04-19] update | 规范一致性修复 + 核心概念页建立

- ✅ 给 `Harness-Engineering-技能工程.md` 补全 frontmatter（sources/tags/status）
- ✅ 修正 `schema.md`：补充双链格式规范、标签体系、页面命名规范
- ✅ 修正 `GIS专业制图提示词.md`：删除指向不存在的 `皮皮狗主题信息图` 悬挂引用
- ✅ 修正 `LLM-Gateway-选型-New-API-vs-LiteLLM.md`：修正 `related_concepts` 语法
- ✅ 创建 `concepts/MCP-协议.md`：Anthropic 模型上下文协议，类比 USB-C
- ✅ 创建 `concepts/Agent-as-Teammate.md`：多 Agent 协作范式
- ✅ 创建 `concepts/差异系数.md`：CV=σ/X_bar，教育均衡评估核心工具
- ✅ 创建 `synthesis/多Agent-平台对比-Multica-OpenCode-OpenClaw.md`：三大 Agent 管理平台对比
- ✅ 创建 `synthesis/打包方案决策-Windows-macOS-Linux.md`：跨平台打包全景 + 推荐组合策略
- ✅ 补充 4 个幽灵页面：教育资源评估体系、教育系统数据资源、GIS专业制图提示词、QGIS专题地图模板
- ⚠️ 移除 1 个无法修复的页面：皮皮狗主题信息图（源目录为空，无可用素材）
- ✅ 建立首批 Synthesis 页：`LLM-Gateway-选型-New-API-vs-LiteLLM.md`
- ✅ 确认 GeoAI 两份报告非重复：`GeoAI-开源项目调研/` 是单体项目深度调研，`2026-04-13-GeoAI开源项目调研报告.md` 是领域全景工具清单
- ✅ 更新 `index.md`：Topics 5/5 就位，Synthesis 1 页，移除幽灵条目
- 覆盖率：从 2 页 → 7 页（topics 5 + concepts 1 + synthesis 1），80+ 源文档覆盖率 ~8.75%

## [2026-04-19] ingest | AI 微信收藏第一批 Ingest（209 篇）

- 提取并整合 `myk/技术沉淀/AI生态/` 中 209 篇微信收藏笔记
- 创建 `topics/AI-Skill-生态.md`：Harness 开发方法论、最佳实践清单、423 个神级 Skills
- 创建 `topics/AI-编码助手生态.md`：三大主流产品对比、工程化工作流、Token 节省策略
- 创建 `topics/AI-一人公司模式.md`：16 人公司案例、Ruflo 蜂群协作、Skill 组合清单
- 创建 `topics/GIS+AI-交叉生态.md`：空间智能体框架 + 40 个遥感基础模型
- 创建 `synthesis/AI-记忆系统全景对比.md`：记忆架构设计 + 检索更新策略
- 更新 `index.md`：新增 4 个 Topics + 1 个 Synthesis

## [2026-04-19] ingest | GIS 微信收藏第二批 Ingest（134 篇）

- 使用探索性 agent 按标题关键词对 134 篇 GIS 收藏笔记做 8 大主题归类
- 创建 4 个 Topics 页面：
  - **国土空间规划与治理**（11 篇）：多规合一、用途管制、土地发展权、俞孔坚理论
  - **遥感+AI 智能体**（49 篇）：RemoteSAM/PanoEarth/Falcon 基础模型，OpenEarthAgent 智能体框架
  - **测绘与新型基础测绘**（12 篇）：新型基础测绘→实景三维→时空大数据三位一体
  - **GIS 数据资源与工具链**（47 篇）：数据源导航、QGIS/ArcGIS 出图技巧、WebGIS 趋势
- 更新 `index.md`：新增 4 个 Topics 条目
- 覆盖率：从 21% → ~33%（21 页 / 80+ 源文档）

## [2026-04-19] ingest | 微信收藏剩余批次 Ingest 完成（281 篇）

### 技术工具（37 篇）
- ✅ 创建 `topics/AI-研发工具链.md`：代码理解（GitNexus/Graphify）、知识图谱（Hyper-Extract/史记）、工作流（Kestra）、文件存储（Free FS）
- ✅ 创建 `topics/AI-内容创作工具.md`：PPT 生成（62 大厂设计师 Skills）、视频生成（35K Star 开源）、UI 设计（12 家公司风格）、数字孪生

### 教育与待确认（175 篇）
- ✅ 创建 `topics/耕地保护与土地执法体系.md`：粮食安全保障法、非农化/非粮化精准治理、卫片执法演变（集中发放→主动巡查）、常见执法难题
- ✅ 创建 `topics/Vibe-Coding-与低代码开发.md`：非技术人员 vibe code 赚钱、城市数字化（长沙/厦门）、数据共享平台

### 职场与商业（40 篇）+ 政策与科普（29 篇）
- ✅ 创建 `topics/土地政策与审批流程.md`：立项→竣工全流程、地类认定、农村土地政策、河北地方政策

### 最终统计
- 总 wiki 页面：**26 页**（topics 18 + concepts 4 + synthesis 4）
- 覆盖率：从 ~33% → **~55%**
- 622 篇微信收藏全部完成 ingest，零遗漏

## [2026-04-19] ingest | One-Person-Company-Skills 调研报告

- 调研 slavingia/skills 项目：Gumroad 创始人将创业方法论拆分为 10 个可执行 AI 技能模块
- 仓库 8,019 stars / 817 forks，创建不足一个月，属认知型/策略型 skill
- 创建/更新内容：
  - **更新** `topics/AI-一人公司模式.md`：补充 slavingia/skills 方法论维度 + 关键行业数据
  - **新增** `concepts/认知型技能.md`：定义技能生态上层形态，解决"哪些活值得干"
  - **新增** `concepts/方法论产品化.md`：从书本到可执行模块的知识转型
  - **新增** `synthesis/技能类型对比-认知型-执行型-工作流型.md`：三大形态对比及互补关系
- 总 wiki 页面：**28 页**（topics 18 + concepts 6 + synthesis 5）
- 原始文档来源：`myk/调研笔记/One-Person-Company-Skills/One-Person-Company-Skills调研报告.md`

## [2026-04-19] fix | index.md 双链路径修正

- **问题**：Obsidian 双链 `[[路径]]` 相对于 vault 根目录（`E:\code\my-ai-workspace`）计算，而非相对于当前文件
- **修正**：
  - `[[topics/xxx]]` → `[[myk/wiki/topics/xxx]]`
  - `[[concepts/xxx]]` → `[[myk/wiki/concepts/xxx]]`
  - `[[synthesis/xxx]]` → `[[myk/wiki/synthesis/xxx]]`
  - `[[../调研笔记/xxx]]` → `[[myk/调研笔记/xxx]]`
  - `[[../技术沉淀/xxx]]` → `[[myk/技术沉淀/xxx]]`
- **表格格式修复**：`技術框架与平台`、`数据与 GIS`、`政策与规划`、`微信收藏` 四个表格中 `[[path|display]]` 的 `|` 与 Markdown 表格列分隔符冲突，重构为三列/两列标准格式

## [2026-04-19] fix | index.md 双链路径最终修正

- **根因**：Obsidian 双链 `[[路径]]` 相对于 vault 根目录计算，而非相对于当前文件
- **修正**：
  - `[[../调研笔记/xxx]]` → `[[myk/调研笔记/xxx]]`（全部 Raw Sources 已修正）
  - `[[path|display]]` → `[[path]]`（移除 `|display` 避免 Markdown 表格断裂）
- **Topics/Concepts/Synthesis 状态**：git 骨架版本显示 `*待填充*`，实际页面已存在于 topics/、concepts/、synthesis/ 目录中
- **下次 ingest**：同时更新索引表，使用 vault 根目录相对路径

## [2026-04-19] update | 重建 index.md 顶部索引表

- 依据 `topics/`、`concepts/`、`synthesis/` 现有页面重新回填 `index.md`
- Topics 共 19 页，Concepts 共 6 页，Synthesis 共 5 页
- 恢复 `Raw Sources` 中的 `One-Person-Company-Skills` 条目和 `微信收藏` 分区
- 统一所有双链为 vault 根目录相对路径，并保持 Markdown 表格合法

## [2026-04-19] ingest | GIS 领域跨主题综合对比页

- 新建 `synthesis/GIS-领域跨主题综合对比.md`
- 基于 7 个现有 GIS topic 页面做跨主题综合对比：
  - `国土空间规划与治理`
  - `测绘与新型基础测绘`
  - `遥感+AI-智能体`
  - `GIS数据资源与工具链`
  - `GIS+AI-交叉生态`
  - `GIS专业制图提示词`
  - `QGIS专题地图模板`
- 页面重点不是重复 topic 内容，而是建立价值链视角：治理规则 → 空间底座 → 智能感知 → 数据处理 → AI 集成 → 制图规范 → QGIS 交付
- 更新 `index.md`：新增 1 条 Synthesis 索引，并将“下一步优先”改为 GIS 概念页补充

## [2026-04-19] ingest | GIS 核心概念页补充

- 新建 3 个概念页：
  - `concepts/空间智能.md`
  - `concepts/实景三维.md`
  - `concepts/用途管制.md`
- 写作边界统一为：**定义 / 边界 / 与相邻主题的关系 / 常见误读**
- 明确避免与以下 topic 页重复：
  - `GIS+AI-交叉生态`
  - `测绘与新型基础测绘`
  - `国土空间规划与治理`
- 更新 `synthesis/GIS-领域跨主题综合对比.md`：新增“三个跨主题概念”对比块，并在正文中接入概念页双链
- 更新 `index.md`：Concepts 区新增 3 条索引，“下一步优先”切换为 GIS 场景页补充


## [2026-04-20] ingest | Supabase 知识库增强方案调研

- 深度调研 Supabase 作为知识库增强方案的可行性
- 核心发现：
  - Supabase 云端版国内延迟高（150-400ms），项目暂停机制（7天不活跃）不友好
  - PostgreSQL + pgvector 语义搜索能力强，但 Markdown 生态兼容性差
  - 迁移成本高，放弃 Obsidian 生态代价大
- 推荐方案：Markdown + SQLite 增强层（渐进式）
  - 第一阶段：MarkdownDB 索引零迁移成本
  - 第二阶段：Ollama 本地 embedding 实现语义搜索
  - 第三阶段：AI 自动化 pipeline（标签/分类/摘要）
- 报告输出：myk/调研笔记/Supabase-知识库增强方案/（Markdown + Word 双版本）
- 更新 index.md：新增 Raw Sources 条目

## [2026-05-01] ingest | GeoAI Universal Platform 公众号技术文章

- 来源：GeoAI-UP 微信公众号《GeoAI Universal Platform: 多 LLM 兼容的地理空间 AI 平台》
- 提取核心要点：
  - 分层架构设计：接口层、核心引擎层、数据与服务层、插件层
  - 关键技术：接口抽象+工厂模式实现多 LLM 兼容，适配器模式实现多数据源集成
  - 开源项目：基于 TypeScript，仓库地址 gitee.com/rzcgis/geo-ai-universal-platform
- 新建页面：
  - **topics/GeoAI-通用平台.md**：多 LLM 兼容的地理空间 AI 平台全景
  - **concepts/自然语言GIS智能体.md**：GeoAgent 定义，自然语言→GIS 操作序列的 AI Agent
- 更新 index.md：新增 1 个 Topics + 1 个 Concept + 1 个 Raw Source
- wiki 页面总数：**30 页**（topics 20 + concepts 10 + synthesis 6）

## [2026-05-04] ingest | GeoAgent 空间分析智能体论文

- 来源：微信公众号 + IJGIS 论文（SCI 一区 Top，IF=5.1）
- 核心创新：分层多智能体架构（规划层+执行层+审查层），实现自主空间分析
- 关键数据：
  - 整体成功率 95.24%（DeepSeek-V3 配置）
  - 移除规划层 → 降至 59.18%
  - 移除审查层 → 降至 69.39%
- 新建页面：
  - **topics/GeoAgent-空间分析智能体.md**：分层多智能体架构、三大工具集、消融实验结果
  - **concepts/分层多智能体架构.md**：层级职责分离、闭环反馈机制、与扁平多智能体对比
- 更新 index.md：新增 1 个 Topics + 1 个 Concept
- wiki 页面总数：**32 页**（topics 21 + concepts 11 + synthesis 6）

---

## [2026-05-06] ingest | 上下文压缩

- 来源：洋哥闪念（/AHA 触发）
- 深度调研上下文压缩技术与记忆系统结合方案
- 新建 **concepts/上下文压缩.md**：
  - OpenClaw compaction 机制缺陷分析（本质是截断不是压缩）
  - 主流技术路线：SimpleMem、Latent Context Compilation、Focus、ACON、CompLLM、MemArt
  - 分级记忆压缩架构（L0→L1→L2→Profile）
  - 三级渐进式检索方案（search→timeline→get_observations）
  - 9 篇核心论文引用
- 更新 index.md：新增 1 个 Concepts 条目
- wiki 页面总数：**33 页**

---

*日志创建：2026-04-13*

n# #   2 0 2 6 - 0 4 - 2 9   i n g e s t   |   W i n d o w s   �~�z�]wQ�x�bJT
 
 
## [2026-05-07] ingest | opencode-pty技术调研

- 深度调研opencode-pty技术实现，基于bun-pty的PTY管理库
- 研究内容：
  1. bun-pty技术细节和架构设计
  2. PTY实现挑战和已知问题
  3. node-pty与bun-pty对比分析
  4. WebSocket终端流式传输架构
  5. xterm.js集成模式
- 生成文档：
  - **调研报告**：`myk/调研笔记/opencode-pty/opencode-pty调研报告.md` (11KB)
  - **Word版本**：`myk/调研笔记/opencode-pty/opencode-pty调研报告.docx` (14KB)
  - **技术架构图**：`images/architecture.png` (2.0MB)
  - **对比分析图**：`images/comparison.png` (1.7MB)
- 新增Wiki页面：
  - **topics/PTY终端技术.md**：PTY终端技术完整技术栈
  - **concepts/PTY-伪终端.md**：PTY伪终端核心概念
- 更新index.md，添加2个新页面条目
- wiki页面总数：**35页** (topics 23 + concepts 12 + synthesis 6)

---

*日志更新时间：2026-05-07*
