<template>
  <div class="alerts-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">告警总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon high">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.highRisk }}</div>
              <div class="stat-label">高风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon medium">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.mediumRisk }}</div>
              <div class="stat-label">中风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon low">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lowRisk }}</div>
              <div class="stat-label">低风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <AlertFilters
      v-model="riskFilter"
      v-model:status-filter="statusFilter"
      v-model:search-query="searchQuery"
    />

    <!-- 告警表格 -->
    <AlertTable
      :data="filteredData"
      :has-filters="riskFilter !== 'all' || statusFilter !== 'all' || searchQuery !== ''"
      @view="handleView"
    />

    <!-- 详情抽屉 -->
    <AlertDetailDrawer v-model="drawerVisible" :record="selectedAlert" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import type { AlertRecord } from '@/types'
import { alerts, statistics } from '@/mocks'
import AlertFilters from '@/components/alerts/AlertFilters.vue'
import AlertTable from '@/components/alerts/AlertTable.vue'
import AlertDetailDrawer from '@/components/alerts/AlertDetailDrawer.vue'

// 统计
const stats = computed(() => ({
  total: statistics.totalAlerts,
  highRisk: statistics.highRisk,
  mediumRisk: statistics.mediumRisk,
  lowRisk: statistics.lowRisk,
}))

// 筛选状态
const riskFilter = ref<'all' | 1 | 2 | 3>('all')
const statusFilter = ref('all')
const searchQuery = ref('')

// 筛选逻辑
const filteredData = computed(() => {
  return alerts.filter(item => {
    // 风险等级筛选
    if (riskFilter.value !== 'all' && item.riskLevel !== riskFilter.value) return false
    // 状态筛选
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    // 关键词搜索（编号、位置地址）
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchId = item.id.toLowerCase().includes(q)
      const matchAddress = item.location.address.toLowerCase().includes(q)
      if (!matchId && !matchAddress) return false
    }
    return true
  })
})

// 详情抽屉
const drawerVisible = ref(false)
const selectedAlert = ref<AlertRecord | null>(null)

function handleView(record: AlertRecord): void {
  selectedAlert.value = record
  drawerVisible.value = true
}
</script>

<style scoped>
.alerts-page {
  padding: 12px;
}

.stat-cards {
  margin-bottom: 16px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-card :deep(.el-card__body) {
  padding: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.stat-icon.total { background: linear-gradient(135deg, #1A5FFF, #86909C); }
.stat-icon.high { background: linear-gradient(135deg, #F53F3F, #F76560); }
.stat-icon.medium { background: linear-gradient(135deg, #FF7D00, #FFB400); }
.stat-icon.low { background: linear-gradient(135deg, #00B42A, #40CC00); }

.stat-info {
  flex: 1;
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
</style>
