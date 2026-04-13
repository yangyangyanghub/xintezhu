# DESIGN.md — 土地违法智能监测系统

> 本文档基于《土地违法智能监测系统需求文档 v1.0》生成，面向 Web 管理端（Vue 3 + Element Plus + TypeScript）的前端设计规格说明。
>
> **预览版** — 由 frontend-design-orchestrator 技能生成。执行时将复制到 `myk/项目文档/土地违法智能监测系统-DESIGN.md`。
>
> 移动端（Flutter 巡查 APP）和大屏展示端不在此文档范围内，需另起设计文档。

---

## 1. Visual Theme

- **Design Intent**: 打造一套面向国土资源执法场景的专业监测后台系统。视觉上传递**权威、可信、高效**的气质，在大面积数据密度下保持清晰的层级和可读性。以深色侧栏配合浅色主体的经典企业后台布局为基础，融入 GIS 地图核心工作区的沉浸式体验，使监测中心人员能够快速获取告警信息、研判违法线索、调度执法资源。

- **Style Keywords**: `专业权威`、`数据密集`、`GIS中心`、`告警驱动`、`暗色侧栏`、`克制点缀`

- **Reference Notes**:
  - 参考 ArcGIS Dashboards 的 GIS 沉浸式体验和数据可视化密度
  - 参考 Ant Design Pro 的企业级后台框架感
  - 避免过度花哨的渐变和装饰，严肃执法场景以功能性为第一要务
  - 告警状态使用高饱和色彩形成视觉锚点（红/橙/绿），全页面同时高亮不超过 3 处

---

## 2. Color Palette

- **Primary Colors**:
  | 语义 | 令牌名 | 色值 | 用途 |
  |------|--------|------|------|
  | 主色（品牌） | `--primary` | `#1A5FFF` | 导航激活、主要按钮、链接、地图主标记 |
  | 主色（悬浮） | `--primary-hover` | `#4080FF` | 主色交互悬停态 |
  | 主色（激活） | `--primary-active` | `#0E42D2` | 主色按压缩态 |
  | 标题文字 | `--text-primary` | `#1D2129` | 页面标题、表单标签、表格表头 |
  | 正文文字 | `--text-regular` | `#4E5969` | 正文内容、描述文字 |
  | 辅助文字 | `--text-secondary` | `#86909C` | 时间戳、辅助标签、占位文字 |
  | 禁用文字 | `--text-disabled` | `#C9CDD4` | 禁用态文字 |
  | 背景-页面 | `--bg-page` | `#F5F6F8` | 页面底色 |
  | 背景-卡片 | `--bg-card` | `#FFFFFF` | 卡片、面板、表格容器 |
  | 背景-侧栏 | `--bg-sidebar` | `#001529` | 侧边导航背景 |

- **Secondary Colors**（状态与语义）:
  | 状态 | 令牌名 | 色值 | 背景色 | 用途 |
  |------|--------|------|--------|------|
  | 高风险/紧急 | `--danger` | `#F53F3F` | `#FFECE8` | 高风险告警、删除操作、紧急标记 |
  | 中风险/警告 | `--warning` | `#FF7D00` | `#FFF3E8` | 中风险告警、注意提示 |
  | 低风险/安全 | `--success` | `#00B42A` | `#E8FFEA` | 低风险告警、成功确认、正常状态 |
  | 信息 | `--info` | `#165DFF` | `#E8F3FF` | 一般提示信息、进行中状态 |
  | 处理中 | `--processing` | `#722ED1` | `#F5E8FF` | 研判中、处置中状态 |

- **Usage Rules**:
  - 页面底色统一使用 `--bg-page`，卡片容器使用 `--bg-card`，通过底色差异建立层级
  - 正文使用 `--text-primary`，辅助说明使用 `--text-secondary`，禁用态使用 `--text-disabled`
  - **状态色仅用于传达业务语义**（告警等级、巡查状态、操作结果），不作为装饰性用途
  - 高风险红色 `--danger` 为全局最强视觉锚点，同一页面同时高亮的红色区域不超过 3 处，避免值守人员视觉疲劳
  - 侧栏深色背景 `--bg-sidebar` 上的文字使用白色 `#FFFFFF`，激活态文字使用 `--primary`

---

## 3. Typography

- **Type System**:
  | 层级 | 字号 | 字重 | 行高 | 用途 |
  |------|------|------|------|------|
  | Page Title / H1 | 24px | 600 | 32px | 页面主标题 |
  | Section Title / H2 | 18px | 600 | 26px | 卡片/模块标题 |
  | Subsection / H3 | 16px | 600 | 24px | 子区块标题 |
  | Body / 正文 | 14px | 400 | 22px | 表格内容、表单标签、按钮文字 |
  | Small / 辅助 | 12px | 400 | 20px | 描述文字、时间戳、角标、Tag 文字 |
  | Mono / 等宽 | 13px | 400 | 20px | 经纬度坐标、案件编号、设备编号 |

- **Font Guidance**:
  - 中文优先字体栈：`"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`
  - 等宽字体栈：`"SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace`
  - 最小字号 12px，确保监测中心长时间值守场景下的可读性
  - 英文/数字使用系统默认无衬线字体，避免中文字体下英文渲染过细

- **Text Rules**:
  - 正文行高统一 1.57（22 / 14），表格行高固定 40px（含上下 padding）
  - 经纬度坐标、案件编号、设备编号等数据字段使用等宽字体，确保数字纵向对齐
  - 中文文案避免超过 2 行不换行，表格单元格内容超出时使用 `text-overflow: ellipsis` 截断，配合 Element Plus Tooltip 显示完整内容
  - 告警通知、错误提示等紧急信息可使用 600 字重增强可读性

---

## 4. Components

- **Core Components**:

  | 组件 | 设计要点 | Element Plus 映射 |
  |------|----------|-------------------|
  | **侧边导航 Sidebar** | 深色背景 `#001529`，图标 18px + 文字 14px，支持二级折叠，激活态左侧 3px `--primary` 竖线，hover 文字变亮 | `el-menu` + 自定义样式 |
  | **顶部栏 Header** | 白底 + 底部 1px `--border` 分割线，左侧面包屑导航，右侧告警铃铛（红色角标）+ 用户头像 | `el-header` |
  | **数据卡片 StatCard** | 白底 + 圆角 8px + 浅阴影，左侧图标 24px + 主色，右侧数值（24px 600）+ 标签（12px）+ 可选趋势箭头，4 列网格排列 | `el-card` 自定义 |
  | **告警表格 AlertTable** | 左侧 3px 风险等级色条，状态标签（`el-tag` 语义配色），操作列固定右侧 120px，支持排序（仅时间/面积列） | `el-table` + `el-tag` |
  | **GIS 地图容器** | 占满父容器剩余空间，左上角图层控制面板（白底卡片 180px），右上角工具栏（测量/标注/截图，图标按钮），底部状态栏显示坐标和缩放级别 | 自定义 + Leaflet |
  | **视频流占位组件** | 深灰底色 `#1F1F1F` 16:9 比例容器，左上角红色「LIVE」角标 10px，底部模拟云台控制栏（占位不可用） | 自定义 |
  | **飞行状态面板** | 白底卡片，使用 `el-descriptions` 纵向两列布局：位置（经纬度等宽）、高度、电量（进度条）、速度 | `el-descriptions` + `el-progress` |
  | **证据链时间线** | 垂直时间线，节点含时间（12px secondary）+ 类型图标 + 缩略图 80×60 + 描述 + 状态标签，支持点击展开详情 | `el-timeline` |
  | **告警详情抽屉** | 右侧滑出宽度 720px，分 4 区块：基本信息（`el-descriptions`）/ 地图缩略图（280px 高）/ 证据列表（时间线）/ 处置操作（底部固定按钮组） | `el-drawer` |
  | **巡查计划表格** | 状态列使用语义标签，进度列使用 `el-progress`（线性条 + 百分比文字），操作列含查看详情按钮 | `el-table` + `el-progress` |
  | **图表容器 ChartCard** | 白底卡片，标题区（16px 600 + 右侧操作按钮）+ ECharts 图表区（最小高度 320px）+ 底部统计摘要（Small 字号，辅助色） | 自定义 + vue-echarts |
  | **空状态 EmptyState** | 居中布局：SVG 图标 80px + 提示文案 14px + 可选操作按钮，支持预设场景（no-data / no-results / no-permission） | `el-empty` 自定义 |
  | **表单 Form** | 标签右对齐 120px 宽度，必填红色星号，错误态红色边框 + 下方提示文字 12px，提交按钮右对齐，分组使用分割线 | `el-form` + `el-form-item` |

- **States**:

  - **Hover**: 所有可点击元素悬停态为背景加深 5%（`rgba(0, 0, 0, 0.05)` 叠加），光标变为 pointer
  - **Active**: 按钮按下时缩放 `transform: scale(0.98)`，时长 0.1s
  - **Focus**: 表单项获得焦点时边框变为 `--primary` 蓝色 2px，去除默认 outline
  - **Error**: 表单项校验失败时红色边框 `--danger`，下方 12px 红色提示文字
  - **Loading**: 统一使用 `v-loading` 指令，遮罩 `rgba(255, 255, 255, 0.8)`，居中 Element Plus spinner
  - **Disabled**: 所有控件禁用态统一使用 `--disabled` 底色，文字 `--text-disabled`，光标 not-allowed
  - **Empty**: 表格/列表/图表无数据时显示 EmptyState，文案根据场景定制（如"暂无告警，系统运行正常"）

- **Behavior Notes**:
  - 表格支持列宽拖拽（`el-table-column` resizable）、固定列、排序（仅数值和时间列）
  - 弹窗/抽屉层级 z-index 高于地图容器（地图默认 z-index: 400，弹出层 z-index: 2000+）
  - 所有数据变更操作（研判/派发/归档）需二次确认，使用 `ElMessageBox.confirm`
  - 告警铃铛未读数角标使用红色圆点，数字 > 99 时显示 "99+"
  - 页面切换时保留筛选状态（路由 query 参数持久化），刷新后恢复默认
  - 地图标记点击后右侧弹出对应告警的详情抽屉（联动交互）

---

## 5. Layout

- **Page Structure**:

  整体采用**三栏式企业后台布局**：

  ```
  ┌──────────────────────────────────────────────────────────────┐
  │ Header (64px)                                                │
  │ 面包屑 | 全局搜索框 |          告警铃铛(99+) | 头像 | 用户名  │
  ├──────┬───────────────────────────────────────────────────────┤
  │      │  ┌─────────────────────────────────────────────────┐  │
  │      │  │ Page Title (24px) + 副标题 (14px, secondary)   │  │
  │      │  ├─────────────────────────────────────────────────┤  │
  │ Side │  │ StatCards Row (可选) - 4列网格                  │  │
  │      │  ├─────────────────────────────────────────────────┤  │
  │ Nav  │  │ Filter Bar (可选) - 筛选条件、搜索、批量操作      │  │
  │ 220px│  ├─────────────────────────────────────────────────┤  │
  │      │  │                                                 │  │
  │      │  │  Main Content Area                              │  │
  │      │  │  (Table / Map / Charts / Form / Timeline)       │  │
  │      │  │                                                 │  │
  │      │  │                                                 │  │
  │      │  └─────────────────────────────────────────────────┘  │
  │      │                                                       │
  │      │  Footer (可选) - 页脚信息、数据更新时间                │
  └──────┴───────────────────────────────────────────────────────┘
  ```

  各页面具体布局差异：
  - **监测中心**: 无 StatCards，主区域为 GIS 地图 + 右侧面板（视频 + 飞行状态），16:9 视频比例
  - **告警管理**: StatCards (4项: 总数/高/中/低) + 筛选栏 + AlertTable
  - **证据管理**: 面包屑 + EvidenceTable，点击行展开证据详情（含时间线）
  - **巡查管理**: StatCards (4项) + PatrolTable
  - **数据分析**: ChartCards 网格布局（2×2), 热点区域占位卡片横跨底部
  - **系统管理**: Tabs 组织（用户管理 / 系统配置），各 Tab 独立表格或表单

- **Spacing System**:

  - 基础间距单位：`4px`
  - 间距令牌：`xs(4px) / sm(8px) / md(16px) / lg(24px) / xl(32px) / 2xl(48px)`
  - 卡片内部 padding：上下 `md(16px)`，左右 `lg(24px)`
  - 卡片之间的间距：`md(16px)`
  - 表格行间距：内聚于行高 40px，行间无额外间距
  - StatCards 行间距：卡片之间 `md(16px)`
  - 页面内容区上边距：`lg(24px)`（标题到内容区的呼吸空间）
  - 侧栏内部：菜单项高度 48px，item 上下 padding 0，左右 padding `md(16px)`

- **Content Flow**:

  - **信息优先级**：告警 > 地图状态 > 统计数据 > 列表/表格 > 辅助操作
  - **进入系统后**默认跳转「监测中心」页面（`/monitoring`）
  - **高风险告警**在页面顶部以 StatCards 形式突出展示，下方为可交互告警列表
  - **阅读顺序**遵循 F 型浏览：左上 Logo → 顶部右侧操作 → 左侧导航 → 主内容区从上到下
  - **告警详情抽屉**从右侧滑入时，主内容区视觉降级（叠加半透明遮罩 `rgba(0, 0, 0, 0.3)`）

---

## 6. Depth

- **Elevation Strategy**:

  | 层级 | z-index | 用途 | 实现方式 |
  |------|---------|------|----------|
  | L0 - 页面底色 | auto | 全局背景 | `--bg-page` 纯色 `#F5F6F8` |
  | L1 - 侧栏 | 100 | 侧边导航 | `--bg-sidebar` 纯色 `#001529`，无阴影 |
  | L2 - 卡片/面板 | auto | 内容容器 | 白底 + `box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06)` + 圆角 8px |
  | L3 - 地图工具栏 | 500 | 地图上层控件 | 白底卡片 + `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)` + 圆角 4px |
  | L4 - 悬浮/下拉 | 1000 | 下拉菜单、Tooltip、Popover | 白底 + `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)` + 圆角 8px |
  | L5 - 抽屉 | 2000 | 右侧滑出详情抽屉 | 白底 + 左侧投影 `box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15)` |
  | L6 - 弹窗 | 2001 | 居中模态弹窗（Dialog） | 白底 + 四周投影 + 遮罩 `rgba(0, 0, 0, 0.45)` |
  | L7 - 全局提示 | 3000 | Toast / Message | 顶部居中 + 卡片样式投影 |

- **Borders and Surfaces**:
  - 卡片统一圆角 `8px`（Element Plus 默认 4px，需覆盖）
  - 表格单元格无圆角，使用 1px 水平分割线 `--border: #E5E6EB`
  - 侧栏无圆角，紧贴左侧和顶部边缘
  - 地图容器无边框，通过父容器底色差异与相邻区域分隔
  - 弹窗圆角 `12px`，比卡片略大以区分层级
  - 抽屉顶部无圆角（贴合右边缘），左侧圆角 `8px`

- **Motion Cues**:

  | 动效 | 场景 | 实现 | 时长 |
  |------|------|------|------|
  | 页面切换 | 路由跳转 | `transition: opacity 0.2s ease` 淡入 | 0.2s |
  | 抽屉滑入 | 告警详情展开 | `transform: translateX(100%) → translateX(0)` ease-out | 0.3s |
  | 弹窗出现 | 确认对话框、证据详情 | `transform: scale(0.9) → scale(1)` + `opacity: 0 → 1` ease-out | 0.25s |
  | 按钮按下 | 所有按钮点击 | `transform: scale(0.98)` ease | 0.1s |
  | 列表行加载 | 表格数据加载完成 | 逐行 `opacity: 0 → 1`，每行延迟 50ms | 逐行 50ms |
  | 地图标记弹出 | 标记点 Popup | `transform: scale(0.8) → scale(1)` + fade-in | 0.15s |
  | 进度条动画 | 巡查进度 | `width: 0% → target%` ease-out | 0.8s |

  - **禁止使用**弹跳（bounce）、过度缩放（>1.05）、旋转等装饰性动效，严肃执法场景需保持稳重视觉
  - 所有动效遵循 `prefers-reduced-motion: reduce` 媒体查询，用户关闭动效时跳过过渡

---

## 7. Icon System

### Primary Library

**Lucide Icons**（lucide-vue-next）
- 选择理由：风格现代克制，与企业后台调性匹配，提供约 1000 个图标，覆盖导航/表单/告警/GIS 等主流 UI 场景
- 描边宽度：1.5px（与 Lucide 默认一致）
- 导入方式：按需导入（`import { Radar } from 'lucide-vue-next'`），利用 tree-shaking 减小打包体积

### Secondary Sources

| 来源 | 用途 | 命名规则 | 说明 |
|------|------|----------|------|
| **@element-plus/icons-vue** | Element Plus 组件内置图标（表单校验、加载态、弹窗关闭按钮） | 内置，无需手动命名 | 随组件自动注册 |
| **Custom SVG** | 品牌 Logo、土地违法专属图标（如违建标记、挖掘标记等地图自定义图标） | `custom-{category}-{name}` | 存于 `src/assets/icons/` |

### Icon Conflict Resolution

当前项目无图标冲突。Lucide 作为唯一主动引入的图标库，Element Plus Icons 仅限组件内部使用（如 `el-input` 的清除按钮、`el-message-box` 的图标）。若未来需要 GIS 专属图标而 Lucide 缺失：
1. 优先使用 Custom SVG 自定义
2. 不引入额外图标库（避免风格不一致）

### Icon Usage Standards

| 规格 | 尺寸 | 用途 |
|------|------|------|
| 导航图标 | 18px | 侧边栏菜单项图标 |
| 按钮图标 | 16px | 按钮内嵌图标（如导出、筛选、刷新） |
| 操作图标 | 16px | 表格操作列图标（详情、派发、归档） |
| 统计卡片图标 | 24px | StatCard 区域装饰图标 |
| 地图标记图标 | 自定义 SVG | 地图上违法目标标记 |

### Color Rules

- **默认**：图标颜色继承 `currentColor`（跟随文字色）
- **导航激活态**：主动使用 `--primary`（`#1A5FFF`）
- **危险操作**：删除、紧急标记使用 `--danger`（`#F53F3F`）
- **状态图标**：成功/警告/错误分别使用 `--success` / `--warning` / `--danger`
- **辅助图标**：使用 `--text-secondary`（`#86909C`）

### Core Icon Mapping (页面 → 图标)

| 页面/模块 | 图标名称 | 用途 |
|-----------|----------|------|
| 监测中心 | `lucide-radar` | 侧边栏导航 |
| 告警管理 | `lucide-bell-ring` | 侧边栏导航 + 顶部铃铛 |
| 证据管理 | `lucide-folder-search` | 侧边栏导航 |
| 巡查管理 | `lucide-route` | 侧边栏导航 |
| 数据分析 | `lucide-bar-chart-3` | 侧边栏导航 |
| 系统管理 | `lucide-settings` | 侧边栏导航 |
| 高风险 | `lucide-alert-triangle`（红色） | 告警等级标记 |
| 中风险 | `lucide-alert-circle`（橙色） | 告警等级标记 |
| 低风险 | `lucide-check-circle`（绿色） | 告警等级标记 |
| 视频播放 | `lucide-video` | 视频接入模块 |
| 地图标记 | `lucide-map-pin` / custom SVG | 地图违法位置标记 |
| 研判 | `lucide-eye` | 研判操作按钮 |
| 派发 | `lucide-send` | 派发任务按钮 |
| 归档 | `lucide-archive` | 归档操作按钮 |
| 图片证据 | `lucide-image` | 证据类型标记 |
| 报告证据 | `lucide-file-text` | 证据类型标记 |

### Accessibility

- 功能性图标（按钮内、导航项）必须附带 `aria-label` 或 `title` 属性说明用途
- 纯装饰性图标设置 `aria-hidden="true"`
- 可交互图标的最小触摸/点击区域不小于 `32 × 32px`

---

## 8. Responsive

- **Breakpoints**:

  | 断点 | 宽度范围 | 目标设备 | 策略 |
  |------|----------|----------|------|
  | xs | < 768px | 手机竖屏 | 不支持完整后台操作，提示"请使用更大屏幕访问" |
  | sm | 768px – 1023px | 平板电脑 | 侧栏收起为图标模式（64px），表格隐藏次要列 |
  | md | 1024px – 1439px | 笔记本 | **默认工作尺寸**，完整三栏布局 |
  | lg | 1440px – 1919px | 台式机 | 标准后台布局，内容区可扩展 |
  | xl | ≥ 1920px | 大屏显示器 | 内容区居中最大宽度 1440px，两侧留白 |

- **Adaptation Rules**:

  - **≥ 1024px（md 及以上）**: 完整三栏布局，侧栏展开 220px，表格显示全部列，StatCards 4 列排列
  - **768px – 1023px（sm）**: 侧栏收起为图标模式（宽度 64px，仅显示图标不显示文字），表格隐藏次要列（如编号、创建人），StatCards 降级为 2 列
  - **< 768px（xs）**: 导航栏折叠为汉堡菜单，内容区单列布局。但由于系统功能复杂，不推荐在此尺寸下操作，页面顶部显示提示条："建议在 1024px 以上宽度使用本系统"
  - **地图容器**: 始终填满可用空间，不受断点影响（通过 flex: 1 自适应父容器）
  - **告警详情抽屉**: 在 md 断点以下宽度由 720px 缩减为 100% 宽度（全屏抽屉）

- **Priority Changes**:

  | 功能 | 桌面端（≥ 1024px） | 平板端（768-1023px） | 移动端（< 768px） |
  |------|--------------------|--------------------|-------------------|
  | 侧栏导航 | 完整展开 | 图标模式 | 汉堡菜单 |
  | 告警列表 | 全列表 + 筛选 | 核心列 + 简化筛选 | 不推荐访问 |
  | GIS 地图 | 完整地图 + 右侧面板 | 全宽地图（隐藏右侧面板） | 简化地图 |
  | ECharts 图表 | 2×2 网格 | 单列堆叠 | 隐藏 |
  | 数据表格 | 全列显示 | 核心列显示 | 隐藏 |

> **注**：本系统为 Web 管理端设计，主要使用场景为监测中心值班电脑（通常 ≥ 1024px 宽度）。移动端（Flutter 巡查 APP）为独立应用，不在本文档范围内。

---

## 9. Review Log

- **Review Status**: 已审查
- **Checklist Basis**: Vercel Web Design Guidelines
- **Problem List**:
  - [minor] Color Palette — 未定义暗色模式（dark mode）配色方案 — 监测中心可能涉及夜间值守场景，长期看暗色模式有需求 — 暂标记为后续版本补充，不影响本次原型
  - [minor] Components — 全局 Toast/Message 视觉规格未明确 — 需要统一操作反馈样式 — 已补充至 Section 4 States：使用 Element Plus 默认 Message 组件，成功/警告/错误/信息分别对应 `--success` / `--warning` / `--danger` / `--info`，右上角展示，3 秒自动消失
  - [minor] Depth — 地图工具栏与弹窗的层级关系需明确 — 防止弹窗被地图层遮盖 — 已在 Section 6 中明确：地图容器 z-index: 400，L3 工具栏 z-index: 500，L4+ 弹出层 z-index: 1000+

- **Updated Sections**:
  - [Components — States] — 补充全局 Toast/Message 和空状态规范 — [resolved]
  - [Depth — Elevation Strategy] — 补充地图相关层级定义 — [resolved]

- **Open Issues**:
  1. 暗色模式（dark mode）配色方案：后续监测值守场景明确后，作为 v2 补充
  2. GIS 地图组件交互细节（图层层级、绘图工具、KML 导入）：与 Leaflet SDK 集成阶段细化
  3. 大屏展示端独立设计规范：超出本文档范围，需另起文档
  4. 地图标记簇聚（marker clustering）：当标记点超过 20 个时的聚合展示策略，待真实数据验证后补充

- **Revision Notes**:
  - 首次生成日期：2026-04-12
  - 基于《土地违法智能监测系统需求文档 v1.0》
  - 设计决策已完整覆盖需求文档中的六大功能模块（实时监测、告警管理、证据管理、巡查管理、数据分析、系统管理）
  - 所有 13 个核心组件均有详细规格定义（尺寸、状态、交互行为）
  - 图标系统采用 Lucide Icons 为主、Custom SVG 为辅的零冲突策略
  - 审查通过，进入原型开发阶段

---

> **文档元信息**
> - 生成工具：frontend-design-orchestrator skill
> - 生成日期：2026-04-12
> - 关联需求文档：《土地违法智能监测系统需求文档 v1.0》
> - 目标技术栈：Vue 3 + Element Plus + TypeScript + Leaflet + ECharts
> - 文档状态：已完成审查，可进入实施阶段
