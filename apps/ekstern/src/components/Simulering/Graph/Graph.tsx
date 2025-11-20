import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import type { SeriesConfig } from '../data/data'
import { generateSeries } from '../data/data'
import { getChartOptions } from '../utils-highcharts'

import styles from '../Simulering.module.scss'

interface IProps {
  data: SeriesConfig[]
  onButtonVisibilityChange?: (state: {
    showVisFaerreAarButton: boolean
    showVisFlereAarButton: boolean
  }) => void
  onSeriesDataChange?: (
    xAxis: string[],
    series: Highcharts.SeriesOptionsType[]
  ) => void
}

const Graph = ({
  data,
  onButtonVisibilityChange,
  onSeriesDataChange,
}: IProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const intl = useIntl()
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] = useState(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] = useState(false)

  // Notify parent of button visibility changes
  React.useEffect(() => {
    onButtonVisibilityChange?.({
      showVisFaerreAarButton,
      showVisFlereAarButton,
    })
  }, [showVisFaerreAarButton, showVisFlereAarButton, onButtonVisibilityChange])

  const { xAxis, series } = useMemo(() => generateSeries(data), [data])

  // Notify parent of series data changes for TabellVisning
  React.useEffect(() => {
    onSeriesDataChange?.(xAxis, series)
  }, [xAxis, series, onSeriesDataChange])

  const chartOptions: Highcharts.Options = {
    ...getChartOptions(
      styles,
      setShowVisFlereAarButton,
      setShowVisFaerreAarButton,
      intl
    ),
    xAxis: {
      ...getChartOptions(
        styles,
        setShowVisFlereAarButton,
        setShowVisFaerreAarButton,
        intl
      ).xAxis,
      categories: xAxis,
    },
    series: series,
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
