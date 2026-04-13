<template>
  <ChartCard title="违法趋势分析">
    <v-chart class="echarts-container" :option="chartOption" autoresize />
    <template #footer>
      近 12 个月违法趋势，高风险事件较上月下降 <strong>12%</strong>
    </template>
  </ChartCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const highRisk =    [12, 15, 10, 18, 14, 22, 19, 16, 21, 17, 13, 11]
const mediumRisk =  [25, 22, 28, 20, 24, 18, 26, 30, 22, 28, 25, 20]
const lowRisk =     [35, 30, 40, 32, 38, 42, 36, 34, 40, 36, 32, 38]

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
    },
  },
  legend: {
    top: 0,
    data: ['高风险', '中风险', '低风险'],
    textStyle: {
      fontSize: 12,
      color: '#4E5969',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: months,
    boundaryGap: false,
    axisLine: {
      lineStyle: {
        color: '#E5E6EB',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#86909C',
      fontSize: 12,
    },
  },
  yAxis: {
    type: 'value',
    name: '告警数量',
    nameTextStyle: {
      color: '#86909C',
      fontSize: 12,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: '#F0F0F0',
      },
    },
    axisLabel: {
      color: '#86909C',
      fontSize: 12,
    },
  },
  series: [
    {
      name: '高风险',
      type: 'line',
      data: highRisk,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: '#F53F3F',
      },
      itemStyle: {
        color: '#F53F3F',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 63, 63, 0.25)' },
            { offset: 1, color: 'rgba(245, 63, 63, 0.02)' },
          ],
        },
      },
    },
    {
      name: '中风险',
      type: 'line',
      data: mediumRisk,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: '#FF7D00',
      },
      itemStyle: {
        color: '#FF7D00',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 125, 0, 0.2)' },
            { offset: 1, color: 'rgba(255, 125, 0, 0.02)' },
          ],
        },
      },
    },
    {
      name: '低风险',
      type: 'line',
      data: lowRisk,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: '#00B42A',
      },
      itemStyle: {
        color: '#00B42A',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 180, 42, 0.18)' },
            { offset: 1, color: 'rgba(0, 180, 42, 0.02)' },
          ],
        },
      },
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
