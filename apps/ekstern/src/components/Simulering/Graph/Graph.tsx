import Highcharts, { ChartOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useRef } from 'react'
import { useIntl } from 'react-intl'

import { SeriesConfig, generateSeries } from '../data/data'
import { labelFormatterDesktop } from '../utils-highcharts'

interface IProps {
  data: SeriesConfig[]
}

const Graph = ({ data }: IProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const intl = useIntl()

  const { xAxis, series } = generateSeries(data)

  console.log('xAxis', xAxis)
  console.log('series', series)

  const chartOptions = {
    title: {
      text: null,
    },
    type: 'column',
    xAxis: {
      categories: xAxis,
    },
    yAxis: {
      offset: 10,
      minorTickInterval: 50000,
      tickInterval: 100000,
      allowDecimals: false,
      min: 0,
      title: {
        text: intl.formatMessage({ id: 'beregning.highcharts.yaxis' }),
        align: 'high',
        rotation: 0,
        textAlign: 'left',
        x: -44,
        y: -20,
        style: {
          fontFamily: 'var(--a-font-family)',
          fontSize: 'var(--a-font-size-medium)',
          zIndex: 0,
        },
      },
      labels: {
        useHTML: true,
        align: 'left',
        formatter: labelFormatterDesktop,
        style: {
          fontFamily: 'var(--a-font-family)',
          fontSize: 'var(--a-font-size-medium)',
          color: 'var(--a-text-subtle)',
          paddingRight: 'var(--a-spacing-3)',
        },
        x: -55,
      },
      gridLineColor: 'var(--a-gray-400)',
      gridLineWidth: 1,
      minorGridLineWidth: 0,
    },
    legend: {
      accessibility: {
        enabled: true,
        keyboardNavigation: { enabled: false },
      },
      useHTML: true,
      x: 0,
      y: -25,
      padding: 0,
      margin: 0,
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'bottom',
      itemDistance: 24,
      itemStyle: {
        fontFamily: 'var(--a-font-family)',
        color: 'var(--a-text-default)',
        fontWeight: 'regular',
        fontSize: '14px',
        cursor: 'default',
        zIndex: 0,
      },
      itemHoverStyle: { color: '#000000' },
      itemMarginBottom: 5,
      events: {
        itemClick: function () {
          return false
        },
      },
    },
    series: series,
    credits: {
      enabled: false,
    },
  }

  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
    />
  )
}

export default Graph
