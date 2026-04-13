<template>
  <el-drawer
    v-model="visible"
    title="告警详情"
    size="720px"
    :before-close="handleClose"
  >
    <template v-if="record">
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="告警编号">{{ record.id }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="riskTagType(record.riskLevel)" effect="dark">
            {{ riskLabel(record.riskLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="违法类型">{{ violationLabel(record.violationType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(record.status)">
            {{ statusLabel(record.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="占用面积">{{ record.area }} 亩</el-descriptions-item>
        <el-descriptions-item label="证据数量">{{ record.evidenceCount }} 条</el-descriptions-item>
        <el-descriptions-item label="位置" :span="2">{{ record.location.address }}</el-descriptions-item>
        <el-descriptions-item label="坐标" :span="2">
          经度 {{ record.location.lng.toFixed(6) }}°, 纬度 {{ record.location.lat.toFixed(6) }}°
        </el-descriptions-item>
        <el-descriptions-item label="处理人" :span="2">
          {{ assigneeName || '未分配' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(record.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(record.updatedAt) }}</el-descriptions-item>
      </el-descriptions>

      <!-- 告警描述 -->
      <el-card class="description-card" shadow="never">
        <template #header>
          <span class="card-title">告警描述</span>
        </template>
        <p>{{ record.description }}</p>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAction('研判')">研判处理</el-button>
        <el-button type="warning" @click="handleAction('派发')">派发任务</el-button>
        <el-button type="info" @click="handleAction('归档')">归档</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { AlertRecord, AlertStatus, RiskLevel, ViolationType } from '@/types'
import { users } from '@/mocks'

const props = defineProps<{
  modelValue: boolean
  record: AlertRecord | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const assigneeName = computed(() => {
  if (!props.record?.assignee) return ''
  const user = users.find(u => u.id === props.record?.assignee)
  return user?.name || ''
})

function riskLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = { 1: '低风险', 2: '中风险', 3: '高风险' }
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
    illegal_building: '违法建筑',
    illegal_excavation: '非法挖掘取土',
    farmland_occupation: '占用耕地',
    temporary_structure: '临时违建',
    material_piling: '材料堆放',
  }
  return map[type]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { hour12: false })
}

function handleAction(action: string): void {
  ElMessage.success(`已执行${action}操作`)
}

function handleClose(): void {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.description-card {
  margin-top: 16px;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
}
.description-card p {
  color: #606266;
  line-height: 1.6;
}
.action-bar {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}
</style>
