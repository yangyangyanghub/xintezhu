# html-ppt-gen 资产化重构计划

> **For Sisyphus:** REQUIRED SUB-SKILL: 使用 `skill-creator`。本计划执行范围仅限 `.opencode/skill/html-ppt-gen/` 及本计划文件本身。禁止改动用户业务 PPT、售前方案正文或无关目录。

## 目标

把 `html-ppt-gen` 从“提示词规则驱动”升级为“资产 / 模板 / runtime / 验证机制驱动”的技能：

- 生成 deck 时必须从模板开始，而不是从空白 HTML 开始。
- deck runtime 统一由 `assets/runtime.js` 提供，避免多页重叠、导航失效、截图不一致。
- 基础版式统一由 `assets/base.css` 提供。
- 政务 / 售前 / 客户汇报默认使用 `assets/themes/swiss-government.css`。
- full deck 模板提供可复制结构，降低每次生成的随机性。
- references 明确交付前验证项，禁止未验证就声称完成。

## 文件结构

### 新增或重写

- `.opencode/skill/html-ppt-gen/assets/base.css`
  - 负责 deck 基础 reset、960×540 stage、slide 显隐、通用排版、发丝线、网格工具类。
- `.opencode/skill/html-ppt-gen/assets/runtime.js`
  - 负责缩放、翻页、hash / query preview、页码、键盘、点击、演讲者备注切换。
- `.opencode/skill/html-ppt-gen/assets/themes/swiss-government.css`
  - 负责瑞士政务风主题 token、页面布局、封面、章节页、数据页、架构页、收尾页。
- `.opencode/skill/html-ppt-gen/templates/full-decks/swiss-government-report/deck.html`
  - 负责完整可复制 deck 骨架，引用 base/runtime/theme。
- `.opencode/skill/html-ppt-gen/templates/full-decks/swiss-government-report/outline.md`
  - 负责模板对应的内容结构示例。
- `.opencode/skill/html-ppt-gen/templates/full-decks/swiss-government-report/README.md`
  - 负责说明何时使用、如何替换内容、如何验证。

### 修改

- `.opencode/skill/html-ppt-gen/SKILL.md`
  - 把“Never author from scratch”升级为强制流程：选模板 → 复制资产 → 替换内容 → 运行验证 → 截图验收。
- `.opencode/skill/html-ppt-gen/references/html-implementation.md`
  - 将 deck mode 推荐结构指向真实 `assets/base.css` 和 `assets/runtime.js`。
- `.opencode/skill/html-ppt-gen/references/pre-delivery-checklist.md`
  - 增加资产存在、主题一致性、runtime 导航、preview 截图验证。
- `.opencode/skill/html-ppt-gen/references/authoring-guide.md`
  - 增加资产化生成流程与 Swiss Government Report 模板。
- `.opencode/skill/html-ppt-gen/references/full-decks.md`
  - 新增 `swiss-government-report` 模板条目。
- `.opencode/skill/html-ppt-gen/references/themes.md`
  - 新增 `swiss-government` 主题条目。
- `.opencode/skill/html-ppt-gen/references/color-palettes.md`
  - 删除“深浅页切换规则”的强制表述，改为“统一浅底政务报告默认规则”。

## 任务拆分

### 任务 1：落地资产文件

1. 重写 `assets/base.css`。
2. 重写 `assets/runtime.js`。
3. 新增 `assets/themes/swiss-government.css`。
4. 新增 `templates/full-decks/swiss-government-report/*`。

验证点：

- 所有文件存在。
- `deck.html` 引用 `../../../assets/base.css`、`../../../assets/themes/swiss-government.css`、`../../../assets/runtime.js`。
- runtime 无外部依赖。

### 任务 2：更新技能文档

1. 更新 `SKILL.md` 的工作流与输出契约。
2. 更新 references，使其与真实资产一致。
3. 删除或降级与用户偏好冲突的深浅交替建议。

验证点：

- 文档中出现 `swiss-government-report`。
- 文档中出现 `assets/runtime.js` 与 `assets/base.css`。
- `color-palettes.md` 不再强制“深浅页切换”。

### 任务 3：最终验证

1. 用 shell 检查关键文件存在。
2. 搜索关键引用是否齐全。
3. 若 TypeScript 工具链可用，运行 `npm run build`。
4. 报告验证结果与未完成项。

## 不做事项

- 不重写当前邯郸文旅业务 PPT。
- 不新增 npm 依赖。
- 不删除旧主题。
- 不改 CI、密钥、git 配置。
- 不提交 git commit。

## 验收标准

- `html-ppt-gen` 有真实可复用的 base/theme/runtime/template 资产。
- 技能文档明确要求从模板生成，而非自由发挥。
- 政务汇报默认视觉系统统一：浅底深字、红色锚点、发丝线、强网格、无阴影、无渐变。
- 交付前检查能覆盖过去发生过的页面重叠问题。
