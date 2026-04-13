import type { Statistics } from '../types'

/**
 * 统计数据 Mock
 * 与 alerts/patrols/evidence 数据保持一致
 */
export const statistics: Statistics = {
  totalAlerts: 20,
  highRisk: 6,
  mediumRisk: 8,
  lowRisk: 6,
  patrolCount: 10,
  evidenceCount: 15,
  coverageArea: 285.5
} as const
