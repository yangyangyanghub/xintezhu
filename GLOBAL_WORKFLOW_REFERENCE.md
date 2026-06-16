# Global Workflow Reference

> 说明：本文件存放从全局 `AGENTS.md` 中移出的辅助信息和参考规范。
> 它不是主行为约束文件，不定义最高优先级规则。
> 项目专属规则仍应放在项目级 `CLAUDE.md` 或项目内 `AGENTS.md`。

## 开发工具

以下内容用于记录常用工具与用途，方便查阅，不作为强制行为约束。

- EditorConfig for Visual Studio Code：统一各编辑器之间设置差异
- ESLint：代码语法检查
- Prettier：代码格式化
- stylelint：CSS 格式化
- Git Graph：Git 管理
- Vetur：Vue 2 智能提示
- volar、TypeScript Vue Plugin (Volar)：Vue 3 + TypeScript 智能提示

---

## 技能清单

技能存放在 `.opencode/skills/` 目录下。

### 已安装技能

| 技能名称                | 描述                                                                     | 触发场景                                                        |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `obsidian-markdown` | 创建和编辑 Obsidian 风格 Markdown，包括 wikilinks、embeds、callouts、properties 等语法 | 处理 `.md` 文件，用户提到 wikilinks、callouts、frontmatter、tags、embeds |
| `obsidian-cli`      | 使用 Obsidian CLI 与 Obsidian vault 交互，读取、创建、搜索笔记，管理任务和属性，支持插件开发调试        | 与 Obsidian vault 交互，从命令行管理笔记，开发和调试 Obsidian 插件/主题           |
| `obsidian-bases`    | 创建和编辑 Obsidian Bases（`.base` 文件），包含 views、filters、formulas、summaries   | 处理 `.base` 文件，创建数据库式笔记视图，用户提到 Bases、表格视图、卡片视图、过滤器、公式        |
| `json-canvas`       | 创建和编辑 JSON Canvas 文件（`.canvas`），包含 nodes、edges、groups、connections      | 处理 `.canvas` 文件，创建可视化画布、思维导图、流程图                            |
| `defuddle`          | 使用 Defuddle CLI 从网页提取干净的 Markdown 内容，移除导航和杂项以节省 token                  | 用户提供 URL 需要阅读或分析，在线文档、文章、博客帖子等标准网页                          |

### 技能使用说明

- 自动触发：遇到相关任务时自动加载对应技能
- 手动调用：使用 `skill` 工具加载指定技能

---

## Git 规范

> 说明：以下内容更适合作为团队或项目工作流参考。
> 如果具体项目已有自己的分支模型、提交规范或平台要求，应以项目规范为准。

### 分支管理

1. 主分支：`master`
   - 主分支只能从开发分支合并
   - 不在主分支上直接修改
   - 所有提交必须经过 code review

2. 开发分支：`dev`
   - 所有开发工作都在 `dev` 分支下进行
   - `dev` 分支只能从主分支或其他长期分支合并
   - 不在 `dev` 分支上直接进行修改

3. 功能分支：`feat-release-devName-功能`（试运行）
   - 从 `dev` 分支拉出
   - 命名格式为 `feature-xxx`
   - 功能开发完成后，必须合并到 `dev` 分支，并删除该分支

4. 发布分支：`release-*`
   - 发布前由 `dev` 分支拉出
   - 命名格式为 `release-xxx`
   - 仅允许进行 bug 修复、版本号更新、文档更新
   - 不允许新增功能
   - 发布完成后，必须合并到 `dev` 和 `master`

5. 热修复分支：`hotfix-*`
   - 从 `master` 分支拉出
   - 命名格式为 `hotfix-xxx`
   - 仅允许进行紧急修复
   - 不允许新增功能
   - 修复完成后，必须合并到 `dev` 和 `master`，并删除该分支

### Commit Message 规范

1. commit message 行数不超过 72 个字符
2. commit message 包括三个部分：`Header`、`Body` 和 `Footer`
3. `Header` 格式如下：

```text
<type>(<scope>): <subject>
```

#### type 类型

- `feat`：新功能
- `fix`：修补 bug
- `docs`：文档修改
- `style`：格式调整（不影响运行）
- `refactor`：重构
- `test`：增加测试
- `perf`：性能优化
- `chore`：构建过程、依赖或辅助工具变动

#### 其他要求

- `scope`：说明影响范围，可选
- `subject`：简短描述提交目的，不超过 50 个字符

### 分支合并

1. 合并完成后，删除已合并分支，保持分支清晰
2. 如果合并后出现问题，可以通过 `git revert` 撤销合并
