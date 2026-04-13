import type { EvidenceEntry } from '../types'

/**
 * 证据条目 Mock 数据 — 15 条
 * 类型分布: image 6、video 4、report 3、comparison 2
 * 状态分布: collected 4、reviewed 5、stored 4、exported 2
 * 关联 alertId: ALT-001 至 ALT-005
 */

// Helper to preserve literal types while narrowing correctly
function createEvidence(entries: EvidenceEntry[]): EvidenceEntry[] {
  return entries
}

const _rawEvidence = createEvidence([
  {
    id: 'EVD-001',
    alertId: 'ALT-001',
    type: 'image',
    timestamp: '2026-03-21T08:30:00Z',
    location: { lng: 116.402318, lat: 40.056789, address: '昌平区回龙观镇东大街' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+001',
    description: '航拍现场照片，清晰可见正在建设中的主体结构',
    status: 'reviewed',
    deviceInfo: 'DJI M300 RTK, FC: 24mm'
  },
  {
    id: 'EVD-002',
    alertId: 'ALT-001',
    type: 'video',
    timestamp: '2026-03-20T14:15:00Z',
    location: { lng: 116.402500, lat: 40.056900, address: '昌平区回龙观镇东大街南侧' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+002',
    description: '施工过程录像，时长 3 分钟',
    status: 'collected',
    deviceInfo: '大疆 Action 4, 4K 60fps'
  },
  {
    id: 'EVD-003',
    alertId: 'ALT-002',
    type: 'image',
    timestamp: '2026-03-20T10:00:00Z',
    location: { lng: 116.523456, lat: 39.987654, address: '通州区梨园镇北街' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+003',
    description: '挖掘区域全景照片，挖深约 3 米',
    status: 'reviewed',
    deviceInfo: 'DJI M300 RTK, FC: 16mm'
  },
  {
    id: 'EVD-004',
    alertId: 'ALT-002',
    type: 'report',
    timestamp: '2026-03-19T16:00:00Z',
    location: { lng: 116.523456, lat: 39.987654, address: '通州区梨园镇北街' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+004',
    description: '现场勘验报告 PDF',
    status: 'stored',
    deviceInfo: '纸质文件扫描件'
  },
  {
    id: 'EVD-005',
    alertId: 'ALT-003',
    type: 'comparison',
    timestamp: '2026-03-21T09:00:00Z',
    location: { lng: 116.234567, lat: 40.234567, address: '顺义区后沙峪镇西路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+005',
    description: '2025 年与 2026 年同区域卫星对比图',
    status: 'reviewed',
    deviceInfo: '高分七号卫星影像对比'
  },
  {
    id: 'EVD-006',
    alertId: 'ALT-003',
    type: 'image',
    timestamp: '2026-03-20T11:30:00Z',
    location: { lng: 116.234800, lat: 40.234700, address: '顺义区后沙峪镇西路 100 号' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+006',
    description: '仓库建筑正面照',
    status: 'collected',
    deviceInfo: 'DJI M300 RTK, FC: 24mm'
  },
  {
    id: 'EVD-007',
    alertId: 'ALT-004',
    type: 'image',
    timestamp: '2026-03-19T17:00:00Z',
    location: { lng: 116.678901, lat: 39.789012, address: '大兴区黄村镇南环路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+007',
    description: '彩钢棚侧面近景',
    status: 'reviewed',
    deviceInfo: '手机拍摄, iPhone 15 Pro'
  },
  {
    id: 'EVD-008',
    alertId: 'ALT-004',
    type: 'video',
    timestamp: '2026-03-19T17:10:00Z',
    location: { lng: 116.678901, lat: 39.789012, address: '大兴区黄村镇南环路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+008',
    description: '彩钢棚全景环绕视频',
    status: 'stored',
    deviceInfo: '大疆 Action 4, 4K 30fps'
  },
  {
    id: 'EVD-009',
    alertId: 'ALT-005',
    type: 'image',
    timestamp: '2026-03-21T07:30:00Z',
    location: { lng: 116.345678, lat: 40.123456, address: '朝阳区崔各庄乡东侧' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+009',
    description: '建筑材料堆放俯拍图',
    status: 'collected',
    deviceInfo: 'DJI Mini 3 Pro, FC: 6.7mm'
  },
  {
    id: 'EVD-010',
    alertId: 'ALT-005',
    type: 'report',
    timestamp: '2026-03-20T14:00:00Z',
    location: { lng: 116.345678, lat: 40.123456, address: '朝阳区崔各庄乡东侧' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+010',
    description: '违法材料清单及数量统计',
    status: 'reviewed',
    deviceInfo: '电子文档导出'
  },
  {
    id: 'EVD-011',
    alertId: 'ALT-001',
    type: 'report',
    timestamp: '2026-03-19T09:00:00Z',
    location: { lng: 116.402318, lat: 40.056789, address: '昌平区回龙观镇东大街' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+011',
    description: '土地权属调查报告',
    status: 'exported',
    deviceInfo: '系统自动生成'
  },
  {
    id: 'EVD-012',
    alertId: 'ALT-003',
    type: 'video',
    timestamp: '2026-03-18T15:00:00Z',
    location: { lng: 116.234567, lat: 40.234567, address: '顺义区后沙峪镇西路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+012',
    description: '仓库内部存放物品录像',
    status: 'stored',
    deviceInfo: '手持摄像, Sony A7 IV'
  },
  {
    id: 'EVD-013',
    alertId: 'ALT-002',
    type: 'comparison',
    timestamp: '2026-03-20T08:00:00Z',
    location: { lng: 116.523456, lat: 39.987654, address: '通州区梨园镇北街' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+013',
    description: '违法前后地貌对比图',
    status: 'exported',
    deviceInfo: '无人机正射影像拼接'
  },
  {
    id: 'EVD-014',
    alertId: 'ALT-005',
    type: 'image',
    timestamp: '2026-03-20T16:00:00Z',
    location: { lng: 116.346000, lat: 40.123800, address: '朝阳区崔各庄乡东侧辅路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+014',
    description: '运输车辆现场照片',
    status: 'stored',
    deviceInfo: '手机拍摄, Huawei Mate 60 Pro'
  },
  {
    id: 'EVD-015',
    alertId: 'ALT-003',
    type: 'video',
    timestamp: '2026-03-19T10:30:00Z',
    location: { lng: 116.234567, lat: 40.234567, address: '顺义区后沙峪镇西路' },
    imageUrl: 'https://via.placeholder.com/800x600?text=Evidence+015',
    description: '执法过程全程记录',
    status: 'collected',
    deviceInfo: '执法记录仪, 海康威视 DS-MV23'
  }
])

// 时间倒序排列（最新在前）
export const evidence = _rawEvidence.slice().sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
)
