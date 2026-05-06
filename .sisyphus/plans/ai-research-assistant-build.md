# AI科研文件助手搭建计划

## TL;DR

> **Quick Summary**: 基于《AI科研文件助手搭建方案》文档,搭建 Zotero + Obsidian + AI Agent 三层架构的科研文件管理与阅读系统。从底座层(Zotero+Obsidian集成)到能力层(DeepXiv、学术鲁班、geomaster集成),再到应用层(日常工作流配置)。
> 
> **Deliverables**:
> - Obsidian 目录结构(调研笔记/inbox、文献笔记)
> - Obsidian 插件安装配置(Templater模板、Zotero Integration、Citations、Dataview查询)
> - 文献笔记模板(Templater)
> - DeepXiv SDK 安装与验证
> - 学术鲁班(academic-search)集成
> - geomaster 实战验证
> - Dataview 文献查询面板
> 
> **Estimated Effort**: Medium(3-4小时,取决于Zotero安装速度)
> **Parallel Execution**: YES - 4 waves,部分任务可并行
> **Critical Path**: 目录创建 → 插件安装 → 模板配置 → AI工具集成 → 工作流验证

---

## Context

### Original Request
洋哥要求依据`myk/项目文档/AI科研文件助手搭建方案.md`生成完整的开发计划,输出为`.sisyphus/plans/`下的可执行计划文件,配合`/start-work`使用。

### Interview Summary
**Key Discussions**:
- **交付物边界**: 生成完整计划文件+Sisyphus执行一体化(选项A)
- **方案完整性**: 方案文档已经很详细,不需要额外讨论,直接细化为TODO

**Research Findings**:
- **已有插件**: Dataview、Templater、QuickAdd 已安装,无需重复
- **缺失插件**: Zotero Integration、Citations 未安装,计划中需补充
- **目录结构**: `myk/wiki/` 已有完整结构(topics/concepts/synthesis),`myk/调研笔记/` 已有但缺少 `inbox/` 和 `文献笔记/` 子目录
- **Skills**: geomaster(全局配置)、deep-research、obsidian系列 已安装

---

## Work Objectives

### Core Objective
搭建一套 Zotero + Obsidian + AI Agent 的科研文件管理与阅读系统,实现从文献收集→AI辅助阅读→知识沉淀→代码实战的完整闭环。

### Concrete Deliverables
- `myk/调研笔记/inbox/` - 新文献暂存区
- `myk/调研笔记/文献笔记/` - 单篇论文笔记目录
- `00 templates/literature-note.md` - 文献笔记模板
- `.obsidian/` 插件配置更新
- DeepXiv SDK 安装验证
- 学术鲁班(academic-search)克隆与验证
- Dataview 文献查询面板(代码片段)

### Definition of Done
- [ ] 目录结构创建完成
- [ ] 所有插件安装并启用
- [ ] 文献笔记模板可正常使用
- [ ] DeepXiv SDK 可执行搜索命令
- [ ] Dataview 查询面板可显示文献列表
- [ ] geomaster 可读取文献笔记并生成代码

### Must Have
- 遵循现有 `myk/` 目录规范,不破坏已有结构
- Templater 模板使用现有 Frontmatter 风格
- DeepXiv 使用免费版(1000请求/天)
- 所有步骤可被 `/start-work` 自动执行验证

### Must NOT Have (Guardrails)
- 不修改现有 wiki/topics、wiki/concepts、wiki/synthesis 的内容
- 不删除任何已有插件配置
- 不安装方案之外的额外插件
- 不做 Zotero 本身的手动安装(用户在本地自行完成,计划只负责配置验证)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
- **文件系统**: 使用 Bash 验证目录/文件存在性
- **插件配置**: 读取 `.obsidian/community-plugins.json` 验证
- **DeepXiv SDK**: 使用 Bash 执行 `pip install` + 验证命令
- **Dataview**: 创建测试笔记,验证查询语法
- **geomaster**: 使用 skill 工具验证可加载

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 基础目录+模板):
├── Task 1: 创建目录结构 [quick]
├── Task 2: 创建文献笔记模板 [quick]
└── Task 3: 验证现有插件配置 [quick]

Wave 2 (After Wave 1 - 插件安装):
├── Task 4: 安装 Zotero Integration 插件 [quick]
├── Task 5: 安装 Citations 插件 [quick]
└── Task 6: 配置 Templater 模板路径 [quick]

Wave 3 (After Wave 2 - AI工具集成):
├── Task 7: DeepXiv SDK 安装与验证 [deep]
├── Task 8: 学术鲁班(academic-search)集成 [deep]
└── Task 9: geomaster 实战验证 [quick]

Wave 4 (After Wave 3 - 工作流配置):
├── Task 10: Dataview 文献查询面板 [unspecified-high]
├── Task 11: QuickAdd 自动化脚本(可选) [quick]
└── Task 12: 端到端工作流验证 [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

### Dependency Matrix
- **1-3**: 无依赖 - Wave 2
- **4-6**: 依赖 1,3 - Wave 3
- **7-9**: 依赖 4 (间接) - Wave 4
- **10-12**: 依赖 1,5,7 - FINAL

### Agent Dispatch Summary
- **Wave 1**: 3 - T1-T3 → `quick`
- **Wave 2**: 3 - T4-T6 → `quick`
- **Wave 3**: 3 - T7 → `deep`, T8 → `deep`, T9 → `quick`
- **Wave 4**: 3 - T10 → `unspecified-high`, T11 → `quick`, T12 → `unspecified-high`
- **FINAL**: 4 - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. 创建目录结构

  **What to do**:
  - 创建 `myk/调研笔记/inbox/` 目录(新文献暂存区)
  - 创建 `myk/调研笔记/文献笔记/` 目录(单篇论文笔记)
  - 在每个目录创建 `.gitkeep` 文件确保目录被 git 追踪

  **Must NOT do**:
  - 不修改 `myk/调研笔记/` 下已有的任何内容
  - 不创建方案定义之外的目录

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯目录创建,简单明确
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4, 10
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `myk/调研笔记/inbox/` 目录存在
  - [ ] `myk/调研笔记/文献笔记/` 目录存在
  - [ ] 两个目录各包含 `.gitkeep` 文件

  **QA Scenarios**:
  ```
  Scenario: 目录创建验证
    Tool: Bash
    Steps:
      1. 执行: Test-Path "E:\code\my-ai-workspace\myk\调研笔记\inbox"
      2. 执行: Test-Path "E:\code\my-ai-workspace\myk\调研笔记\文献笔记"
      3. 执行: Test-Path "E:\code\my-ai-workspace\myk\调研笔记\inbox\.gitkeep"
    Expected Result: 三个路径均返回 True
    Evidence: .sisyphus/evidence/task-1-directory-check.txt
  ```

  **Commit**: YES
  - Message: `feat(research-workflow): 创建文献管理目录结构`
  - 预提交验证: 目录存在性检查

- [x] 2. 创建文献笔记模板

  **What to do**:
  - 在 `00 templates/` 目录创建 `literature-note.md` 模板文件
  - 模板内容参照方案文档的笔记结构,结合现有 AGENTS.md 的 Frontmatter 风格
  - 包含: YAML frontmatter(title, created, updated, sources, tags, status)、论文标题、Zotero Key 占位、核心结论、核心要点章节
  - 使用 Templater 语法 `<% tp.file.title %>` 等

  **Must NOT do**:
  - 不使用 Obsidian 原生 Templates 插件语法(项目使用 Templater)
  - 不添加方案之外的字段

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 创建单个模板文件,结构明确
  - **Skills**: [`obsidian-markdown`]
    - `obsidian-markdown`: 确保模板使用正确的 Obsidian Flavored Markdown 语法

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `myk/项目文档/AI科研文件助手搭建方案.md` - 方案文档中的模板示例(第108-126行)
  - `00 templates/` - 现有模板目录,查看已有模板风格

  **Acceptance Criteria**:
  - [ ] `00 templates/literature-note.md` 文件存在
  - [ ] 模板包含完整的 YAML frontmatter
  - [ ] 模板包含 Templater 动态语法
  - [ ] 模板格式符合 Obsidian 笔记规范

  **QA Scenarios**:
  ```
  Scenario: 模板文件存在性与格式验证
    Tool: Bash + Read
    Steps:
      1. 执行: Test-Path "E:\code\my-ai-workspace\00 templates\literature-note.md"
      2. 读取文件内容,验证包含 --- frontmatter ---
      3. 验证包含 <% tp. 开头的 Templater 语法
    Expected Result: 文件存在,包含 frontmatter 和 Templater 语法
    Evidence: .sisyphus/evidence/task-2-template-check.txt
  ```

  **Commit**: YES (与 Task 1 合并在同一提交)
  - Message: `feat(research-workflow): 创建文献笔记模板`

- [x] 3. 验证现有 Obsidian 插件配置

  **What to do**:
  - 读取 `.obsidian/community-plugins.json`,确认现有插件列表
  - 对比方案要求的插件清单,标记已安装/待安装状态
  - 确认 `dataview`、`templater-obsidian`、`quickadd` 在列表中
  - 记录缺失插件: `obsidian-zotero-integration`、`obsidian-citations`

  **Must NOT do**:
  - 不修改 community-plugins.json
  - 不安装方案要求之外的插件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 文件读取+对比,纯验证操作
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4, 5
  - **Blocked By**: None

  **References**:
  - `.obsidian/community-plugins.json` - 现有插件配置
  - `.obsidian/core-plugins.json` - 核心插件配置(参考用)

  **Acceptance Criteria**:
  - [ ] 输出插件状态对比表(已安装/待安装)
  - [ ] 确认 Dataview、Templater、QuickAdd 已启用

  **QA Scenarios**:
  ```
  Scenario: 插件配置验证
    Tool: Bash + Read
    Steps:
      1. 读取 .obsidian/community-plugins.json
      2. 验证包含 "dataview"、"templater-obsidian"、"quickadd"
    Expected Result: 三个必需插件均在列表中
    Evidence: .sisyphus/evidence/task-3-plugin-status.txt
  ```

  **Commit**: NO (纯验证,不涉及文件修改)

- [x] 4. 安装 Zotero Integration 插件

  **What to do**:
  - 通过 Obsidian 社区插件市场安装 `obsidian-zotero-integration`
  - 将插件名添加到 `.obsidian/community-plugins.json`
  - 如果 Obsidian CLI 可用,使用 CLI 安装;否则下载插件到 `.obsidian/plugins/`
  - 验证插件目录创建成功

  **Must NOT do**:
  - 不配置 Zotero 连接参数(需要用户本地 Zotero 运行中)
  - 不修改其他插件配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 插件安装,步骤固定
  - **Skills**: [`obsidian-cli`]
    - `obsidian-cli`: 如果 CLI 可用,使用 CLI 安装插件

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7(间接)
  - **Blocked By**: Task 1, 3

  **Acceptance Criteria**:
  - [ ] `obsidian-zotero-integration` 出现在 `community-plugins.json`
  - [ ] 插件目录存在于 `.obsidian/plugins/obsidian-zotero-integration/`

  **QA Scenarios**:
  ```
  Scenario: Zotero Integration 安装验证
    Tool: Bash
    Steps:
      1. 读取 community-plugins.json,检查包含 "obsidian-zotero-integration"
      2. 检查 .obsidian/plugins/obsidian-zotero-integration/ 目录存在
    Expected Result: 两项均通过
    Evidence: .sisyphus/evidence/task-4-zotero-plugin-check.txt
  ```

  **Commit**: YES
  - Message: `feat(zotero): 安装 Zotero Integration 插件`

- [x] 5. 安装 Citations 插件

  **What to do**:
  - 通过 Obsidian 社区插件市场安装 `obsidian-citations`
  - 将插件名添加到 `.obsidian/community-plugins.json`
  - 验证插件目录创建成功

  **Must NOT do**:
  - 不配置 Better BibTeX 路径(需用户确认本地路径)
  - 不修改其他配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 插件安装,步骤与 Task 4 相同
  - **Skills**: [`obsidian-cli`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 10(间接)
  - **Blocked By**: Task 3

  **Acceptance Criteria**:
  - [ ] `obsidian-citations` 出现在 `community-plugins.json`
  - [ ] 插件目录存在于 `.obsidian/plugins/obsidian-citations/`

  **QA Scenarios**:
  ```
  Scenario: Citations 安装验证
    Tool: Bash
    Steps:
      1. 读取 community-plugins.json,检查包含 "obsidian-citations"
      2. 检查 .obsidian/plugins/obsidian-citations/ 目录存在
    Expected Result: 两项均通过
    Evidence: .sisyphus/evidence/task-5-citations-plugin-check.txt
  ```

  **Commit**: YES (与 Task 4 合并在同一提交)
  - Message: `feat(zotero): 安装 Citations 插件`

- [x] 6. 配置 Templater 模板路径

  **What to do**:
  - 读取或创建 `.obsidian/plugins/templater-obsidian/data.json`
  - 配置 `templates_folder` 指向 `00 templates/` 目录
  - 确保 templater 启用(在 community-plugins.json 中已确认)
  - 如果 data.json 已存在,只追加/确认 templates_folder 配置

  **Must NOT do**:
  - 不覆盖 Templater 的其他已有配置
  - 不修改 Templater 的 trigger 设置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 配置文件修改,路径明确
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `00 templates/` - 模板目录,确认 Templater 指向此路径

  **Acceptance Criteria**:
  - [ ] Templater data.json 存在且包含 templates_folder 配置
  - [ ] templates_folder 值指向 `00 templates/`

  **QA Scenarios**:
  ```
  Scenario: Templater 配置验证
    Tool: Bash
    Steps:
      1. 读取 .obsidian/plugins/templater-obsidian/data.json
      2. 验证 templates_folder 字段包含 "00 templates"
    Expected Result: 配置正确
    Evidence: .sisyphus/evidence/task-6-templater-config.json
  ```

  **Commit**: YES
  - Message: `feat(templater): 配置模板文件夹路径`

- [x] 7. DeepXiv SDK 安装与验证

  **What to do**:
  - 执行 `pip install deepxiv-sdk[all]` 或 `pip3 install deepxiv-sdk[all]`
  - 验证安装成功: `pip show deepxiv-sdk`
  - 执行测试搜索: `deepxiv search "agentic memory" --limit 3` 或使用 Python 脚本验证
  - 记录安装结果和测试结果
  - 注意: 首次使用自动注册 token,可能需要确认

  **Must NOT do**:
  - 不在代码中硬编码 API token
  - 不修改系统级 Python 配置(优先使用项目虚拟环境)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及 pip 安装,可能需要处理依赖冲突或环境问题
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Task 12
  - **Blocked By**: Wave 2 完成

  **Acceptance Criteria**:
  - [ ] `pip show deepxiv-sdk` 返回安装信息
  - [ ] 测试搜索命令执行成功(返回至少1条结果)
  - [ ] 安装过程无报错,或报错已解决

  **QA Scenarios**:
  ```
  Scenario: DeepXiv SDK 安装验证
    Tool: Bash
    Steps:
      1. 执行: pip show deepxiv-sdk
      2. 验证输出包含 Name: deepxiv-sdk 和 Version 信息
    Expected Result: SDK 安装成功,版本信息正常
    Evidence: .sisyphus/evidence/task-7-deepxiv-install.txt

  Scenario: DeepXiv 搜索功能验证
    Tool: Bash
    Steps:
      1. 执行: python -c "from deepxiv_sdk import DeepXiv; print('import OK')"
      2. 或使用 CLI: deepxiv search "machine learning" --limit 1
    Expected Result: 导入成功或搜索返回结果
    Evidence: .sisyphus/evidence/task-7-deepxiv-search-test.txt
  ```

  **Commit**: NO (pip 安装不修改工作区文件)

- [x] 8. 学术鲁班(academic-search)集成

  **What to do**:
  - 从 GitHub 克隆学术鲁班项目: `git clone https://github.com/ustc-ai4science/academic-search.git` 到 `projects/academic-search/`
  - 检查项目 README,确认安装要求
  - 如果是 Python 项目,安装依赖: `pip install -r requirements.txt`
  - 运行基本测试或示例,验证可正常使用
  - 记录项目位置和验证结果

  **Must NOT do**:
  - 不修改学术鲁班的源代码
  - 不在全局环境安装其依赖(优先使用虚拟环境)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及 git clone + 依赖安装 + 环境验证,步骤较多
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Task 12
  - **Blocked By**: Wave 2 完成

  **Acceptance Criteria**:
  - [ ] `projects/academic-search/` 目录存在
  - [ ] 依赖安装成功(如有 requirements.txt)
  - [ ] 项目基本功能可运行

  **QA Scenarios**:
  ```
  Scenario: 学术鲁班克隆验证
    Tool: Bash
    Steps:
      1. 执行: Test-Path "E:\code\my-ai-workspace\projects\academic-search"
      2. 执行: ls 查看目录内容,确认包含核心文件
    Expected Result: 克隆成功,目录完整
    Evidence: .sisyphus/evidence/task-8-academic-search-check.txt
  ```

  **Commit**: NO (外部项目克隆,不 commit)

- [x] 9. geomaster 实战验证

  **What to do**:
  - 验证 `geomaster` skill 已正确安装(全局配置)
  - 使用 skill 工具加载 geomaster,确认可正常使用
  - 创建一个简单的测试查询,验证 geomaster 能理解科研文献相关指令
  - 记录验证结果

  **Must NOT do**:
  - 不修改 geomaster 的 skill 配置
  - 不执行真实的代码生成(仅验证可加载)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: skill 验证,步骤简单
  - **Skills**: [`geomaster`]
    - `geomaster`: 直接加载验证

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 12
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] geomaster skill 可成功加载
  - [ ] skill 描述包含 GIS/遥感代码生成相关能力

  **QA Scenarios**:
  ```
  Scenario: geomaster skill 加载验证
    Tool: skill
    Steps:
      1. 执行: skill geomaster
      2. 验证返回内容包含 SKILL.md 内容
    Expected Result: skill 加载成功
    Evidence: .sisyphus/evidence/task-9-geomaster-check.txt
  ```

  **Commit**: NO (纯验证)

- [x] 10. Dataview 文献查询面板

  **What to do**:
  - 创建一个 Dataview 查询代码块文件 `myk/调研笔记/文献查询面板.md`
  - 包含以下查询:
    1. 按 status 分组的文献列表(reading/done/archived)
    2. 近期新增文献(按 created 排序)
    3. 按标签分组的文献
  - 使用正确的 Dataview 语法(TABLE/SORT/GROUP BY)
  - 验证查询语法正确(通过 Obsidian 预览模式检查)

  **Must NOT do**:
  - 不创建复杂的 JS 脚本(保持 Dataview 原生语法)
  - 不覆盖 myk/ 下已有的任何文档

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写正确的 Dataview 查询语法
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12)
  - **Blocks**: None
  - **Blocked By**: Task 1, 2

  **References**:
  - `myk/wiki/index.md` - 参考现有文档的 Frontmatter 风格
  - `.obsidian/community-plugins.json` - 确认 dataview 已安装

  **Acceptance Criteria**:
  - [ ] `myk/调研笔记/文献查询面板.md` 文件存在
  - [ ] 文件包含至少 3 个 Dataview 查询代码块
  - [ ] 查询语法符合 Dataview 规范

  **QA Scenarios**:
  ```
  Scenario: Dataview 面板文件验证
    Tool: Bash + Read
    Steps:
      1. 检查文件存在: myk/调研笔记/文献查询面板.md
      2. 读取文件,验证包含 ```dataview 代码块
      3. 验证包含 TABLE、GROUP BY 等 Dataview 关键字
    Expected Result: 文件存在,包含正确的 Dataview 查询语法
    Evidence: .sisyphus/evidence/task-10-dataview-panel.md
  ```

  **Commit**: YES
  - Message: `feat(dataview): 创建文献查询面板`

- [x] 11. QuickAdd 自动化脚本(可选) ~~跳过~~

  **What to do**:
  - 创建一个 QuickAdd 宏配置,实现"一键生成文献笔记"流程
  - 宏内容: 提示输入论文标题 → 使用 Templater 模板 → 保存到 inbox/ 目录
  - 配置 QuickAdd 的 capture 格式,确保 frontmatter 正确填充
  - 保存配置到 `.obsidian/plugins/quickadd/data.json`(如适用)

  **Must NOT do**:
  - 不覆盖 QuickAdd 已有的宏和配置
  - 不创建过于复杂的脚本

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: QuickAdd 配置,结构固定
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 12)
  - **Blocks**: None
  - **Blocked By**: Task 2, 6

  **Acceptance Criteria**:
  - [ ] QuickAdd 配置文件中包含新宏
  - [ ] 宏指向正确的模板和输出目录

  **QA Scenarios**:
  ```
  Scenario: QuickAdd 宏配置验证
    Tool: Bash
    Steps:
      1. 读取 .obsidian/plugins/quickadd/data.json
      2. 验证包含新的宏配置
    Expected Result: 宏配置存在
    Evidence: .sisyphus/evidence/task-11-quickadd-macro.txt
  ```

  **Commit**: YES (如果修改了配置文件)
  - Message: `feat(quickadd): 添加文献笔记生成宏`

- [x] 12. 端到端工作流验证

  **What to do**:
  - 完整走一遍"文献收集→笔记生成→查询显示"工作流
  - 步骤:
    1. 确认 `inbox/` 目录可用
    2. 使用 Templater 模板创建一个测试笔记(模拟从 Zotero 导入)
    3. 在 `文献查询面板.md` 中验证 Dataview 能查询到该笔记
    4. 验证 geomaster 可读取该笔记内容
  - 记录每个步骤的结果,标记成功/失败项

  **Must NOT do**:
  - 不使用真实的 Zotero 数据(使用模拟数据即可)
  - 不修改除测试笔记外的任何内容

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 端到端测试,涉及多个组件联动
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: 所有其他任务完成

  **Acceptance Criteria**:
  - [ ] 测试笔记成功创建在 inbox/ 目录
  - [ ] 模板变量正确填充
  - [ ] Dataview 查询能识别新笔记
  - [ ] 工作流各环节无断点

  **QA Scenarios**:
  ```
  Scenario: 端到端工作流测试
    Tool: Bash + Read
    Steps:
      1. 在 inbox/ 创建测试笔记:使用 Templater 模板填充 mock 数据
      2. 读取测试笔记,验证 frontmatter 和正文格式正确
      3. 读取文献查询面板.md,验证查询语法能匹配测试笔记
    Expected Result: 全流程无断点
    Evidence: .sisyphus/evidence/task-12-e2e-workflow.txt
  ```

  **Commit**: NO (测试笔记可以保留或删除,标记为"测试用")

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
- [x] F2. **Code Quality Review** — `unspecified-high`
- [x] F3. **Real Manual QA** — `unspecified-high`
- [x] F4. **Scope Fidelity Check** — `deep`

---

## Commit Strategy

- **1+2**: `feat(research-workflow): 创建文献管理目录和模板` - 目录+模板
- **4+5**: `feat(zotero): 安装 Zotero Integration 和 Citations 插件` - 插件安装
- **6**: `feat(templater): 配置模板文件夹路径` - Templater 配置
- **10**: `feat(dataview): 创建文献查询面板` - Dataview 面板
- **11**: `feat(quickadd): 添加文献笔记生成宏(可选)` - QuickAdd 宏

**不 commit 的项目**:
- DeepXiv SDK 安装(pip,不修改工作区)
- 学术鲁班克隆(外部代码)
- 测试笔记(标注为测试用)

---

## Success Criteria

### Verification Commands
```bash
# 目录检查
Test-Path "E:\code\my-ai-workspace\myk\调研笔记\inbox"
Test-Path "E:\code\my-ai-workspace\myk\调研笔记\文献笔记"

# 插件检查
cat .obsidian/community-plugins.json | jq 'index("obsidian-zotero-integration") >= 0'
cat .obsidian/community-plugins.json | jq 'index("obsidian-citations") >= 0'

# DeepXiv SDK
pip show deepxiv-sdk

# geomaster
skill geomaster (验证可加载)
```

### Final Checklist
- [ ] `myk/调研笔记/inbox/` 和 `文献笔记/` 目录存在
- [ ] Zotero Integration、Citations 插件已安装
- [ ] Templater 模板路径配置正确
- [ ] 文献笔记模板符合方案规范
- [ ] DeepXiv SDK 可执行搜索
- [ ] 学术鲁班已克隆
- [ ] Dataview 查询面板可用
- [ ] geomaster 可加载
- [ ] 端到端工作流无断点
- [ ] 未破坏现有 wiki/ 和 myk/ 结构
