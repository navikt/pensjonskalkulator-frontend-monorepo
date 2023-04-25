import { useEffect, useRef, useState } from 'react'

import { ChevronRightCircle } from '@navikt/ds-icons'
import { Button } from '@navikt/ds-react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

/* eslint-disable @typescript-eslint/ban-ts-comment, import/order */
/* @ts-ignore */
import HC_rounded from '../../utils/highcharts-rounded-corners'

import { generateXAxis } from '../TidligstMuligeUttak/utils'
import styles from './Pensjonssimulering.module.scss'

import {
  PENSJONSGIVENDE_DATA,
  AFP_DATA,
  FOLKETRYGDEN_DATA,
  TJENESTEPENSJON_DATA,
  simulateDataArray,
  labelFormatter,
  tooltipFormatter,
  onVisFlereAarClick,
} from './utils'

HC_rounded(Highcharts)
type PensjonssimuleringProps = {
  uttaksalder: number
}

export function Pensjonssimulering({ uttaksalder }: PensjonssimuleringProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null)

  const [aarXAxis, setAarXAxis] = useState<string[]>([])
  const [seriesYAxis, setSeriesYAxis] = useState<
    Highcharts.SeriesOptionsType[]
  >([])

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 25,
      scrollablePlotArea: {
        minWidth: 700,
        scrollPositionX: 0,
      },
    },
    title: {
      text: `Årlig pensjon det første året`,
      align: 'left',
      margin: 40,
      y: 20,
      style: {
        fontFamily: 'var(--a-font-family)',
        fontWeight: 'bold',
        fontSize: '20px',
      },
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
        x: -12,
        y: -20,
      },
      labels: {
        formatter: labelFormatter,
      },
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      formatter: tooltipFormatter,
    },
    legend: {
      x: 0,
      y: -25,
      padding: 0,
      margin: 50,
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'top',
      itemDistance: 0,
      itemStyle: {
        fontFamily: 'var(--a-font-family)',
        fontWeight: 'regular',
        fontSize: '14px',
      },
      itemMarginBottom: 5,
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
        pointWidth: 25,
        name: 'Pensjonsgivende inntekt',
        color: '#868F9C',
        // TODO sørge for at border-radius alltid settes på den øverste kolonnen
        borderRadiusTopLeft: '15%',
        borderRadiusTopRight: '15%',
        data: simulateDataArray(PENSJONSGIVENDE_DATA, aarArray.length - 1),
      } as unknown as Highcharts.SeriesOptionsType,
      {
        type: 'column',
        pointWidth: 25,
        name: 'Avtalefestet pensjon (AFP)',
        color: 'var(--a-purple-400)',
        data: simulateDataArray(AFP_DATA, aarArray.length - 1),
      },
      {
        type: 'column',
        pointWidth: 25,
        name: 'Tjenestepensjon',
        color: 'var(--a-green-400)',
        data: simulateDataArray(TJENESTEPENSJON_DATA, aarArray.length - 1),
      },
      {
        type: 'column',
        pointWidth: 25,
        name: 'Folketrygden (NAV)',
        color: 'var(--a-deepblue-500)',
        data: simulateDataArray(FOLKETRYGDEN_DATA, aarArray.length - 1),
      },
    ])
  }, [uttaksalder])

  return (
    <>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
      <Button
        className={styles.visFlereAar}
        icon={<ChevronRightCircle aria-hidden />}
        iconPosition="right"
        size={'xsmall'}
        variant="tertiary"
        onClick={onVisFlereAarClick}
      >
        Vis flere år
      </Button>
    </>
  )
}
