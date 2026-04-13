<template>
  <ChartCard title="违法类型分布">
    <v-chart class="echarts-container" :option="chartOption" autoresize />
    <template #footer>
      本月共监测到 <strong>156</strong> 起违法事件，违法建设占比最高（35%）
    </template>
  </ChartCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const chartData = [
  { value: 55, name: '违法建设', itemStyle: { color: '#F53F3F' } },
  { value: 39, name: '违法挖掘', itemStyle: { color: '#FF7D00' } },
  { value: 31, name: '耕地占用', itemStyle: { color: '#00B42A' } },
  { value: 19, name: '临时违建', itemStyle: { color: '#165DFF' } },
  { value: 12, name: '堆放占用', itemStyle: { color: '#86909C' } },
]

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}起 ({d}%)',
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: {
      fontSize: 12,
      color: '#4E5969',
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 12,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 20,
      },
      data: chartData,
    },
  ],
}))
</script>

<style scoped>
.echarts-container {
  width: 100%;
  height: 320px;
}
</style>
