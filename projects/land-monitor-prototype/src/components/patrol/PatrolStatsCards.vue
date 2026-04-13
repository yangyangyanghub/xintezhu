<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardList, PlayCircle, CheckCircle2, Map } from 'lucide-vue-next'
import { patrols } from '@/mocks'

interface StatCard {
  icon: typeof ClipboardList
  value: string | number
  label: string
  color: string
}

const stats = computed<StatCard[]>(() => {
  const todayCount = 12
  const activeCount = patrols.filter(p => p.status === 'active').length
  const completedCount = patrols.filter(p => p.status === 'completed').length
  const totalArea = patrols.reduce((sum, p) => sum + p.areaCovered, 0)

  return [
    { icon: ClipboardList, value: todayCount, label: '今日巡查次数', color: '#3B82F6' },
    { icon: PlayCircle, value: activeCount, label: '执行中计划', color: '#10B981' },
    { icon: CheckCircle2, value: completedCount, label: '已完成计划', color: '#8B5CF6' },
    { icon: Map, value: `${totalArea.toFixed(1)}km²`, label: '覆盖面积', color: '#F59E0B' },
  ]
})
</script>

<template>
  <el-row :gutter="16">
    <el-col v-for="stat in stats" :key="stat.label" :xs="24" :sm="12" :md="6">
      <div class="stat-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '14' }">
          <component :is="stat.icon" :size="24" :color="stat.color" />
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #64748B;
}
</style>
