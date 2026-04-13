<template>
  <div class="settings-page">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="users">
          <UserTable />
        </el-tab-pane>
        <el-tab-pane label="系统配置" name="config">
          <SystemConfigForm />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserTable from '@/components/settings/UserTable.vue'
import SystemConfigForm from '@/components/settings/SystemConfigForm.vue'

const activeTab = ref('users')
</script>

<style scoped>
.settings-page {
  padding: 0;
}

.settings-page :deep(.el-card__body) {
  padding: 16px;
}
</style>
