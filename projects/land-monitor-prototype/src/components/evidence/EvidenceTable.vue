<template>
  <el-card shadow="never" class="evidence-table-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">证据列表</span>
        <el-input
          v-model="searchText"
          placeholder="搜索编号 / 关联告警"
          clearable
          style="width: 260px"
          prefix-icon="Search"
        />
      </div>
    </template>

    <el-table
      :data="filteredEvidence"
      stripe
      border
      highlight-current-row
      style="width: 100%"
      @current-change="handleRowClick"
      v-loading="loading"
    >
      <el-table-column prop="id" label="编号" width="100" fixed />

      <el-table-column prop="alertId" label="关联告警 ID" width="130" />

      <el-table-column label="证据类型" width="150">
        <template #default="{ row }">
          <div class="type-cell">
            <component :is="typeIcon(row.type)" :size="18" :color="typeColor(row.type)" />
            <span>{{ typeLabel(row.type) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="采集时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.timestamp) }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small" effect="light">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="handleView(row)">
            查看
          </el-button>
          <el-button link type="primary" size="small" @click.stop="handleDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Image, Video, FileText, ScanSearch } from 'lucide-vue-next'
import type { EvidenceEntry, EvidenceType, EvidenceStatus } from '@/types'

const props = defineProps<{
  evidence: EvidenceEntry[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', entry: EvidenceEntry): void
  (e: 'view', entry: EvidenceEntry): void
  (e: 'detail', entry: EvidenceEntry): void
}>()

const searchText = ref('')

const filteredEvidence = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return props.evidence
  return props.evidence.filter((e) =>
    e.id.toLowerCase().includes(keyword) ||
    e.alertId.toLowerCase().includes(keyword)
  )
})

/* ── 类型图标 ── */
function typeIcon(type: EvidenceType) {
  const map: Record<EvidenceType, typeof Image> = {
    image: Image,
    video: Video,
    report: FileText,
    comparison: ScanSearch,
  }
  return map[type]
}

function typeLabel(type: EvidenceType) {
  const map: Record<EvidenceType, string> = {
    image: '图片',
    video: '视频',
    report: '报告',
    comparison: '对比',
  }
  return map[type]
}

function typeColor(type: EvidenceType) {
  const map: Record<EvidenceType, string> = {
    image: '#409EFF',
    video: '#E6A23C',
    report: '#67C23A',
    comparison: '#909399',
  }
  return map[type]
}

/* ── 状态 ── */
function statusType(status: EvidenceStatus): 'success' | 'warning' | 'info' | 'primary' {
  const map: Record<EvidenceStatus, 'success' | 'warning' | 'info' | 'primary'> = {
    collected: 'warning',
    reviewed: 'primary',
    stored: 'success',
    exported: 'info',
  }
  return map[status]
}

function statusLabel(status: EvidenceStatus) {
  const map: Record<EvidenceStatus, string> = {
    collected: '已采集',
    reviewed: '已审核',
    stored: '已入库',
    exported: '已导出',
  }
  return map[status]
}

/* ── 时间格式化 ── */
function formatTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ── 事件 ── */
function handleRowClick(row: EvidenceEntry | null) {
  if (row) emit('select', row)
}

function handleView(row: EvidenceEntry) {
  emit('view', row)
}

function handleDetail(row: EvidenceEntry) {
  emit('detail', row)
}
</script>

<style scoped>
.evidence-table-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
