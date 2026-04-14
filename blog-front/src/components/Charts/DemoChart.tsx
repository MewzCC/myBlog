import ReactECharts from 'echarts-for-react'

export default function DemoChart() {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.5)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.5)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' },
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#7c5cff' },
              { offset: 1, color: '#ff5ca8' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
}
