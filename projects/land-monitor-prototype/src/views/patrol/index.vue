<script setup lang="ts">
import PatrolStatsCards from '@/components/patrol/PatrolStatsCards.vue'
import PatrolTable from '@/components/patrol/PatrolTable.vue'
</script>

<template>
  <div class="patrol-page">
    <h1 class="page-title">巡查管理</h1>
    <PatrolStatsCards />
    <div class="table-section">
      <PatrolTable />
    </div>
  </div>
</template>

<style scoped>
.patrol-page {
  padding: 24px;
  background: #F8FAFC;
  min-height: 100vh;
}

.page-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
}

.table-section {
  margin-top: 24px;
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
