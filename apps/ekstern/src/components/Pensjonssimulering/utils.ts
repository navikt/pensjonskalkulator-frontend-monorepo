import {
  AxisLabelsFormatterContextObject,
  Axis,
  Chart,
  Options,
  Point,
  Series,
  Tooltip,
  TooltipFormatterContextObject,
} from 'highcharts'

import { formatAsDecimal } from '@/utils/currency'
import { addSelfDestructingEventListener } from '@/utils/events'

import globalClassNames from './Pensjonssimulering.module.scss'

export const MAX_UTTAKSALDER = 78
export const COLUMN_WIDTH = 25
export const TOOLTIP_YPOS = 35

export const SERIE_NAME_INNTEKT = 'Inntekt (lønn m.m.)'
export const SERIE_NAME_AFP = 'Avtalefestet pensjon (AFP)'
export const SERIE_NAME_TP = 'Pensjonsavtaler (arbeidsgivere)'
export const SERIE_NAME_ALDERSPENSJON = 'Alderspensjon (NAV)'

export const SERIE_COLOR_INNTEKT = '#868F9C'
export const SERIE_COLOR_AFP = 'var(--a-purple-400)'
export const SERIE_COLOR_TP = 'var(--a-green-400)'
export const SERIE_COLOR_ALDERSPENSJON = 'var(--a-deepblue-500)'

export const SERIE_COLOR_FADED_INNTEKT = '#AfAfAf'
export const SERIE_COLOR_FADED_AFP = 'var(--a-purple-200)'
export const SERIE_COLOR_FADED_TP = 'var(--a-green-200)'
export const SERIE_COLOR_FADED_ALDERSPENSJON = 'var(--a-deepblue-200)'

export const highchartsScrollingSelector = '.highcharts-scrolling'

export const PENSJONSGIVENDE_DATA = [
  650000, 260000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

export const AFP_DATA = [
  0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
  80000, 80000, 80000, 80000, 80000, 80000, 80000,
]

export const FOLKETRYGDEN_DATA = [
  0, 35000, 175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
  175000, 175000, 175000, 175000, 175000, 175000, 175000, 175000,
]

export const simulateDataArray = (
  array: number[],
  length: number,
  startAge?: number,
  coefficient = 0
) => {
  if (startAge && startAge < 60) {
    throw Error("Can't simulate dataArray when startAge is smaller than 60")
  }
  const faktor = startAge ? startAge - 60 : 0
  const dataArray = [...array].map((value, i) => {
    return i > 1 ? value + faktor * coefficient : value
  })

  return [...dataArray].splice(0, length)
}

export const simulateTjenestepensjon = (
  startAge: number,
  endAge: number,
  coefficient = 4_000
) => {
  if (endAge < startAge || startAge < 62) {
    throw Error(
      "Can't simulate tjenestepensjon when endAge is larger than startAge or smaller than 62"
    )
  }

  const faktor = startAge - 62
  const value = coefficient * 20 + faktor * coefficient

  return new Array(endAge + 2 - startAge)
    .fill(startAge - 1)
    .map((age, i, array) =>
      age + i < 67 || i === array.length - 1 ? 0 : value
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

export type ExtendedAxis = Axis & {
  height: number
  pos: number
  labelGroup: { element: { childNodes: Array<HTMLElement> } }
}
export type ExtendedPoint = Point & {
  series: { data: string[] }
}
export type ExtendedTooltip = Tooltip & {
  isHidden: boolean
}

export function getTooltipTitle(
  hasInntekt: boolean,
  hasPensjon: boolean
): string {
  if (hasInntekt && hasPensjon) {
    return 'Inntekt og pensjon når du er'
  } else if (hasInntekt && !hasPensjon) {
    return 'Inntekt når du er'
  } else {
    return 'Pensjon når du er'
  }
}

export function tooltipFormatter(
  context: TooltipFormatterContextObject,
  styles: Partial<typeof globalClassNames>
): string {
  const chart = context.points?.[0].series.chart as Chart
  const tooltipEntriesHeight =
    20 * (context.points?.filter((point) => point.percentage > 0)?.length ?? 0)
  const lineYstartPOS = tooltipEntriesHeight + 50
  const columnHeight =
    (context.points?.[0].series.yAxis as ExtendedAxis).height -
    (context.point.plotY ?? 0)
  const scrollPosition =
    document.querySelector(highchartsScrollingSelector)?.scrollLeft ?? 0
  const leftPosition = context.points?.[0].point?.plotX ?? 0

  const tooltipConnectingLine = `<div class="${
    styles.tooltipLine
  }" style="top: ${lineYstartPOS}px; left: ${
    leftPosition + chart.plotLeft - scrollPosition - 1
  }px; height: ${
    chart.chartHeight - lineYstartPOS - columnHeight - 80
  }px"></div>`

  let hasInntekt = false
  let hasPensjon = false
  let pointsFormat = ''

  context?.points?.forEach(function (point) {
    if (point.y && point.y > 0) {
      if (point.series.name === SERIE_NAME_INNTEKT) {
        hasInntekt = true
      } else {
        hasPensjon = true
      }
      pointsFormat +=
        `<tr>` +
        `<td class="${styles.tooltipTableCell}"><span class="${styles.tooltipTableCellDot}" style="backgroundColor:${point.series.color}"></span>${point.series.name}</td>` +
        `<td class="${styles.tooltipTableCell} ${
          styles.tooltipTableCell__right
        }">${formatAsDecimal(point.y)} kr</td>` +
        `</tr>`
    }
  })

  const headerFormat =
    `<table class="${styles.tooltipTable}"><thead><tr>` +
    `<th class="${styles.tooltipTableHeaderCell} ${
      styles.tooltipTableHeaderCell__left
    }">${getTooltipTitle(hasInntekt, hasPensjon)} ${context.x} år</th>` +
    `<th class="${styles.tooltipTableHeaderCell} ${
      styles.tooltipTableHeaderCell__right
    }">${formatAsDecimal(context.points?.[0].total)} kr</th>` +
    `</tr></thead><tbody>`

  const footerFormat = '</tbody></table>'
  return `${headerFormat}${pointsFormat}${footerFormat}${tooltipConnectingLine}`
}

export const onVisFaerreAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft -= 50
  }
}

export const onVisFlereAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft += 50
  }
}

type HighchartsScrollingHTMLDivElement = HTMLDivElement & {
  handleButtonVisibility: {
    showRightButton: React.Dispatch<React.SetStateAction<boolean>>
    showLeftButton: React.Dispatch<React.SetStateAction<boolean>>
  }
}

export const getHoverColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIE_COLOR_INNTEKT: {
      return SERIE_COLOR_FADED_INNTEKT
    }
    case SERIE_COLOR_AFP: {
      return SERIE_COLOR_FADED_AFP
    }
    case SERIE_COLOR_TP: {
      return SERIE_COLOR_FADED_TP
    }
    case SERIE_COLOR_ALDERSPENSJON: {
      return SERIE_COLOR_FADED_ALDERSPENSJON
    }
    default: {
      return ''
    }
  }
}

export const getNormalColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIE_COLOR_FADED_INNTEKT: {
      return SERIE_COLOR_INNTEKT
    }
    case SERIE_COLOR_FADED_AFP: {
      return SERIE_COLOR_AFP
    }
    case SERIE_COLOR_FADED_TP: {
      return SERIE_COLOR_TP
    }
    case SERIE_COLOR_FADED_ALDERSPENSJON: {
      return SERIE_COLOR_ALDERSPENSJON
    }
    default: {
      return previousColor
    }
  }
}

export function resetColumnColors(chart: Chart): void {
  chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (point: Point) {
      const color = getNormalColor(point.color as string)
      if (point.color !== color) {
        point.update({ color: getNormalColor(point.color as string) }, false)
      }
    })
  })

  if ((chart.xAxis[0] as ExtendedAxis).labelGroup) {
    ;(chart.xAxis[0] as ExtendedAxis).labelGroup.element.childNodes.forEach(
      function (label: HTMLElement) {
        label.style.fontWeight = 'normal'
      }
    )
  }
  chart.redraw()
  chart.tooltip.hide(0)
}

export function onPointClick(this: Point): void {
  const pointIndex = this.index
  this.series.chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (point: Point) {
      const color =
        point.index !== pointIndex
          ? getHoverColor(point.color as string)
          : getNormalColor(point.color as string)

      if (color && color !== point.color) {
        point.update({ color }, false)
      }
    })
  })
  ;(
    this.series.chart.xAxis[0] as ExtendedAxis
  ).labelGroup.element.childNodes.forEach(function (
    label: HTMLElement,
    index: number
  ) {
    if (index === pointIndex) {
      label.style.fontWeight = 'bold'
    } else {
      label.style.fontWeight = 'normal'
    }
  })
  this.series.chart.redraw()
}

export function onPointUnClick(
  e: Event & {
    chartX?: number
    point?: Point
  },
  chart?: Chart
) {
  // Behov for litt delay slik at Highcharts rekker å sette chart.tooltip.hidden property
  setTimeout(() => {
    if (chart && e.chartX !== undefined && e.point === undefined) {
      // Is inside chart ploot area, but not on a point
      resetColumnColors(chart)
    } else if (chart && (chart.tooltip as ExtendedTooltip)?.isHidden) {
      // Is outside chart plot area, and tooltip is hidden
      resetColumnColors(chart)
    }
  }, 50)
}

export function handleChartScroll(
  event: Event,
  args: {
    chart?: Chart
    scrollPosition?: number
  }
) {
  if (event.currentTarget) {
    const { chart, scrollPosition } = args
    const el = event.currentTarget as HighchartsScrollingHTMLDivElement
    const elementScrollPosition = el.scrollLeft
    if (chart && scrollPosition !== el.scrollLeft) {
      resetColumnColors(chart)
    }

    const isRightButtonAvailable = el.scrollWidth > el.offsetWidth

    if (elementScrollPosition === 0) {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(false)
    } else if (elementScrollPosition + el.offsetWidth === el.scrollWidth) {
      el.handleButtonVisibility.showRightButton(false)
      el.handleButtonVisibility.showLeftButton(true)
    } else {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(true)
    }
  }
}

export const getChartOptions = (
  styles: Partial<typeof globalClassNames>,
  showRightButton: React.Dispatch<React.SetStateAction<boolean>>,
  showLeftButton: React.Dispatch<React.SetStateAction<boolean>>
): Options => {
  return {
    chart: {
      type: 'column',
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 25,
      scrollablePlotArea: {
        minWidth: 750,
        scrollPositionX: 0,
      },
      events: {
        render(this) {
          const highchartsScrollingElement = document.querySelector(
            highchartsScrollingSelector
          )
          if (highchartsScrollingElement) {
            const el =
              highchartsScrollingElement as HighchartsScrollingHTMLDivElement
            const scrollPosition = el.scrollLeft
            if (el.handleButtonVisibility !== undefined) {
              handleChartScroll({ currentTarget: el } as unknown as Event, {
                chart: this,
                scrollPosition,
              })
            } else {
              // Denne setTimeout er nødvendig fordi highcharts tegner scroll container litt etter render callback og har ikke noe eget flag for den
              setTimeout(() => {
                const elementScrollWidth = el.scrollWidth
                const elementWidth = el.offsetWidth
                showRightButton(elementScrollWidth > elementWidth)
                /* eslint-disable-next-line @typescript-eslint/no-this-alias */
                const chart = this

                addSelfDestructingEventListener(
                  el,
                  'scroll',
                  handleChartScroll,
                  { chart, scrollPosition }
                )
                el.handleButtonVisibility = {
                  showRightButton,
                  showLeftButton,
                }
              }, 50)
            }
          } else {
            showRightButton(false)
            showLeftButton(false)
          }
        },
      },
    },
    title: {
      text: `Beregning`,
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
      labels: {
        formatter: function (this: AxisLabelsFormatterContextObject) {
          return this.value.toString()
        },
        style: {
          color: 'var(--a-grayalpha-700)',
        },
      },
      lineColor: 'var(--a-grayalpha-700)',
    },
    yAxis: {
      minorTickInterval: 200000,
      tickInterval: 200000,
      allowDecimals: false,
      min: 0,
      title: {
        text: 'Tusen kroner',
        align: 'high',
        margin: -75,
        rotation: 0,
        textAlign: 'left',
        x: -75,
        y: -22,
      },
      labels: {
        formatter: labelFormatter,
        style: {
          color: 'var(--a-grayalpha-700)',
        },
      },
      gridLineColor: 'var(--a-grayalpha-200)',
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      className: styles.tooltip,
      followTouchMove: false,
      /* c8 ignore next 3 */
      formatter: function (this: TooltipFormatterContextObject) {
        return tooltipFormatter(this, styles)
      },
      hideDelay: 30,
      outside: true,
      padding: 0,
      /* c8 ignore next 3 */
      positioner: function () {
        return { x: 0, y: TOOLTIP_YPOS }
      },
      shadow: false,
      shared: true,
      useHTML: true,
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
        stickyTracking: false,
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
      column: {
        point: {
          events: {
            click: onPointClick,
          },
        },
      },
    },
    series: [],
  }
}
