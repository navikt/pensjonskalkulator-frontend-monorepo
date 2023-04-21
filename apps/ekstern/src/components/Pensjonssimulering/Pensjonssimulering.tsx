import { useEffect, useRef, useState } from 'react'

import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { generateXAxis } from '../TidligstMuligeUttak/utils'

import {
  PENSJONSGIVENDE_DATA,
  AFP_DATA,
  FOLKETRYGDEN_DATA,
  TJENESTEPENSJON_DATA,
  simulateDataArray,
  labelFormatter,
  tooltipFormatter,
} from './utils'

type PensjonssimuleringProps = {
  uttaksalder: number
}

export function Pensjonssimulering(props: PensjonssimuleringProps) {
  const { uttaksalder } = props

  const chartRef = useRef<HighchartsReact.RefObject>(null)

  const [aarXAxis, setAarXAxis] = useState<string[]>([])
  const [seriesYAxis, setSeriesYAxis] = useState<
    Highcharts.SeriesOptionsType[]
  >([])

  const options: Highcharts.Options = {
    title: {
      text: `Årlig pensjon hvis du starter uttak ved ${uttaksalder} år`,
      align: 'left',
      margin: 40,
    },
    xAxis: {
      categories: aarXAxis,
    },
    yAxis: {
      gridLineDashStyle: 'Dash',
      minorTickInterval: 200000,
      allowDecimals: false,
      min: 0,
      title: {
        text: 'Tusen kroner',
        align: 'high',
        offset: -55,
        rotation: 0,
        x: -15,
        y: -20,
      },
      labels: {
        formatter: labelFormatter,
      },
    },
    tooltip: {
      formatter: tooltipFormatter,
    },
    plotOptions: {
      column: {
        stacking: 'normal',
      },
    },
    series: seriesYAxis,
  }

  useEffect(() => {
    const aarArray = generateXAxis(uttaksalder, 77)
    setAarXAxis(aarArray)
    setSeriesYAxis([
      {
        type: 'column',
        name: 'Pensjonsgivende inntekt',
        color: '#868F9C',
        data: simulateDataArray(PENSJONSGIVENDE_DATA, aarArray.length - 1),
      },
      {
        type: 'column',
        name: 'Avtalefestet pensjon (AFP)',
        color: 'var(--a-purple-400)',
        data: simulateDataArray(AFP_DATA, aarArray.length - 1),
      },
      {
        type: 'column',
        name: 'Tjenestepensjon',
        color: 'var(--a-green-400)',
        data: simulateDataArray(TJENESTEPENSJON_DATA, aarArray.length - 1),
      },
      {
        type: 'column',
        name: 'Folketrygden (NAV)',
        color: 'var(--a-deepblue-500)',
        data: simulateDataArray(FOLKETRYGDEN_DATA, aarArray.length - 1),
      },
    ])
  }, [uttaksalder])

  return (
    <>
      {uttaksalder && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartRef}
        />
      )}
    </>
  )
}
