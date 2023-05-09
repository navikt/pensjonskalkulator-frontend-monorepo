import {
  AxisLabelsFormatterContextObject,
  Axis,
  Point,
  TooltipFormatterContextObject,
  Options,
} from 'highcharts'

import globalClassNames from './Pensjonssimulering.module.scss'
export const MAX_UTTAKSALDER = 78
export const COLUMN_WIDTH = 25
export const TOOLTIP_YPOS = 35

export const PENSJONSGIVENDE_DATA = [
  650000, 260000, 60000, 70000, 70000, 70000, 70000, 70000, 70000, 70000, 70000,
  70000, 70000, 70000, 70000, 70000, 70000, 70000,
]

export const AFP_DATA = [
  0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
  80000, 80000, 80000, 80000, 80000, 80000, 80000,
]

export const FOLKETRYGDEN_DATA = [
  0, 35000, 175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
  175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
]

export const simulateDataArray = (array: number[], length: number) => {
  return [...array].splice(0, length)
}

export const simulateTjenestepensjon = (
  startAge: number,
  endAge: number,
  value = 80_000
) => {
  if (endAge < startAge) {
    throw Error(
      "Can't simulate tjenestepensjon when endAge is larger than startAge"
    )
  }

  return new Array(endAge + 2 - startAge)
    .fill(startAge - 1)
    .map((age, i, array) =>
      age + i < 67 ? 0 : i === array.length - 1 ? 0 : value
    )
}

export const generateXAxis = (startAlder: number, endAlder: number) => {
  const alderArray: string[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    if (i === startAlder) {
      alderArray.push((i - 1).toString())
    }

    if (i === endAlder) {
      alderArray.push(`${i - 1}+`.toString())
    } else {
      alderArray.push(i.toString())
    }
  }
  return alderArray
}

export function labelFormatter(this: AxisLabelsFormatterContextObject) {
  return this.value > 1000
    ? ((this.value as number) / 1000).toString()
    : this.value.toString()
}

export type ExtendedYAxis = Axis & { height: number; pos: number }
export type ExtendedPoint = Point & { tooltipPos: number[] }

export function tooltipFormatter(
  context: TooltipFormatterContextObject,
  styles: Partial<typeof globalClassNames>
): string {
  const yAxisHeight = (context.points?.[0].series.yAxis as ExtendedYAxis).height
  const lineYpos =
    (context.points?.[0].series.chart.yAxis[0] as ExtendedYAxis).pos -
    TOOLTIP_YPOS
  const columnHeight =
    yAxisHeight - (context.points?.[0].point as ExtendedPoint).tooltipPos[1]
  const scrollPosition =
    document.querySelector('.highcharts-scrolling')?.scrollLeft ?? 0

  const leftPosition = context.points?.[0].point?.plotX ?? 0
  const tooltipConnectingLine = `<div class="${
    styles.tooltipLine
  }" style="top: ${lineYpos}px; left: ${
    leftPosition + 21 - scrollPosition + COLUMN_WIDTH / 2
  }px; height: ${yAxisHeight - columnHeight}px"></div>`

  const headerFormat =
    `<table class="${styles.tooltipTable}"><thead><tr>` +
    `<th class="${styles.tooltipTableHeaderCell} ${styles.tooltipTableHeaderCell__left}">Utbetaling det året du er ${context.x} år</th>` +
    `<th class="${styles.tooltipTableHeaderCell} ${styles.tooltipTableHeaderCell__right}">${context.points?.[0].total} kr</th>` +
    `</tr></thead><tbody>`

  let pointsFormat = ''
  context?.points?.forEach(function (point) {
    pointsFormat +=
      `<tr>` +
      `<td class="${styles.tooltipTableCell}"><span class="${styles.tooltipTableCellDot}" style="backgroundColor:${point.series.color}"></span>${point.series.name}</td>` +
      `<td class="${styles.tooltipTableCell} ${styles.tooltipTableCell__right}">${point.y} kr</td>` +
      `</tr>`
  })

  const footerFormat = '</tbody></table>'
  return `${headerFormat}${pointsFormat}${footerFormat}${tooltipConnectingLine}`
}

export const onVisFlereAarClick = () => {
  const el = document.querySelector('.highcharts-scrolling')
  if (el) {
    ;(el as HTMLElement).scrollLeft += 50
  }
}

export const getChartOptions = (
  styles: Partial<typeof globalClassNames>
): Options => {
  return {
    chart: {
      type: 'column',
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 25,
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
      categories: [],
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
      /* c8 ignore next 3 */
      formatter: function (this: TooltipFormatterContextObject) {
        return tooltipFormatter(this, styles)
      },
      outside: true,
      shadow: false,
      shared: true,
      padding: 0,
      /* c8 ignore next 3 */
      positioner: function () {
        return { x: 0, y: TOOLTIP_YPOS }
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
          /* c8 ignore next 3 */
          legendItemClick: function (e) {
            e.preventDefault()
          },
        },
      },
    },
    series: [],
  }
}
