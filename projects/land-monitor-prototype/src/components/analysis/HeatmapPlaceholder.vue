<template>
  <ChartCard title="热点区域热力图">
    <div class="heatmap-placeholder">
      <div class="heatmap-placeholder__content">
        <icon-clock class="heatmap-placeholder__icon" />
        <span class="heatmap-placeholder__text">需要 GIS SDK 支持</span>
        <span class="heatmap-placeholder__hint">即将上线</span>
      </div>
    </div>
    <template #footer>
      热力图将展示违法事件高频发生区域，辅助执法资源调度
    </template>
  </ChartCard>
</template>

<script setup lang="ts">
/* Clock import removed - unused in template */
</script>

<style scoped>
.heatmap-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  background: #FFFFFF;
}

.heatmap-placeholder__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #C0C4CC;
}

.heatmap-placeholder__icon {
  width: 48px;
  height: 48px;
  color: #C0C4CC;
}

.heatmap-placeholder__text {
  font-size: 14px;
  font-weight: 500;
  color: #86909C;
}

.heatmap-placeholder__hint {
  font-size: 12px;
  color: #C0C4CC;
}
</style>
