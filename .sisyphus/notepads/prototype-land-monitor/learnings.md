## 2026-04-12 - Task 1: Project Scaffolding + Dependencies

### What worked
- `npx create-vite land-monitor-prototype --template vue-ts` creates proper Vue 3 + TS project
- Vite 8.x has changed from Vue-only scaffolding - need to explicitly use `--template vue-ts`
- `@vue/tsconfig/tsconfig.dom.json` provides good Vue defaults

### Gotchas
- TypeScript 6.0 deprecates `baseUrl` - paths work fine without it using `moduleResolution: bundler`
- Added `ignoreDeprecations: "5.0"` to suppress TS5101 warning (needed for baseUrl removal)
  - Actually, removed baseUrl entirely - `paths` work with just `moduleResolution: bundler`

### Dependencies installed
- Runtime: element-plus, @element-plus/icons-vue, lucide-vue-next, vue-router@4, leaflet, @types/leaflet, echarts, vue-echarts
- Dev: unplugin-vue-components, unplugin-auto-import

### Configuration
- `@` alias in both vite.config.ts and tsconfig.app.json
- Element Plus auto-imports configured via unplugin-vue-components
- vue-router with basic catch-all redirect

## 2026-04-12 - Task 2: Layout Shell (Sidebar + Header + Content)

### What worked
- Element Plus `el-container` + `el-aside` + `el-header` + `el-main` 组合完美实现三栏布局
- Element Plus 的 `el-menu` 组件通过 `router` 属性自动将点击映射为路由跳转
- `unplugin-vue-components` 自动按需导入 Element Plus 组件，无需手动 import

### Sidecar work
- 创建了 6 个 placeholder view 页面用于路由挂载
- 更新了 router/index.ts 注册了所有 6 个路由路径
- AppSidebar 激活态通过 CSS `::before` 伪元素实现左侧 3px 蓝色竖线

### Gotchas
- `el-header` 默认有 padding，需通过 CSS 覆盖为 0 让 AppHeader 自己控制
- `lucide-vue-next` 的 `Route` 组件别名冲突，需要用 `as RouteIcon` 重命名
- 侧边栏菜单的 hover 和激活态需要 `!important` 覆盖 Element Plus 默认样式

## 2026-04-12 - Task 4: Mock Data Layer with Typed Interfaces

### What worked
- 所有业务类型统一定义在 `src/types/index.ts`，通过 `import type` 引用
- Mock 数据使用 `as const` 确保不可变，类型通过变量注解推导
- `.slice().sort()` 用于创建排序副本，避免突变原始数据

### Gotchas
- `noUnusedLocals: true` 会标记仅通过接口间接使用的类型导入 — 只导入代码中直接引用的类型
- `.sort()` 直接在类型标注数组上调用会使字面量类型收窄为 `string` — 先用 helper 函数收窄类型再排序
- 证据数据按时间倒序需要 `.slice().sort()` 创建不可变副本
- EvidenceEntry 的 15 条数据已按 timestamp 倒序排列

### Data distribution verification
- alerts: 20 条 — 高(3) 6 条、中(2) 8 条、低(1) 6 条 | pending 8、processing 7、archived 5
- evidence: 15 条 — image 6、video 4、report 3、comparison 2 | 关联 ALT-001~ALT-005
- patrols: 10 条 — planned 2、active 3、completed 4、cancelled 1
- users: 8 个 — patrol 2、monitor 2、enforcement 2、manager 1、admin 1
- statistics: 与 mock 数据总量一致
