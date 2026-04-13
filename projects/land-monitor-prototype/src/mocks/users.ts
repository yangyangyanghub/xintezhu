import type { UserRecord } from '../types'

/**
 * 用户 Mock 数据 — 8 个
 * 角色分布: patrol 2、monitor 2、enforcement 2、manager 1、admin 1
 */
export const users: UserRecord[] = [
  {
    id: 'USR-001',
    name: '张伟',
    role: 'patrol',
    department: '巡查一队',
    phone: '138-1234-5678',
    status: 'active'
  },
  {
    id: 'USR-002',
    name: '李娜',
    role: 'patrol',
    department: '巡查一队',
    phone: '138-2345-6789',
    status: 'active'
  },
  {
    id: 'USR-003',
    name: '王磊',
    role: 'monitor',
    department: '监测中心',
    phone: '138-3456-7890',
    status: 'active'
  },
  {
    id: 'USR-004',
    name: '刘芳',
    role: 'monitor',
    department: '监测中心',
    phone: '138-4567-8901',
    status: 'active'
  },
  {
    id: 'USR-005',
    name: '陈明',
    role: 'enforcement',
    department: '执法大队',
    phone: '138-5678-9012',
    status: 'active'
  },
  {
    id: 'USR-006',
    name: '赵强',
    role: 'enforcement',
    department: '执法大队',
    phone: '138-6789-0123',
    status: 'inactive'
  },
  {
    id: 'USR-007',
    name: '孙丽',
    role: 'manager',
    department: '管理部门',
    phone: '138-7890-1234',
    status: 'active'
  },
  {
    id: 'USR-008',
    name: '周洋',
    role: 'admin',
    department: '系统管理',
    phone: '138-8901-2345',
    status: 'active'
  }
] as const
