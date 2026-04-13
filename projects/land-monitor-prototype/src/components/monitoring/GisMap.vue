<template>
  <div class="gis-map" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { alerts } from '@/mocks'
import type { AlertRecord, RiskLevel } from '@/types'

const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null

/* 自定义标记图标 - 根据风险等级着色 */
function createIcon(riskLevel: RiskLevel): L.DivIcon {
  const colors: Record<RiskLevel, string> = { 3: '#F53F3F', 2: '#FF7D00', 1: '#00B42A' }
  const color = colors[riskLevel]
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

onMounted(() => {
  if (!mapContainer.value) return
  // 以北京为中心
  map = L.map(mapContainer.value).setView([39.9042, 116.4074], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map)

  // 添加高/中风险告警标记
  alerts
    .filter((a: AlertRecord) => a.riskLevel >= 2)
    .forEach((alert: AlertRecord) => {
      const marker = L.marker([alert.location.lat, alert.location.lng], {
        icon: createIcon(alert.riskLevel),
      }).addTo(map!)

      const labels: Record<number, string> = { 3: '高', 2: '中', 1: '低' }
      const violationLabels: Record<string, string> = {
        illegal_building: '违法建设',
        illegal_excavation: '违法挖掘',
        farmland_occupation: '占用耕地',
        temporary_structure: '临时建筑',
        material_piling: '材料堆放',
      }
      marker.bindPopup(`
        <strong>${alert.id}</strong><br/>
        类型: ${violationLabels[alert.violationType] || alert.violationType}<br/>
        风险: ${labels[alert.riskLevel]}<br/>
        面积: ${alert.area}亩
      `)
    })
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.gis-map {
  width: 100%;
  height: 100%;
  min-height: 500px;
  z-index: 1;
}
</style>
