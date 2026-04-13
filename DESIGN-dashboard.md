# DESIGN.md - 仪表盘页面设计规范

## 1. Visual Theme
- **Design Intent**: 专业级数据密集型仪表盘,强调信息清晰度和操作效率,适用于企业级数据分析与管理场景
- **Style Keywords**: minimalism, data-dense, professional, clean, efficiency-focused, clarity
- **Reference Notes**: 参考 awesome-design-md 中的 SaaS Dashboard 设计模式:数据可视化、表格布局、过滤器模式。避免过度装饰,保持功能性优先

## 2. Color Palette
- **Primary Colors**: 
  - 主色(Primary):用于核心操作按钮、关键数据指标、导航激活状态
  - 中性色(Neutral):用于背景、文本、边框、次要组件
- **Secondary Colors**: 
  - 强调色(Acccent):用于重要提醒、警告状态、次要操作
  - 状态色:
    - Success:成功状态、正向指标
    - Warning:警告状态、需要关注
    - Error:错误状态、紧急问题
- **Usage Rules**: 
  - 背景:使用中性色分层(主背景、卡片背景、浮层背景)
  - 文本:主要文本使用深色中性色,次要文本使用较浅中性色
  - 边框:使用淡中性色分隔区域,避免过多视觉干扰
  - 状态反馈:状态色优先用于图标和徽标,避免大面积背景使用

## 3. Typography
- **Type System**: 
  - H1(页面标题):用于仪表盘主标题
  - H2(区域标题):用于数据区块标题(如"关键指标"、"用户分析")
  - H3(卡片标题):用于单个数据卡片标题
  - Body(正文):用于数据描述、表格内容、表单文本
  - Caption(辅助):用于次要说明、时间戳、单位标注
- **Font Guidance**: 
  - 字体风格:现代无衬线字体,单字体系列
  - 字重:Regular(400)用于正文,Semibold(600)用于标题,Bold(700)用于强调
  - 可读性:正文不小于14px,数据标签不小于12px
- **Text Rules**: 
  - 字距:保持默认或微调,避免过宽或过窄
  - 行高:正文使用1.5-1.6倍行高,标题使用1.2-1.3倍
  - 最大行长:正文控制在600-700px宽度,避免过宽降低可读性

## 4. Components
- **Core Components**: 
  - Button:主按钮、次按钮、文本按钮、图标按钮
  - Card:数据卡片、统计卡片、图表卡片
  - Table:数据表格、排序表格、筛选表格
  - Form:搜索框、筛选器、日期选择器、下拉菜单
  - Navigation:侧边导航、顶部导航、面包屑
  - Chart:柱状图、折线图、饼图、指标图
  - Badge:状态徽标、数字徽标
  - Modal:确认对话框、详情弹窗
- **States**: 
  - Default:正常状态,使用默认颜色
  - Hover:悬停时轻微提升亮度或添加阴影
  - Active/Focused:激活或聚焦时明显突出(边框或背景变化)
  - Disabled:禁用状态使用较低对比度(opacity或色值调整)
  - Loading:加载状态显示骨架屏或进度指示器
  - Error:错误状态使用Error色+错误图标+错误文本
- **Behavior Notes**: 
  - 交互反馈:按钮点击有即时视觉反馈,表格行悬停高亮
  - 一致性:所有按钮使用统一尺寸和圆角,卡片使用统一间距和阴影
  - 可复用:组件设计考虑复用性,避免过度定制

## 5. Layout
- **Page Structure**: 
  - 顶部区域:全局导航、用户信息、全局搜索
  - 左侧区域:侧边导航、功能菜单
  - 主内容区域:数据仪表盘主体(分为多个区块)
    - 关键指标区:顶部横排关键KPI卡片
    - 图表区:中部数据可视化图表
    - 表格区:底部详细数据表格
  - 右侧区域(可选):快捷操作、通知列表、快捷入口
- **Spacing System**: 
  - 间距层级:4px(紧凑)、8px(默认)、16px(区块)、24px(区域)、32px(页面)
  - 栅格系统:12栏栅格,灵活响应不同内容宽度
  - 对齐:所有元素对齐栅格或基准线,避免随意偏移
  - 留白:区块间保持足够留白(24-32px),避免视觉拥挤
- **Content Flow**: 
  - 信息优先级:关键指标优先(顶部),次要指标其次,详细数据最后
  - 阅读顺序:从左上到右下,符合自然阅读习惯
  - 关键路径:用户能快速获取关键信息,进入详细操作

## 6. Depth
- **Elevation Strategy**: 
  - 层级划分:背景(0层)、卡片(1层)、浮层(2层)、模态框(3层)
  - 阴影:卡片使用柔和阴影(0-2px模糊,低对比度),浮层使用中等阴影,模态框使用明显阴影
  - 层级关系:子元素层级不高于父元素
- **Borders and Surfaces**: 
  - 描边:卡片使用淡色描边分隔(可选阴影替代),表格使用细描边
  - 分层:不同功能区域通过背景色或描边区分
  - 背景面板:主背景最浅,卡片背景稍深,浮层背景最深
- **Motion Cues**: 
  - 层级动效:浮层出现时有轻微缩放或位移动效,消失时反向动效
  - 过渡:卡片悬停时轻微提升阴影或位移,强调层级变化

## 7. Icon System
- **Icon Source**: 
  - **Primary**: Lucide Icons(lucide-*)
    - 选择理由:现代、干净、一致性强,适合通用产品UI,与 shadcn/ui 生态系统兼容
  - **Secondary**: Custom SVG(custom-{category}-*)
    - 仅用于品牌标志或特定业务图标
- **Usage Guidelines**: 
  - 尺寸层级:sm(16px)用于按钮、列表;md(20px)用于导航默认;lg(24px)用于强调;xl(32px)用于空状态
  - 线条粗细:保持 Lucide 默认(1.5-2px),与整体设计风格一致
  - 配色:默认继承文本色(currentColor),状态图标使用对应状态色
  - 搭配:图标与文本搭配时保持视觉平衡,调整间距和尺寸
- **Conflict Handling**: 
  - **规则**:单一语义槽位仅保留一个活动图标
  - **命名**:在规划文档中使用完全限定名(lucide-home, custom-brand-logo)
  - **例外**:品牌标志允许 custom-* 前缀;国旗、社交图标等特殊符号集需要文档化例外规则
  - **迁移**:遗留图标源(iconfont-*等)标记为过渡性,需替换或明确豁免

## 8. Responsive
- **Breakpoints**: 
  - Mobile:320-767px(移动设备)
  - Tablet:768-1023px(平板设备)
  - Laptop:1024-1439px(笔记本)
  - Desktop:1440px及以上(桌面设备)
- **Adaptation Rules**: 
  - **布局变化**:
    - Mobile:侧边导航转换为底部导航或汉堡菜单,卡片改为单列堆叠,表格转为卡片列表
    - Tablet:侧边导航可折叠,卡片改为双列,表格保持横向滚动
    - Laptop/Desktop:完整布局,侧边导航常驻,卡片多列排列
  - **导航变化**:
    - Mobile:顶部保留关键操作,侧边导航隐藏为汉堡菜单
    - Tablet及以上:侧边导航常驻,可折叠展开
  - **组件变化**:
    - Mobile:按钮改为块级,表单控件堆叠,图表简化或隐藏次要数据
    - Tablet/Desktop:保持默认组件样式,表单控件可横向排列
- **Priority Changes**: 
  - Mobile:仅显示关键指标和核心操作,次要数据折叠或隐藏
  - Tablet:显示主要指标和操作,次要数据可折叠查看
  - Desktop:显示完整内容层级,包括关键指标、图表、表格、次要操作

## 9. Review Log
- **Review Status**: 待审查
- **Checklist Basis**: Vercel Web Design Guidelines(来自 review-rules.md)
- **Problem List**: 
  - (待审查后填充问题列表)
- **Updated Sections**: 
  - (待修订后填充已更新章节)
- **Open Issues**: 
  - 待确认:是否需要暗色模式支持
  - 待确认:具体品牌色值(当前仅为语义描述)
  - 待确认:图表组件库选择(Chart.js、ECharts、或其他)
  - 待确认:数据刷新策略(实时刷新/定时刷新/手动刷新)
  - 待确认:数据导出功能(导出格式、导出范围)
- **Revision Notes**: 
  - 本设计文档基于 frontend-design-orchestrator 技能内置参考资料生成
  - 参考资料:design-md-template.md(模板)、design-sources.md(风格)、icon-systems.md(图标)、review-rules.md(审查)
  - 设计风格:Minimalism(参考 SaaS Dashboard 模式)
  - 图标系统:Lucide Icons(Primary) + Custom SVG(Secondary)
  - 下一步:需实际审查验证并根据项目具体需求修订

---

*设计规范生成时间：2026-04-11*  
*状态：待产品确认和设计评审*  
*参考资料来源：frontend-design-orchestrator 技能内置文件*