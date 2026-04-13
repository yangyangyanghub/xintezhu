<template>
  <div class="header-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ currentPageName }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="header-user">
      <div class="user-avatar"></div>
      <span class="user-name">管理员</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageNameMap: Record<string, string> = {
  monitoring: '监测中心',
  alerts: '告警管理',
  evidence: '证据管理',
  patrol: '巡查管理',
  analysis: '数据分析',
  settings: '系统管理',
}

const currentPageName = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const currentPage = pathSegments[0] || ''
  return pageNameMap[currentPage] || '未知页面'
})
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #E5E6EB;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #E5E6EB;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  color: #1D2129;
}
</style>
