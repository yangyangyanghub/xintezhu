<template>
  <div class="sidebar-container">
    <div class="sidebar-logo">土地违法监测</div>
    <el-menu
      :default-active="$route.path"
      :unique-opened="false"
      background-color="#001529"
      text-color="rgba(255,255,255,0.65)"
      active-text-color="#1A5FFF"
      router
      class="sidebar-menu"
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
        <component :is="item.icon" class="menu-icon" />
        <span class="menu-text">{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { Radar, BellRing, FolderSearch, Route as RouteIcon, BarChart3, Settings } from 'lucide-vue-next'

const menuItems = [
  { path: '/monitoring', icon: Radar, label: '监测中心' },
  { path: '/alerts', icon: BellRing, label: '告警管理' },
  { path: '/evidence', icon: FolderSearch, label: '证据管理' },
  { path: '/patrol', icon: RouteIcon, label: '巡查管理' },
  { path: '/analysis', icon: BarChart3, label: '数据分析' },
  { path: '/settings', icon: Settings, label: '系统管理' },
]
</script>

<style scoped>
.sidebar-container {
  width: 100%;
  height: 100%;
  background-color: #001529;
}

.sidebar-logo {
  height: 64px;
  line-height: 64px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  border-right: none !important;
  background-color: #001529 !important;
}

.menu-icon {
  width: 18px;
  height: 18px;
}

.menu-text {
  font-size: 14px;
}

.sidebar-menu .el-menu-item:hover {
  color: rgba(255, 255, 255, 0.95) !important;
  background-color: transparent !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: transparent !important;
  color: #1A5FFF !important;
  position: relative;
}

.sidebar-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #1A5FFF;
}
</style>
