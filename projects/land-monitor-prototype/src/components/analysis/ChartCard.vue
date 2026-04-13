<template>
  <div class="chart-card">
    <div class="chart-card__header">
      <h3 class="chart-card__title">{{ title }}</h3>
      <slot name="extra"></slot>
    </div>
    <div class="chart-card__body">
      <slot></slot>
    </div>
    <div class="chart-card__footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.chart-card {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.chart-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.chart-card__body {
  padding: 12px 20px;
  min-height: 320px;
}

.chart-card__footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #F0F0F0;
  font-size: 13px;
  color: #86909C;
}
</style>
