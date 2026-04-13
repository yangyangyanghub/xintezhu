/** 风险等级 */
export type RiskLevel = 1 | 2 | 3 // 1=低, 2=中, 3=高

/** 告警状态 */
export type AlertStatus = 'pending' | 'processing' | 'archived'

/** 证据状态 */
export type EvidenceStatus = 'collected' | 'reviewed' | 'stored' | 'exported'

/** 巡查状态 */
export type PatrolStatus = 'planned' | 'active' | 'completed' | 'cancelled'

/** 用户角色 */
export type UserRole = 'patrol' | 'monitor' | 'enforcement' | 'manager' | 'admin'

/** 用户状态 */
export type UserStatus = 'active' | 'inactive'

/** 证据类型 */
export type EvidenceType = 'image' | 'video' | 'report' | 'comparison'

/** 违法类型 */
export type ViolationType =
  | 'illegal_building'
  | 'illegal_excavation'
  | 'farmland_occupation'
  | 'temporary_structure'
  | 'material_piling'

/** GPS 坐标 */
export interface GeoLocation {
  lng: number // 经度，小数点后 6 位
  lat: number // 纬度，小数点后 6 位
  address: string
}

/** 告警记录 */
export interface AlertRecord {
  id: string
  violationType: ViolationType
  riskLevel: RiskLevel
  location: GeoLocation
  area: number // 面积（亩）
  status: AlertStatus
  createdAt: string
  updatedAt: string
  evidenceCount: number
  assignee?: string
  description: string
}

/** 证据条目 */
export interface EvidenceEntry {
  id: string
  alertId: string
  type: EvidenceType
  timestamp: string
  location: GeoLocation
  imageUrl: string
  description: string
  status: EvidenceStatus
  deviceInfo: string
}

/** 巡查计划 */
export interface PatrolPlan {
  id: string
  name: string
  area: string
  frequency: string
  assignee: string
  status: PatrolStatus
  progress: number // 0-100
  startDate: string
  endDate: string
  areaCovered: number // km²
}

/** 用户记录 */
export interface UserRecord {
  id: string
  name: string
  role: UserRole
  department: string
  phone: string
  status: UserStatus
}

/** 统计数据 */
export interface Statistics {
  totalAlerts: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  patrolCount: number
  evidenceCount: number
  coverageArea: number
}
