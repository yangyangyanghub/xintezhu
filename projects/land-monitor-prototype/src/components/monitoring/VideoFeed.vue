<template>
  <div class="video-feed">
    <div class="video-placeholder">
      <div class="video-content">
        <Video class="video-icon" />
        <span class="video-label">模拟实时画面</span>
        <span class="drone-label">无人机 DJI-M300 #1</span>
      </div>
      <span class="live-badge">LIVE</span>
    </div>
    <div class="video-controls">
      <el-button-group>
        <el-button size="small" :icon="ArrowUp" disabled />
        <el-button size="small" :icon="ArrowLeft" disabled />
        <el-button size="small" :icon="ArrowDown" disabled />
        <el-button size="small" :icon="ArrowRight" disabled />
      </el-button-group>
      <span class="control-label">云台控制（占位）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Video, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-vue-next'
</script>

<style scoped>
.video-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.video-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #1F1F1F;
  border-radius: 8px;
  overflow: hidden;
}
.video-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  gap: 8px;
}
.video-icon {
  width: 48px;
  height: 48px;
}
.video-label {
  font-size: 14px;
}
.drone-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}
.live-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #F53F3F;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 1px;
}
.video-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}
.control-label {
  font-size: 12px;
  color: #86909C;
}
</style>
