<template>
  <div class="evidence-timeline" v-if="sortedEntries.length">
    <el-timeline>
      <el-timeline-item
        v-for="entry in sortedEntries"
        :key="entry.id"
        :timestamp="formatFullTime(entry.timestamp)"
        :type="timelineColor(entry.status)"
        :hollow="entry.status !== 'reviewed'"
        size="large"
      >
        <div class="timeline-content">
          <div class="timeline-header">
            <div class="timeline-type">
              <component :is="typeIcon(entry.type)" :size="16" :color="typeColor(entry.type)" />
              <span class="type-label">{{ typeLabel(entry.type) }}</span>
            </div>
            <el-tag :type="tagType(entry.status)" size="small" effect="plain">
              {{ statusLabel(entry.status) }}
            </el-tag>
          </div>

          <p class="timeline-desc">{{ entry.description }}</p>

          <div class="timeline-meta">
            <span class="meta-item">
              <el-icon><MapPin /></el-icon>
              {{ entry.location.address }}
            </span>
            <span class="meta-item">
              <el-icon><Cpu /></el-icon>
              {{ entry.deviceInfo }}
            </span>
            <span class="meta-id">{{ entry.id }}</span>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>

  <el-empty v-else description="暂无证据记录" :image-size="120" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Image, Video, FileText, ScanSearch, MapPin, Cpu } from 'lucide-vue-next'
import type { EvidenceEntry, EvidenceType, EvidenceStatus } from '@/types'

const props = defineProps<{
  entries: EvidenceEntry[]
}>()

/* 按时间倒序 */
const sortedEntries = computed(() =>
  [...props.entries].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
)

/* ── 类型映射 ── */
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
    image: '图片证据',
    video: '视频证据',
    report: '报告文档',
    comparison: '对比分析',
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

/* ── 状态映射 ── */
function statusLabel(status: EvidenceStatus) {
  const map: Record<EvidenceStatus, string> = {
    collected: '已采集',
    reviewed: '已审核',
    stored: '已入库',
    exported: '已导出',
  }
  return map[status]
}

function tagType(status: EvidenceStatus): 'success' | 'warning' | 'info' | 'primary' {
  const map: Record<EvidenceStatus, 'success' | 'warning' | 'info' | 'primary'> = {
    collected: 'warning',
    reviewed: 'primary',
    stored: 'success',
    exported: 'info',
  }
  return map[status]
}

function timelineColor(status: EvidenceStatus): 'primary' | 'success' | 'warning' | 'info' {
  const map: Record<EvidenceStatus, 'primary' | 'success' | 'warning' | 'info'> = {
    collected: 'warning',
    reviewed: 'primary',
    stored: 'success',
    exported: 'info',
  }
  return map[status]
}

/* ── 时间格式化 ── */
function formatFullTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<style scoped>
.evidence-timeline {
  padding: 16px 0;
}

.timeline-content {
  background: #F7F8FA;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 4px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-label {
  font-size: 13px;
  font-weight: 500;
  color: #1D2129;
}

.timeline-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: #4E5969;
  line-height: 1.6;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #86909C;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-id {
  margin-left: auto;
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  color: #A9AEB8;
}
</style>
