import type { AlertRecord } from '../types'

/**
 * 告警记录 Mock 数据 — 20 条
 * 风险分布: 高(3) 6 条、中(2) 8 条、低(1) 6 条
 * 状态分布: pending 8 条、processing 7 条、archived 5 条
 * 违法类型: 5 种全覆盖
 */
export const alerts: AlertRecord[] = [
  {
    id: 'ALT-001',
    violationType: 'illegal_building',
    riskLevel: 3,
    location: { lng: 116.402318, lat: 40.056789, address: '昌平区回龙观镇东大街' },
    area: 2.5,
    status: 'pending',
    createdAt: '2026-03-20T08:30:00Z',
    updatedAt: '2026-03-20T08:30:00Z',
    evidenceCount: 4,
    assignee: 'USR-001',
    description: '发现未批先建违法建筑，占地约 2.5 亩，正在施工'
  },
  {
    id: 'ALT-002',
    violationType: 'illegal_excavation',
    riskLevel: 3,
    location: { lng: 116.523456, lat: 39.987654, address: '通州区梨园镇北街' },
    area: 3.8,
    status: 'pending',
    createdAt: '2026-03-19T14:15:00Z',
    updatedAt: '2026-03-19T14:15:00Z',
    evidenceCount: 3,
    assignee: 'USR-002',
    description: '非法取土挖掘，面积约 3.8 亩，造成耕地破坏'
  },
  {
    id: 'ALT-003',
    violationType: 'farmland_occupation',
    riskLevel: 3,
    location: { lng: 116.234567, lat: 40.234567, address: '顺义区后沙峪镇西路' },
    area: 5.0,
    status: 'processing',
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-21T10:30:00Z',
    evidenceCount: 5,
    assignee: 'USR-003',
    description: '基本农田被占用建仓库面积 5 亩'
  },
  {
    id: 'ALT-004',
    violationType: 'temporary_structure',
    riskLevel: 2,
    location: { lng: 116.678901, lat: 39.789012, address: '大兴区黄村镇南环路' },
    area: 1.2,
    status: 'pending',
    createdAt: '2026-03-19T16:45:00Z',
    updatedAt: '2026-03-19T16:45:00Z',
    evidenceCount: 2,
    description: '临时搭建彩钢棚，未办理审批手续'
  },
  {
    id: 'ALT-005',
    violationType: 'material_piling',
    riskLevel: 3,
    location: { lng: 116.345678, lat: 40.123456, address: '朝阳区崔各庄乡东侧' },
    area: 1.8,
    status: 'pending',
    createdAt: '2026-03-20T11:20:00Z',
    updatedAt: '2026-03-20T11:20:00Z',
    evidenceCount: 3,
    assignee: 'USR-001',
    description: '大量建筑材料堆放于农用地红线内'
  },
  {
    id: 'ALT-006',
    violationType: 'illegal_building',
    riskLevel: 2,
    location: { lng: 116.456789, lat: 39.890123, address: '丰台区王佐镇长辛店' },
    area: 0.8,
    status: 'processing',
    createdAt: '2026-03-17T13:00:00Z',
    updatedAt: '2026-03-20T09:15:00Z',
    evidenceCount: 2,
    assignee: 'USR-004',
    description: '村民私自翻建房屋，超出审批面积'
  },
  {
    id: 'ALT-007',
    violationType: 'illegal_excavation',
    riskLevel: 1,
    location: { lng: 116.567890, lat: 40.345678, address: '密云区十里堡镇' },
    area: 0.5,
    status: 'archived',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-18T16:00:00Z',
    evidenceCount: 1,
    description: '小规模取土行为，已责令恢复'
  },
  {
    id: 'ALT-008',
    violationType: 'farmland_occupation',
    riskLevel: 2,
    location: { lng: 116.189012, lat: 39.678901, address: '房山区良乡镇西潞园' },
    area: 2.0,
    status: 'pending',
    createdAt: '2026-03-20T07:30:00Z',
    updatedAt: '2026-03-20T07:30:00Z',
    evidenceCount: 2,
    assignee: 'USR-005',
    description: '耕地被堆放建筑垃圾，影响耕种'
  },
  {
    id: 'ALT-009',
    violationType: 'temporary_structure',
    riskLevel: 3,
    location: { lng: 116.723456, lat: 40.456789, address: '怀柔区雁栖镇湖光路' },
    area: 4.2,
    status: 'pending',
    createdAt: '2026-03-21T08:00:00Z',
    updatedAt: '2026-03-21T08:00:00Z',
    evidenceCount: 3,
    assignee: 'USR-002',
    description: '景区违规搭建临时营业用房'
  },
  {
    id: 'ALT-010',
    violationType: 'material_piling',
    riskLevel: 2,
    location: { lng: 116.834567, lat: 39.567890, address: '平谷区山东庄镇' },
    area: 1.5,
    status: 'processing',
    createdAt: '2026-03-16T15:30:00Z',
    updatedAt: '2026-03-19T11:00:00Z',
    evidenceCount: 2,
    description: '砂石料堆放在一般耕地上'
  },
  {
    id: 'ALT-011',
    violationType: 'illegal_building',
    riskLevel: 1,
    location: { lng: 116.123456, lat: 39.789123, address: '门头沟区潭柘寺镇' },
    area: 0.3,
    status: 'archived',
    createdAt: '2026-03-12T09:00:00Z',
    updatedAt: '2026-03-16T14:00:00Z',
    evidenceCount: 1,
    description: '农家院扩建围墙，面积较小已整改'
  },
  {
    id: 'ALT-012',
    violationType: 'illegal_excavation',
    riskLevel: 2,
    location: { lng: 116.267890, lat: 40.012345, address: '海淀区苏家坨镇' },
    area: 2.2,
    status: 'pending',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    evidenceCount: 3,
    description: '果园附近非法挖沙取土'
  },
  {
    id: 'ALT-013',
    violationType: 'farmland_occupation',
    riskLevel: 1,
    location: { lng: 116.398765, lat: 40.156789, address: '昌平区小汤山镇' },
    area: 0.6,
    status: 'processing',
    createdAt: '2026-03-18T14:20:00Z',
    updatedAt: '2026-03-21T09:00:00Z',
    evidenceCount: 2,
    description: '苗圃占用农用地，面积 0.6 亩'
  },
  {
    id: 'ALT-014',
    violationType: 'temporary_structure',
    riskLevel: 2,
    location: { lng: 116.478901, lat: 39.923456, address: '朝阳区金盏乡' },
    area: 1.0,
    status: 'processing',
    createdAt: '2026-03-17T11:30:00Z',
    updatedAt: '2026-03-20T15:00:00Z',
    evidenceCount: 2,
    description: '临时搭建工人居住房'
  },
  {
    id: 'ALT-015',
    violationType: 'material_piling',
    riskLevel: 3,
    location: { lng: 116.654321, lat: 40.289012, address: '顺义区赵全营镇' },
    area: 3.5,
    status: 'processing',
    createdAt: '2026-03-14T16:00:00Z',
    updatedAt: '2026-03-19T17:00:00Z',
    evidenceCount: 4,
    assignee: 'USR-003',
    description: '大量渣土堆放于永久基本农田'
  },
  {
    id: 'ALT-016',
    violationType: 'illegal_building',
    riskLevel: 1,
    location: { lng: 116.765432, lat: 39.612345, address: '大兴区庞各庄镇' },
    area: 0.4,
    status: 'archived',
    createdAt: '2026-03-13T08:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z',
    evidenceCount: 1,
    description: '瓜棚扩建已补办手续'
  },
  {
    id: 'ALT-017',
    violationType: 'illegal_excavation',
    riskLevel: 2,
    location: { lng: 116.112345, lat: 40.378901, address: '延庆区康庄镇' },
    area: 1.8,
    status: 'archived',
    createdAt: '2026-03-11T09:30:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
    evidenceCount: 2,
    description: '道路施工超范围取土，已处罚结案'
  },
  {
    id: 'ALT-018',
    violationType: 'farmland_occupation',
    riskLevel: 2,
    location: { lng: 116.543210, lat: 39.834567, address: '大兴区西红门镇' },
    area: 1.5,
    status: 'processing',
    createdAt: '2026-03-19T08:30:00Z',
    updatedAt: '2026-03-21T11:00:00Z',
    evidenceCount: 3,
    description: '物流分拣中心占用耕地'
  },
  {
    id: 'ALT-019',
    violationType: 'temporary_structure',
    riskLevel: 1,
    location: { lng: 116.876543, lat: 40.490123, address: '怀柔区渤海镇' },
    area: 0.2,
    status: 'archived',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-14T09:00:00Z',
    evidenceCount: 1,
    description: '临时工具棚已自行拆除'
  },
  {
    id: 'ALT-020',
    violationType: 'material_piling',
    riskLevel: 1,
    location: { lng: 116.321098, lat: 39.543210, address: '房山区青龙湖镇' },
    area: 0.7,
    status: 'processing',
    createdAt: '2026-03-16T10:30:00Z',
    updatedAt: '2026-03-20T14:00:00Z',
    evidenceCount: 2,
    description: '农用物资临时堆放于村道旁耕地'
  }
] as const
