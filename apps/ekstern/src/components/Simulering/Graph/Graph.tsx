import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useRef } from 'react'
import { useIntl } from 'react-intl'

import type { SeriesConfig } from '../data/data'
import { generateSeries } from '../data/data'
import { labelFormatterDesktop } from '../utils-highcharts'

interface IProps {
  data: SeriesConfig[]
}

const Graph = ({ data }: IProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const intl = useIntl()

  const FONT_FAMILY = 'var(--a-font-family)'

  const { xAxis, series } = generateSeries(data)

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: xAxis,
    },
    yAxis: {
      offset: 10,
      minorTickInterval: 50000,
      tickInterval: 100000,
      allowDecimals: false,
      min: 0,
      stackLabels: {
        enabled: false,
      },
      title: {
        text: intl.formatMessage({ id: 'beregning.highcharts.yaxis' }),
        align: 'high',
        rotation: 0,
        textAlign: 'left',
        x: -44,
        y: -20,
        style: {
          fontFamily: FONT_FAMILY,
          fontSize: 'var(--a-font-size-medium)',
        },
      },
      labels: {
        useHTML: true,
        align: 'left',
        formatter: labelFormatterDesktop,
        style: {
          fontFamily: FONT_FAMILY,
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
    plotOptions: {
      column: {
        stacking: 'normal',
        pointWidth: 25,
      },
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
        fontFamily: FONT_FAMILY,
        color: 'var(--a-text-default)',
        fontWeight: 'normal',
        fontSize: '14px',
        cursor: 'default',
      },
      itemHoverStyle: { color: '#000000' },
      itemMarginBottom: 5,
      events: {
        itemClick: () => false,
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
