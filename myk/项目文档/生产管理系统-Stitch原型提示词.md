# 生产管理系统 - Google Stitch 原型生成提示词

> 基于《生产项目管理系统建设方案》整理的 Stitch AI 原型生成 Prompt 套餐
> 
> 使用说明：分批输入到 [Google Stitch](https://stitch.withgoogle.com/)，**先整体定调 → 再逐个模块精调 → 最后串联交互流程**
>
> **操作建议**：
> - 选择 **Web 模式**，输入框底部切换为 `Web`
> - 模型选 `3 Flash`（快速迭代）或 `Thinking with 3.1 Pro`（高质量）
> - 利用底部调色板选 **Enterprise/B2B 主题**
> - 每次只改一个变量，先粗后细
> - 满意后使用 `Copy to Figma` 继续精调

---

## 一、第一步：系统基调 + 生成核心框架

```
Design a modern B2B enterprise project management system dashboard for a Chinese surveying & mapping institute. 

Core layout:
- Left sidebar navigation with icons and Chinese labels
- Top header bar with user avatar, notifications, and system name
- Main content area showing a personalized workbench

Style direction:
- Clean, professional, enterprise-grade UI
- Chinese modern tech aesthetic — subtle blue primary color (#1890FF), white background, rounded cards
- Dense but organized information layout suitable for data-heavy screens
- Material Design 3 or Ant Design inspired component style

Key screens to generate:
1. Login page with institution branding
2. Main workbench dashboard with 待办/在办/已办 tabs, reminder center, and quick stats cards
3. Left sidebar menu structure: 工作台、合同管理(合同会审/收入合同/合作合同)、项目管理(项目清单/项目实施/项目成果)、费用管理(开票/收款/支付)、资质管理

Generate 3 design variants exploring different sidebar density and workbench layout.
```

---

## 二、第二步：逐个模块细化

### ① 工作台（Workbench）

```
On the workbench screen, refine the main content area with 3 card sections:

1. 待办事项 (Pending Tasks): List-style items with red urgency tags for overdue items. Examples: "合同会审表待审批"、"质量审核待核对"、"开票申请待提交"
2. 在办事项 (In-Progress): Table view with project name, progress bar, status badge (进行中/已暂停/已完成)
3. 提醒中心 (Reminders): Alert-style cards with countdown chips — 项目进度预警(黄色)、合同到期(橙色)、注册证到期前90天(红色)、资质到期预警

Add a quick stats row at the top: 本月新签合同数、当前活跃项目数、待收款金额。
```

### ② 项目清单（Project List）

```
Design a project list page with:

- Filter bar at top: 项目名称(input)、委托单位(input)、项目状态(select dropdown)、所属部门(select)、项目类型(select)、搜索按钮
- Data table with columns: 项目名称、委托单位、项目状态、部门、类型、负责人、开工日期、进度条、操作按钮
- Pagination at bottom
- Status badges with color coding: 未签合同(gray)、已签合同(blue)、进行中(green)、已完成(teal)、暂停(orange)、终止(red)
- Export and Import buttons above the table
```

### ③ 合同会审（Contract Review）

```
Design a contract review form page with:

- Form title: 合同会审表
- Form fields: 合同名称、关联项目、合同类型(收入/合作)、合同金额(¥)、对方单位、合同状态、合同附件上传区域(drag & drop)
- Approval flow timeline visualization showing: 部门负责人 → 主管院长 → 生产处 → 法人代表, each step with status indicator (待审批/已通过/已驳回)
- Validation reminder: "本次合作金额累计不得超过主合同金额的30%"
- Submit / Save Draft / Cancel buttons at bottom
- Right sidebar: related documents & revision history
```

### ④ 项目实施 / 任务分配（Task Assignment）

```
Design a project task assignment page with:

- Project header: project name, assigned leader avatar, overall status badge
- Task breakdown table: 工作内容 | 负责人 | 参与人 | 核对人 | 审核人 | 计划开始 | 计划结束 | 完成进度(progress bar)
- Add task button with inline form
- Quality review section: 质量审核状态 indicator with "发起审核" button
- Key project marker: "重点项目" badge with 调度会 or 质量会审 indicator

Style: Ant Design table with expandable rows for task details.
```

### ⑤ 资质管理（Qualification Management）

```
Design a qualification management dashboard with:

- Unit qualifications section (单位资质): cards showing 城乡规划编制资质、测绘资质、市政行业设计资质, each with validity countdown and action buttons(升级/增项/延续)
- Personnel certifications section: 注册证列表 with 注册规划师、注册测绘师 cards, showing expiry date, 借用状态, and 续注提醒
- Alert panel at top: 到期预警(红色=30天内, 橙色=60天内, 黄色=90天内) with count badges
- Quick actions: 资质信息登记、注册证借用申请、资格有效期设置
```

---

## 三、第三步：串联交互原型

在 Stitch 中生成好关键页面后：

1. 点击 **Play 按钮** 进入原型模式
2. Stitch 会自动识别可点击元素
3. 点击"合同会审表"等按钮，Stitch 会 **自动生成对应下一页面**
4. 逐步跑通完整流程：`登录 → 工作台 → 点击项目 → 进入详情 → 发起质量审核`

---

## 附录：Stitch 使用最佳实践

| 策略 | 说明 |
|------|------|
| **先粗后细** | 先生成大致框架，再通过对话式迭代逐个调整，不要一开始就塞全部细节 |
| **一次改一个变量** | 每次只调布局或只改样式，避免 Stitch 混淆意图 |
| **上传参考图** | 如果有现成的原型截图、Axure/Figma 导出图，直接上传做 **Image-to-UI**，效果远好于纯文字 |
| **用 "vibe design"** | 描述目标和感受（"让管理者一眼看到紧急事项"），比罗列组件效果更好 |
| **利用 Design System 预设** | 底部调色板图标选 Enterprise/B2B 主题，省去调色时间 |
| **导出到 Figma** | 满意后一键 `Copy to Figma`，继续精调 Auto Layout |
| **处理中文显示** | Stitch 生成的中文字体可能不够美观，建议导出到 Figma 后统一替换为「思源黑体」或「PingFang SC」 |

---

## 关联建设方案

- 完整建设方案详见：[[生产项目管理系统建设方案]]
- 本提示词基于建设方案中描述的 3 层架构（统一门户 → 核心业务 → 数据权限）拆分生成
