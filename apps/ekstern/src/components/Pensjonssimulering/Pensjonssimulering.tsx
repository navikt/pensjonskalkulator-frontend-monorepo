import { useEffect, useRef, useState } from 'react'

import { ChevronRightCircle } from '@navikt/ds-icons'
import { Button } from '@navikt/ds-react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

/* eslint-disable @typescript-eslint/ban-ts-comment, import/order */
/* @ts-ignore */
import HC_rounded from '../../utils/highcharts-rounded-corners'

import {
  AFP_DATA,
  FOLKETRYGDEN_DATA,
  generateXAxis,
  labelFormatter,
  onVisFlereAarClick,
  PENSJONSGIVENDE_DATA,
  simulateDataArray,
  simulateTjenestepensjon,
} from './utils'
import styles from './Pensjonssimulering.module.scss'

HC_rounded(Highcharts)

const MAX_UTTAKSALDER = 78
const COLUMN_WIDTH = 25

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
        minWidth: aarXAxis.length * COLUMN_WIDTH * 1.6,
        scrollPositionX: 0,
      },
    },
    title: {
      text: `Årlig pensjon`,
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
      tickInterval: 200000,
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
      useHTML: true,
      className: styles.tooltip,
      headerFormat:
        `<table class="${styles.tooltipTable}">` +
        `<thead><tr>` +
        `<th class="${styles.tooltipTableHeaderCell} ${styles.tooltipTableHeaderCell__left}">Utbetaling det året du er {point.key} år</th>` +
        `<th class="${styles.tooltipTableHeaderCell} ${styles.tooltipTableHeaderCell__right}">{point.total} kr</th>` +
        `</tr></thead>`,
      pointFormat:
        `<tbody><tr><td class="${styles.tooltipTableCell}"><span class="${styles.tooltipTableCellDot}" style="backgroundColor: {series.color}"></span>{series.name} </td>` +
        `<td  class="${styles.tooltipTableCell} ${styles.tooltipTableCell__right}">{point.y} kr</td></tr></tbody>`,
      footerFormat: '</table>',
      outside: true,
      shadow: false,
      shared: true,
      padding: 0,

      /* c8 ignore next 3 */
      positioner: function (labelWidth, labelHeight, point) {
        return { x: 0, y: 35 }
      },
    },
    legend: {
      useHTML: true,
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
        color: '#000000',
        fontWeight: 'regular',
        fontSize: '14px',
        cursor: 'default',
        zIndex: 0,
      },
      itemHoverStyle: { color: '#000000' },
      itemMarginBottom: 5,
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        states: {
          inactive: {
            enabled: false,
          },
        },
        events: {
          legendItemClick: function (e) {
            e.preventDefault()
          },
        },
      },
    },
    series: seriesYAxis,
  }

  useEffect(() => {
    const aarArray = generateXAxis(uttaksalder, MAX_UTTAKSALDER)
    setAarXAxis(aarArray)

    setSeriesYAxis([
      {
        type: 'column',
        pointWidth: COLUMN_WIDTH,
        name: 'Pensjonsgivende inntekt',
        color: '#868F9C',
        // TODO sørge for at border-radius alltid settes på den øverste kolonnen
        borderRadiusTopLeft: '15%',
        borderRadiusTopRight: '15%',
        data: simulateDataArray(PENSJONSGIVENDE_DATA, aarArray.length),
      } as unknown as Highcharts.SeriesOptionsType,
      {
        type: 'column',
        pointWidth: COLUMN_WIDTH,
        name: 'Avtalefestet pensjon (AFP)',
        color: 'var(--a-purple-400)',
        states: {
          hover: {
            color: 'var(--a-purple-200)',
          },
        },
        data: simulateDataArray(AFP_DATA, aarArray.length),
      },
      {
        type: 'column',
        pointWidth: COLUMN_WIDTH,
        name: 'Tjenestepensjon',
        color: 'var(--a-green-400)',
        states: {
          hover: {
            color: 'var(--a-green-200)',
          },
        },
        data: simulateTjenestepensjon(uttaksalder, MAX_UTTAKSALDER),
      },
      {
        type: 'column',
        pointWidth: COLUMN_WIDTH,
        name: 'Folketrygden (NAV)',
        color: 'var(--a-deepblue-500)',
        states: {
          hover: {
            color: 'var(--a-deepblue-200)',
          },
        },
        data: simulateDataArray(FOLKETRYGDEN_DATA, aarArray.length),
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
