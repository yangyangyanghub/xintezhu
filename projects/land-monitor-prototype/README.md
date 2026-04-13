# 土地违法智能监测系统

基于无人机视频流的土地违法实时监测前端原型系统。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| UI 库 | Element Plus |
| 图标 | Lucide Icons |
| 路由 | Vue Router 4 |
| 地图 | Leaflet + OpenStreetMap |
| 图表 | ECharts + vue-echarts |
| 构建 | Vite |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 目录结构

```
src/
├── components/
│   ├── layout/       # 布局组件（侧栏/头部/容器）
│   ├── monitoring/   # 监测中心组件（地图/视频/飞行状态）
│   ├── alerts/       # 告警管理组件（表格/筛选/抽屉）
│   ├── evidence/     # 证据管理组件（表格/时间线）
│   ├── patrol/       # 巡查管理组件（卡片/表格）
│   ├── analysis/     # 数据分析组件（图表容器/ECharts）
│   └── settings/     # 系统管理组件（用户表/配置表单）
├── views/            # 页面级组件（6 个模块入口）
├── router/           # Vue Router 配置
├── mocks/            # Mock 数据层（类型安全）
├── types/            # TypeScript 类型定义
├── assets/styles/    # 全局样式
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 监测中心 | /monitoring | GIS 地图 + 视频流 + 飞行状态 |
| 告警管理 | /alerts | 告警列表 + 筛选 + 详情抽屉 |
| 证据管理 | /evidence | 证据表格 + 时间线 |
| 巡查管理 | /patrol | 统计卡片 + 巡查计划表格 |
| 数据分析 | /analysis | ECharts 图表（饼图/趋势/热力图） |
| 系统管理 | /settings | 用户管理 + 系统配置 |

## 已知限制（原型 vs 正式系统）

- 所有数据均为 Mock，不连接后端 API
- 视频流为占位组件，不接入真实 RTSP/WebRTC
- 地图仅展示标记，不支持测量/绘图/图层层叠
- 不支持移动端响应式（≥1024px 设计）
- 不包含用户认证和权限控制

## 关联文档

- [需求文档](../../myk/项目文档/土地违法智能监测系统需求文档.md)
- [设计文档](../../myk/项目文档/土地违法智能监测系统-DESIGN.md)
