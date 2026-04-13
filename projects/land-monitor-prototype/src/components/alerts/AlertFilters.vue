<template>
  <div class="alert-filters">
    <div class="risk-tabs">
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: modelValue === tab.value }]"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </span>
    </div>
    <el-select :model-value="statusFilter" placeholder="状态筛选" style="width: 120px"
      @update:model-value="$emit('update:statusFilter', $event)">
      <el-option label="全部" value="all" />
      <el-option label="待研判" value="pending" />
      <el-option label="处置中" value="processing" />
      <el-option label="已归档" value="archived" />
    </el-select>
    <el-input :model-value="searchQuery" placeholder="搜索编号/位置" style="width: 200px" clearable
      @update:model-value="$emit('update:searchQuery', $event)" />
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { label: '全部', value: 'all' as const },
  { label: '高风险', value: 3 as const },
  { label: '中风险', value: 2 as const },
  { label: '低风险', value: 1 as const },
]

defineProps<{
  modelValue: 'all' | 1 | 2 | 3
  statusFilter: string
  searchQuery: string
}>()

defineEmits<{
  'update:modelValue': [val: 'all' | 1 | 2 | 3]
  'update:statusFilter': [val: string]
  'update:searchQuery': [val: string]
}>()
</script>

<style scoped>
.alert-filters { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.risk-tabs { display: flex; gap: 4px; }
.tab-item { padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; border: 1px solid #E5E6EB; transition: all 0.2s; }
.tab-item:hover { border-color: #1A5FFF; }
.tab-item.active { background: #1A5FFF; color: white; border-color: #1A5FFF; }
</style>
