# Draft: Frontend Design Skill

## Requirements (confirmed)
- 创作一个前端设计 skill。
- 先生成 `DESIGN.md`。
- 如果 `github.com/VoltAgent/awesome-design-md` 里有合适内容就调用，没有就建立，并可通过图片或网址参考。
- 编写过程中纳入 `frontend-design`、`ui-skills.com`、`UI UX Pro Max` 等参考/技能。
- 图标设计可参考 `better-auth/better-icons`、`ant-design/ant-design-cli`、`iconfont.cn`。
- 最后使用 Vercel web design guidelines 审查，并按审查意见修改。
- skill 主定位为“设计总控”，重点是设计决策、规范、图标与审查流程，而不是把实现代码作为主目标。
- `DESIGN.md` 采用双重角色：既是 skill 核心参考资产，也是可直接复用的独立设计说明文档。
- 需要纳入完整 skill-creator 评测回路：evals、baseline、viewer、review、迭代修改。

## Technical Decisions
- 当前处于设计/规划阶段，先做仓库与外部参考探索，再收敛需求与输出决策完整计划。
- 设计产物暂存于 `.sisyphus/drafts/`，后续在计划阶段生成正式计划文件。
- 默认按“设计优先、实现可选引用”的 skill 方向设计。
- 本地组织模式优先参考 `frontend-design`、`web-design-guidelines`、`skill-creator` 以及若干富结构设计类 skill。
- `DESIGN.md` 将被设计为可单独交付、也可被 skill 流程消费的核心中枢文档。
- 测试策略默认采用完整 skill-creator 流程，而非轻量验证。
- 采用“中枢型 skill”：对外是单 skill 入口，对内围绕 `DESIGN.md` 组织参考、图标、审查与评测流程。

## Research Findings
- workspace 下 `.opencode/skill` 未发现可复用 skill 文件；实际可参考的 skill 库在 `C:\Users\HP\.config\opencode\skill`。
- `frontend-design` 是最小型前端设计 skill 样板，`web-design-guidelines` 是审查型样板；大型设计 skill 普遍采用 `SKILL.md` + `references/`，并按 styles/layouts/workflow 等维度单文件拆分。
- `skill-creator` 提供完整校验与评测链路：`quick_validate.py`、`run_eval.py`、`aggregate_benchmark.py`、`eval-viewer/generate_review.py`、`references/schemas.md`。
- 仓库中未发现现成真实 eval 产物（如 `grading.json`、`benchmark.json`、`feedback.json`），新 skill 需要自建首批 baseline 与评审样本。
- `awesome-design-md` 明确提供可直接复制到项目根目录的 `DESIGN.md` 样本集，且每个站点通常带 `DESIGN.md`、`preview.html`、`preview-dark.html`，适合做参考基底。
- `ui-skills.com` 聚合了 `frontend-design`、`ui-ux-pro-max`、`web-design-guidelines` 等技能，适合作为触发词和能力边界的对照源。
- `better-icons` 更适合作为图标检索/同步工具链；`ant-design-cli` 更适合作为 Ant Design 组件、token、demo、迁移与语义结构知识源，而不是通用图标库本体。
- `iconfont.cn` 至少可作为中文图标资源与命名参考源，但当前抓取到的公开信息较少，后续计划里应把它定位成“补充来源”而非核心主依赖。

## Open Questions

## Scope Boundaries
- INCLUDE: 新建前端设计 skill 的设计、结构、参考源、审查流程、评测策略。
- EXCLUDE: 当前回合不直接实现业务代码或前端页面。
