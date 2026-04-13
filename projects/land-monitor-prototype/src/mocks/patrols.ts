import type { PatrolPlan } from '../types'

/**
 * 巡查计划 Mock 数据 — 10 条
 * 状态分布: planned 2、active 3、completed 4、cancelled 1
 */
export const patrols: PatrolPlan[] = [
  {
    id: 'PTL-001',
    name: '昌平区日常巡查',
    area: '昌平区回龙观镇',
    frequency: '每日',
    assignee: 'USR-001',
    status: 'active',
    progress: 65,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    areaCovered: 15.5
  },
  {
    id: 'PTL-002',
    name: '通州区耕地保护巡查',
    area: '通州区梨园镇',
    frequency: '每日',
    assignee: 'USR-002',
    status: 'active',
    progress: 45,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    areaCovered: 22.0
  },
  {
    id: 'PTL-003',
    name: '顺义区基本农田巡查',
    area: '顺义区后沙峪镇',
    frequency: '每周',
    assignee: 'USR-003',
    status: 'completed',
    progress: 100,
    startDate: '2026-02-15',
    endDate: '2026-03-15',
    areaCovered: 35.0
  },
  {
    id: 'PTL-004',
    name: '大兴区违建专项巡查',
    area: '大兴区黄村镇',
    frequency: '每周',
    assignee: 'USR-004',
    status: 'completed',
    progress: 100,
    startDate: '2026-02-20',
    endDate: '2026-03-20',
    areaCovered: 28.0
  },
  {
    id: 'PTL-005',
    name: '朝阳区崔各庄巡查',
    area: '朝阳区崔各庄乡',
    frequency: '每日',
    assignee: 'USR-001',
    status: 'active',
    progress: 30,
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    areaCovered: 12.0
  },
  {
    id: 'PTL-006',
    name: '怀柔区景区周边巡查',
    area: '怀柔区雁栖镇',
    frequency: '每月',
    assignee: 'USR-005',
    status: 'planned',
    progress: 0,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    areaCovered: 50.0
  },
  {
    id: 'PTL-007',
    name: '房山区良乡镇巡查',
    area: '房山区良乡镇',
    frequency: '每周',
    assignee: 'USR-005',
    status: 'completed',
    progress: 100,
    startDate: '2026-02-01',
    endDate: '2026-03-01',
    areaCovered: 18.0
  },
  {
    id: 'PTL-008',
    name: '门头沟区潭柘寺巡查',
    area: '门头沟区潭柘寺镇',
    frequency: '每月',
    assignee: 'USR-006',
    status: 'cancelled',
    progress: 15,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    areaCovered: 45.0
  },
  {
    id: 'PTL-009',
    name: '平谷区山东庄巡查',
    area: '平谷区山东庄镇',
    frequency: '每周',
    assignee: 'USR-006',
    status: 'completed',
    progress: 100,
    startDate: '2026-02-10',
    endDate: '2026-03-10',
    areaCovered: 20.0
  },
  {
    id: 'PTL-010',
    name: '延庆区康庄镇巡查',
    area: '延庆区康庄镇',
    frequency: '每月',
    assignee: 'USR-007',
    status: 'planned',
    progress: 0,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    areaCovered: 40.0
  }
] as const
