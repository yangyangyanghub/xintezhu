<template>
  <div class="evidence-page">
    <!-- 顶部统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in statsCards" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" :style="{ background: stat.bg }">
              <component :is="stat.icon" :size="24" :color="stat.color" />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区：左侧表格 -->
    <el-row :gutter="16" class="main-row">
      <el-col :span="drawerVisible ? 14 : 24">
        <EvidenceTable
          :evidence="evidenceList"
          :loading="false"
          @select="handleSelect"
          @view="handleView"
          @detail="handleDetail"
        />
      </el-col>
    </el-row>

    <!-- 右侧 Drawer：证据时间线 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="420px"
      :with-header="true"
    >
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title">{{ drawerTitle }}</span>
          <el-tag size="small" type="info" v-if="selectedEvidence">
            {{ selectedEvidence.alertId }}
          </el-tag>
        </div>
      </template>

      <EvidenceTimeline :entries="timelineEntries" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Image, Video, ScanSearch, Shield } from 'lucide-vue-next'
import EvidenceTable from '@/components/evidence/EvidenceTable.vue'
import EvidenceTimeline from '@/components/evidence/EvidenceTimeline.vue'
import { evidence } from '@/mocks'
import type { EvidenceEntry } from '@/types'

/* ── 数据 ── */
const evidenceList = ref(evidence)
const selectedEvidence = ref<EvidenceEntry | null>(null)
const drawerVisible = ref(false)

/* ── 统计卡片 ── */
const statsCards = computed(() => {
  const list = evidenceList.value
  return [
    {
      label: '证据总数',
      value: list.length,
      icon: Shield,
      color: '#409EFF',
      bg: 'rgba(64,158,255,0.1)',
    },
    {
      label: '图片证据',
      value: list.filter((e) => e.type === 'image').length,
      icon: Image,
      color: '#409EFF',
      bg: 'rgba(64,158,255,0.1)',
    },
    {
      label: '视频证据',
      value: list.filter((e) => e.type === 'video').length,
      icon: Video,
      color: '#E6A23C',
      bg: 'rgba(230,162,60,0.1)',
    },
    {
      label: '已审核',
      value: list.filter((e) => e.status === 'reviewed').length,
      icon: ScanSearch,
      color: '#67C23A',
      bg: 'rgba(103,194,58,0.1)',
    },
  ]
})

/* ── 时间线：展示与选中证据同一 alertId 的所有证据 ── */
const timelineEntries = computed(() => {
  if (!selectedEvidence.value) return []
  const alertId = selectedEvidence.value.alertId
  return evidenceList.value.filter((e) => e.alertId === alertId)
})

const drawerTitle = computed(() => {
  if (!selectedEvidence.value) return '证据时间线'
  return `证据详情 — ${selectedEvidence.value.id}`
})

/* ── 事件处理 ── */
function handleSelect(entry: EvidenceEntry) {
  selectedEvidence.value = entry
  drawerVisible.value = true
}

function handleView(entry: EvidenceEntry) {
  selectedEvidence.value = entry
  drawerVisible.value = true
}

function handleDetail(entry: EvidenceEntry) {
  selectedEvidence.value = entry
  drawerVisible.value = true
}
</script>

<style scoped>
.evidence-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #E5E6EB;
}

.stat-card :deep(.el-card__body) {
  padding: 16px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #86909C;
  margin-top: 2px;
}

.main-row {
  margin-bottom: 16px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}
</style>