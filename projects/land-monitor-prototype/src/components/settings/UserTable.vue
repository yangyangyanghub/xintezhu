<template>
  <div class="user-table-container">
    <el-table :data="users" stripe style="width: 100%">
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="name" label="姓名" width="90" />
      <el-table-column label="角色" width="140">
        <template #default="{ row }">
          <el-tag :type="getRoleTagColor(row.role)" size="small">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100">
        <template #default>
          <el-button type="primary" link size="small" disabled>编辑</el-button>
          <el-button type="danger" link size="small" disabled>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { users } from '@/mocks'
import type { UserRole } from '@/types'

const ROLE_LABEL_MAP: Record<UserRole, string> = {
  patrol: '巡查人员',
  monitor: '监测中心人员',
  enforcement: '执法人员',
  manager: '管理人员',
  admin: '系统管理员'
}

const ROLE_COLOR_MAP: Record<UserRole, 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined> = {
  patrol: undefined,            // 默认蓝
  monitor: 'success',    // 绿
  enforcement: 'warning', // 橙
  manager: 'info',       // 灰
  admin: 'danger'        // 红
}

function getRoleLabel(role: UserRole): string {
  return ROLE_LABEL_MAP[role]
}

function getRoleTagColor(role: UserRole): 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined {
  return ROLE_COLOR_MAP[role]
}
</script>

<style scoped>
.user-table-container {
  padding: 16px 0;
}
</style>
