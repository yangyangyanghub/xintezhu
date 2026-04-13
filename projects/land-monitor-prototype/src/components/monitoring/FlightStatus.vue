<template>
  <div class="flight-status">
    <el-descriptions title="飞行状态" :column="2" border size="small">
      <el-descriptions-item label="经度">{{ flight.lng.toFixed(6) }}°</el-descriptions-item>
      <el-descriptions-item label="纬度">{{ flight.lat.toFixed(6) }}°</el-descriptions-item>
      <el-descriptions-item label="高度">{{ flight.altitude }}m</el-descriptions-item>
      <el-descriptions-item label="速度">{{ flight.speed }}m/s</el-descriptions-item>
      <el-descriptions-item label="电量" :span="2">
        <el-progress :percentage="flight.battery" :color="batteryColor" :stroke-width="8" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const flight = { lng: 116.4074, lat: 39.9042, altitude: 120, speed: 8.5, battery: 72 }

const batteryColor = computed(() => {
  if (flight.battery > 50) return '#00B42A'
  if (flight.battery > 20) return '#FF7D00'
  return '#F53F3F'
})
</script>

<style scoped>
.flight-status {
  margin-top: 12px;
}
</style>
