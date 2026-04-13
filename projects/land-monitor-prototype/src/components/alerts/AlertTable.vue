<template>
  <div class="alert-table">
    <!-- 空状态 -->
    <EmptyState
      v-if="data.length === 0"
      :type="hasFilters ? 'no-results' : 'no-data'"
    />

    <!-- 数据表格 -->
    <template v-else>
      <el-table :data="pagedData" stripe style="width: 100%" @row-click="handleRowClick">
        <el-table-column prop="id" label="告警编号" width="120" />
        <el-table-column label="违法类型" width="140">
          <template #default="{ row }">
            {{ violationLabel(row.violationType) }}
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.riskLevel)" effect="dark" size="small">
              {{ riskLabel(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="位置" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.location.address }}
          </template>
        </el-table-column>
        <el-table-column label="面积(亩)" width="90" align="right">
          <template #default="{ row }">
            {{ row.area }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="证据" width="70" align="center">
          <template #default="{ row }">
            {{ row.evidenceCount }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="data.length"
        layout="total, prev, pager, next, jumper"
        class="pagination"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AlertRecord, ViolationType, RiskLevel, AlertStatus } from '@/types'
import EmptyState from '@/components/shared/EmptyState.vue'

const props = defineProps<{
  data: AlertRecord[]
  /** 是否启用了筛选条件（用于区分空状态类型） */
  hasFilters?: boolean
}>()

const emit = defineEmits<{
  view: [record: AlertRecord]
}>()

const currentPage = ref(1)
const pageSize = 10

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return props.data.slice(start, start + pageSize)
})

function riskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = { 1: '低', 2: '中', 3: '高' }
  return map[level]
}

function riskTagType(level: RiskLevel): 'success' | 'warning' | 'danger' {
  const map: Record<RiskLevel, 'success' | 'warning' | 'danger'> = { 1: 'success', 2: 'warning', 3: 'danger' }
  return map[level]
}

function statusLabel(status: AlertStatus): string {
  const map: Record<AlertStatus, string> = { pending: '待研判', processing: '处置中', archived: '已归档' }
  return map[status]
}

function statusTagType(status: AlertStatus): 'success' | 'warning' | 'info' {
  const map: Record<AlertStatus, 'success' | 'warning' | 'info'> = { pending: 'info', processing: 'warning', archived: 'success' }
  return map[status]
}

function violationLabel(type: ViolationType): string {
  const map: Record<ViolationType, string> = {
    illegal_building: '违建',
    illegal_excavation: '挖掘取土',
    farmland_occupation: '占耕地',
    temporary_structure: '临时违建',
    material_piling: '材料堆放',
  }
  return map[type]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function handleRowClick(row: AlertRecord): void {
  emit('view', row)
}
</script>

<style scoped>
.alert-table {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
