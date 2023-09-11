import {
  AxisLabelsFormatterContextObject,
  Axis,
  Chart,
  Options,
  Point,
  Series,
  Tooltip,
  TooltipFormatterContextObject,
  TooltipPositionerPointObject,
} from 'highcharts'

import { formatAsDecimal } from '@/utils/currency'
import { cleanAndAddEventListener } from '@/utils/events'

import globalClassNames from './Pensjonssimulering.module.scss'

export const MAX_UTTAKSALDER = 77
export const COLUMN_WIDTH = 25
export const TOOLTIP_YPOS = 35

export const SERIE_NAME_INNTEKT = 'Inntekt (lønn m.m.)'
export const SERIE_NAME_AFP = 'Avtalefestet pensjon (AFP)'
export const SERIE_NAME_TP = 'Pensjonsavtaler (arbeidsgiver)'
export const SERIE_NAME_ALDERSPENSJON = 'Alderspensjon (NAV)'

export const SERIE_COLOR_INNTEKT = 'var(--a-gray-500)'
export const SERIE_COLOR_AFP = 'var(--a-purple-400)'
export const SERIE_COLOR_TP = 'var(--a-green-400)'
export const SERIE_COLOR_ALDERSPENSJON = 'var(--a-deepblue-500)'

export const SERIE_COLOR_FADED_INNTEKT = 'var(--a-gray-300)'
export const SERIE_COLOR_FADED_AFP = 'var(--a-purple-200)'
export const SERIE_COLOR_FADED_TP = 'var(--a-green-200)'
export const SERIE_COLOR_FADED_ALDERSPENSJON = 'var(--a-deepblue-200)'

export const highchartsScrollingSelector = '.highcharts-scrolling'

export const PENSJONSGIVENDE_DATA = [
  650000, 260000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

export const processPensjonsberegningArray = (
  pensjonsberegninger: Pensjonsberegning[] = []
): number[] => {
  const dataArray = [...pensjonsberegninger].map((value) => {
    return value.beloep
  })
  dataArray.unshift(0)
  return dataArray
}

export const processPensjonsavtalerArray = (
  startAlder: number,
  length: number,
  foedsesldato: string,
  pensjonsavtaler: Pensjonsavtale[]
): number[] => {
  const d = new Date(foedsesldato)
  const foedselsmaaned = d.getMonth() + 1

  const sluttAlder = startAlder + length - 1
  const result = new Array(sluttAlder - startAlder + 1).fill(0)

  pensjonsavtaler.forEach((avtale) => {
    avtale.utbetalingsperioder.forEach((utbetalingsperiode) => {
      const avtaleStartYear = Math.max(
        startAlder,
        utbetalingsperiode.startAlder
      )
      const avtaleEndYear = utbetalingsperiode.sluttAlder
        ? Math.min(sluttAlder, utbetalingsperiode.sluttAlder)
        : sluttAlder

      for (let year = avtaleStartYear; year <= avtaleEndYear; year++) {
        if (year >= startAlder) {
          const isFirstYear = year === avtaleStartYear
          const isLastYear =
            utbetalingsperiode.sluttAlder && year === avtaleEndYear

          const startMonth = isFirstYear
            ? foedselsmaaned + utbetalingsperiode.startMaaned
            : 1

          const endMonth =
            isLastYear && utbetalingsperiode.sluttMaaned !== undefined
              ? foedselsmaaned + utbetalingsperiode.sluttMaaned
              : isLastYear && utbetalingsperiode.sluttMaaned === undefined
              ? foedselsmaaned
              : 12

          const monthsInYear =
            endMonth <= 0 || endMonth > 12 ? 0 : endMonth - startMonth + 1
          const allocatedAmount =
            (utbetalingsperiode.aarligUtbetaling *
              utbetalingsperiode.grad *
              Math.max(0, monthsInYear)) /
            100 /
            12

          result[year - startAlder] += allocatedAmount
        }
      }
    })
  })
  return result
}

export const generateXAxis = (
  startAlder: number,
  pensjonsavtaler: Pensjonsavtale[],
  setIsPensjonsavtaleFlagVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let sluttAlder = MAX_UTTAKSALDER
  let hasAvtaleBeforeStartAlder = false

  pensjonsavtaler.forEach((avtale) => {
    if (avtale.sluttAlder && avtale.sluttAlder > sluttAlder) {
      sluttAlder = avtale.sluttAlder
    }
    if (
      !hasAvtaleBeforeStartAlder &&
      avtale.startAlder &&
      avtale.startAlder < startAlder
    ) {
      hasAvtaleBeforeStartAlder = true
    }
  })
  const alderArray: string[] = []
  for (let i = startAlder; i <= sluttAlder + 1; i++) {
    if (i === startAlder) {
      alderArray.push((i - 1).toString())
    }

    if (i === sluttAlder + 1) {
      alderArray.push(`${i - 1}+`.toString())
    } else {
      alderArray.push(i.toString())
    }
  }
  setIsPensjonsavtaleFlagVisible(hasAvtaleBeforeStartAlder)
  return alderArray
}

export function labelFormatterDesktop(this: AxisLabelsFormatterContextObject) {
  const sum =
    typeof this.value === 'number' ? this.value : parseInt(this.value, 10)
  return formatAsDecimal(sum)
}

export function labelFormatterMobile(this: AxisLabelsFormatterContextObject) {
  const sum =
    typeof this.value === 'number' ? this.value : parseInt(this.value, 10)
  return sum > 1000 ? (sum / 1000).toString() : sum.toString()
}

export type ExtendedAxis = Axis & {
  height: number
  pos: number
  labelGroup: { element: { childNodes: Array<HTMLElement> } }
}
export type ExtendedPoint = Point & {
  series: { data: string[] }
  percentage: number
  stackTotal: number
  tooltipPos: number[]
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
  const series = context.points?.[0].series as Series
  const chart = series.chart as Chart
  const points: ExtendedPoint[] = []

  chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (point: Point) {
      if (point.category === context.key) {
        points.push(point as ExtendedPoint)
      }
    })
  })

  const tooltipEntriesHeight =
    20 *
    (points?.filter((point: ExtendedPoint) => point.percentage > 0)?.length ??
      0)
  const lineYstartPOS = tooltipEntriesHeight + 50
  const columnHeight =
    (points?.[0].series.yAxis as ExtendedAxis).height - (points[0].plotY ?? 0)
  const scrollPosition =
    document.querySelector(highchartsScrollingSelector)?.scrollLeft ?? 0
  const leftPosition = points?.[0]?.plotX ?? 0

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

  points.forEach(function (point) {
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
    }">${formatAsDecimal(points?.[0].total)} kr</th>` +
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
  chart?.tooltip.update({
    enabled: false,
  })
  chart.redraw()
}

export function onPointClick(this: Point): void {
  this.series.chart.tooltip.update({
    enabled: true,
  })
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
  this.series.chart.tooltip.refresh(this)
}

export function onPointUnclick(
  e: Event & {
    chartX?: number
    point?: Point
  },
  chart?: Chart
) {
  if (chart && e.chartX === undefined && e.point === undefined) {
    // User has clicked outside of the plot area
    resetColumnColors(chart)
  } else if (chart && e.chartX !== undefined && e.point === undefined) {
    // Is inside chart plot area, but not on a point
    resetColumnColors(chart)
  }
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
      spacingBottom: 0,
      spacingLeft: 0,
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

                cleanAndAddEventListener(el, 'scroll', handleChartScroll, {
                  chart,
                  scrollPosition,
                })
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
          fontFamily: 'var(--a-font-family)',
          fontSize: 'var(--a-font-size-medium)',
          color: 'var(--a-grayalpha-700)',
        },
        y: 20,
      },
      title: {
        text: 'Årlig inntekt og pensjon etter uttak',
        align: 'high',
        y: -5,
        style: {
          fontFamily: 'var(--a-font-family)',
          fontSize: 'var(--a-font-size-medium)',
        },
      },
      lineColor: 'var(--a-grayalpha-700)',
    },
    yAxis: {
      offset: 10,
      minorTickInterval: 200000,
      tickInterval: 200000,
      allowDecimals: false,
      min: 0,
      title: {
        text: 'Kroner',
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
          color: 'var(--a-grayalpha-700)',
          paddingRight: 'var(--a-spacing-3)',
        },
        x: -55,
      },
      gridLineColor: 'var(--a-grayalpha-200)',
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      className: styles.tooltip,
      followTouchMove: false,
      /* c8 ignore next 20 */
      formatter: function (this: TooltipFormatterContextObject) {
        return tooltipFormatter(this, styles)
      },
      positioner: function (
        labelWidth: number,
        labelHeight: number,
        point: TooltipPositionerPointObject
      ) {
        const hoverPoint = this.chart.hoverPoint as ExtendedPoint
        const plotY = hoverPoint?.series.yAxis.toPixels(
          hoverPoint.stackTotal,
          true
        )
        const defaultPos = this.getPosition.apply(this, [
          labelWidth,
          labelHeight,
          { ...point, plotY } as TooltipPositionerPointObject,
        ])
        return { ...defaultPos }
      },
      hideDelay: 9e9,
      padding: 0,
      shadow: false,
      shared: true,
      useHTML: true,
    },
    legend: {
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
            /* c8 ignore next 6 */
            mouseOut: function () {
              return false
            },
            mouseOver: function () {
              return false
            },
          },
        },
      },
    },
    series: [],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 772,
          },
          chartOptions: {
            xAxis: {
              title: {
                text: '',
              },
              labels: {
                style: {
                  fontSize: 'var(--a-font-size-small)',
                },
              },
            },
            yAxis: {
              offset: 28,
              title: {
                text: 'Tusen kroner',
                margin: -75,
                x: -73,
                y: -22,
                style: {
                  fontSize: 'var(--a-font-size-small)',
                },
              },
              labels: {
                formatter: labelFormatterMobile,
                style: {
                  fontSize: 'var(--a-font-size-small)',
                  backgroundColor: 'transparent',
                },
                x: 0,
              },
            },
            tooltip: {
              outside: true,
              /* c8 ignore next 3 */
              positioner: function () {
                return { x: 0, y: TOOLTIP_YPOS }
              },
            },
            legend: {
              margin: 50,
              itemDistance: 12,
              verticalAlign: 'top',
            },
          },
        },
        {
          condition: {
            maxWidth: 480,
          },
          chartOptions: {
            legend: { itemDistance: 0 },
          },
        },
      ],
    },
  }
}
