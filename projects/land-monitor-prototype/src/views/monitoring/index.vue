<template>
  <div class="monitoring-page">
    <!-- 左侧地图 65% -->
    <div class="map-section">
      <GisMap />
    </div>

    <!-- 右侧面板 35% -->
    <div class="right-panel">
      <VideoFeed />
      <FlightStatus />
    </div>
  </div>
</template>

<script setup lang="ts">
import GisMap from '@/components/monitoring/GisMap.vue'
import VideoFeed from '@/components/monitoring/VideoFeed.vue'
import FlightStatus from '@/components/monitoring/FlightStatus.vue'
</script>

<style scoped>
.monitoring-page {
  display: flex;
  gap: 16px;
  height: calc(100vh - 64px - 48px); /* 减去 navbar 和 header 高度 */
  padding: 12px;
}

.map-section {
  flex: 0 0 65%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
</style>
