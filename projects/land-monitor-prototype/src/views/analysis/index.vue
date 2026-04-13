<template>
  <div class="analysis-page">
    <div class="analysis-grid">
      <!-- 第 1 行：两个图表并排 -->
      <ViolationTypeChart />
      <TrendChart />
      <!-- 第 2 行：热力图占位（跨两列） -->
      <HeatmapPlaceholder />
    </div>
  </div>
</template>

<script setup lang="ts">
import ViolationTypeChart from '@/components/analysis/ViolationTypeChart.vue'
import TrendChart from '@/components/analysis/TrendChart.vue'
import HeatmapPlaceholder from '@/components/analysis/HeatmapPlaceholder.vue'
</script>

<style scoped>
.analysis-page {
  min-height: 100%;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.analysis-grid > :nth-child(3) {
  grid-column: 1 / -1;
}
</style>
