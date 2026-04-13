<script setup lang="ts">
import { computed } from 'vue'
import { patrols, users } from '@/mocks'
import type { PatrolPlan, PatrolStatus } from '@/types'
import EmptyState from '@/components/shared/EmptyState.vue'

const statusConfig: Record<PatrolStatus, { label: string; type: 'info' | 'primary' | 'success' | 'danger' }> = {
  planned: { label: '计划中', type: 'info' },
  active: { label: '执行中', type: 'primary' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' },
}

const userMap = computed(() => {
  const map = new Map<string, string>()
  users.forEach(u => map.set(u.id, u.name))
  return map
})

function getUserName(assigneeId: string): string {
  return userMap.value.get(assigneeId) ?? assigneeId
}

function getStatusType(status: PatrolStatus): 'info' | 'primary' | 'success' | 'danger' {
  return statusConfig[status].type
}

function getStatusLabel(status: PatrolStatus): string {
  return statusConfig[status].label
}

function getProgressStatus(progress: number): 'success' | 'exception' | 'warning' | '' {
  if (progress === 100) return 'success'
  return ''
}
</script>

<template>
  <EmptyState v-if="patrols.length === 0" type="no-data" />

  <el-table v-else :data="patrols" stripe style="width: 100%" border>
    <el-table-column prop="id" label="计划编号" width="120" />
    <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
    <el-table-column prop="area" label="巡查区域" min-width="160" show-overflow-tooltip />
    <el-table-column prop="frequency" label="频次" width="80" align="center" />
    <el-table-column label="负责人" width="80" align="center">
      <template #default="{ row }">
        {{ getUserName((row as PatrolPlan).assignee) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="getStatusType((row as PatrolPlan).status)" size="small">
          {{ getStatusLabel((row as PatrolPlan).status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="进度" width="160" align="center">
      <template #default="{ row }">
        <el-progress
          :percentage="(row as PatrolPlan).progress"
          :status="getProgressStatus((row as PatrolPlan).progress)"
          :stroke-width="8"
        />
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120" align="center" fixed="right">
      <template #default>
        <el-button type="primary" link size="small">详情</el-button>
        <el-button type="primary" link size="small">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
