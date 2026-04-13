<template>
  <div class="system-config-container">
    <el-form label-width="140px" label-position="left" class="config-form">
      <el-form-item label="告警推送开关">
        <el-switch v-model="config.alertPush" disabled />
      </el-form-item>
      <el-form-item label="短信通知开关">
        <el-switch v-model="config.smsNotify" disabled />
      </el-form-item>
      <el-form-item label="视频存储天数">
        <el-input-number v-model="config.videoStorageDays" :min="1" :max="365" disabled />
      </el-form-item>
      <el-form-item label="数据备份时间">
        <el-time-picker v-model="config.backupTime" format="HH:mm" disabled />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const config = ref({
  alertPush: true,
  smsNotify: false,
  videoStorageDays: 30,
  backupTime: new Date(2024, 0, 1, 2, 0) // 凌晨 02:00
})
</script>

<style scoped>
.system-config-container {
  padding: 24px 16px;
}

.config-form {
  max-width: 480px;
}
</style>
