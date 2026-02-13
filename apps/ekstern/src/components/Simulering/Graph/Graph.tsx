import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import type { SeriesConfig } from '../data/data'
import { generateSeries } from '../data/data'
import { getChartOptions, onPointUnclick } from '../utils-highcharts'

import styles from '../Simulering.module.scss'

interface IProps {
  data: SeriesConfig[]
  isLoading?: boolean
  isPensjonsavtalerLoading?: boolean
  isOffentligTpLoading?: boolean
  skalBeregneAfpKap19?: boolean
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
  isLoading = false,
  isPensjonsavtalerLoading = false,
  isOffentligTpLoading = false,
  skalBeregneAfpKap19 = false,
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

  // Handle click outside tooltip to close it
  useEffect(() => {
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () => {
      document.removeEventListener('click', onPointUnclickEventHandler)
    }
  }, [])

  const chartOptions: Highcharts.Options = {
    ...getChartOptions(
      styles,
      setShowVisFlereAarButton,
      setShowVisFaerreAarButton,
      intl,
      skalBeregneAfpKap19
    ),
    xAxis: {
      ...getChartOptions(
        styles,
        setShowVisFlereAarButton,
        setShowVisFaerreAarButton,
        intl,
        skalBeregneAfpKap19
      ).xAxis,
      categories: xAxis,
    },
    series: series,
  }

  // Handle loading state
  useEffect(() => {
    if (chartRef.current?.chart) {
      if (isLoading || isPensjonsavtalerLoading || isOffentligTpLoading) {
        chartRef.current.chart.showLoading(
          `<div class="${styles.loader}"><div></div><div></div><div></div><div></div></div>`
        )
      } else {
        chartRef.current.chart.hideLoading()
      }
    }
  }, [isLoading, isPensjonsavtalerLoading, isOffentligTpLoading])

  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
    />
  )
}

export default Graph
