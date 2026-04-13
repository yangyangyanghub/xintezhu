<template>
  <el-container class="app-layout">
    <el-aside width="220px">
      <AppSidebar />
    </el-aside>
    <el-container class="main-container" direction="vertical">
      <el-header height="64px">
        <AppHeader />
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.main-container {
  height: 100vh;
}

.el-header {
  padding: 0;
}

.app-main {
  background-color: #F5F6F8;
  min-height: calc(100vh - 64px);
  padding: 16px;
}
</style>
