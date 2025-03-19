import { IntlShape } from 'react-intl'

import {
  AxisLabelsFormatterContextObject,
  Axis,
  Chart,
  Options,
  Point,
  Series,
  Tooltip,
  TooltipPositionerPointObject,
} from 'highcharts'

import { cleanAndAddEventListener } from '@/utils/events'
import { formatInntekt } from '@/utils/inntekt'
import { logger } from '@/utils/logging'

import {
  highchartsScrollingSelector,
  SERIES_DEFAULT,
  TOOLTIP_YPOS,
} from './constants'
import {
  getTooltipTitle,
  getHoverColor,
  getNormalColor,
  handleChartScroll,
  resetColumnColors,
} from './utils'

import globalClassNames from './Simulering.module.scss'

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

export type HighchartsScrollingHTMLDivElement = HTMLDivElement & {
  handleButtonVisibility: {
    showRightButton: React.Dispatch<React.SetStateAction<boolean>>
    showLeftButton: React.Dispatch<React.SetStateAction<boolean>>
  }
}

export function labelFormatterDesktop(this: AxisLabelsFormatterContextObject) {
  const sum =
    typeof this.value === 'number' ? this.value : parseInt(this.value, 10)
  return formatInntekt(sum)
}

export function labelFormatterMobile(this: AxisLabelsFormatterContextObject) {
  const sum =
    typeof this.value === 'number' ? this.value : parseInt(this.value, 10)
  return sum > 1000 ? (sum / 1000).toString() : sum.toString()
}

export function onPointClick(this: Point): void {
  logger('graf tooltip åpnet', {
    data: this.category as string,
  })
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
      label.style.color = 'var(--a-text-default)'
      label.style.fill = 'var(--a-text-default)'
    } else {
      label.style.fontWeight = 'normal'
      label.style.color = 'var(--a-text-subtle)'
      label.style.fill = 'var(--a-text-subtle)'
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

export function tooltipFormatter(
  point: Point,
  styles: Partial<typeof globalClassNames>,
  intl: IntlShape
): string {
  const chart = point.series.chart as Chart
  const points: ExtendedPoint[] = []

  chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (localPoint: Point) {
      if (localPoint.category === point.category) {
        points.push(localPoint as ExtendedPoint)
      }
    })
  })

  const tooltipEntriesHeight =
    20 *
    (points?.filter(
      (extendedPoint: ExtendedPoint) => extendedPoint.percentage > 0
    )?.length ?? 0)
  const lineYstartPOS = tooltipEntriesHeight + 55
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
    chart.chartHeight - lineYstartPOS - columnHeight - 60
  }px"></div>`

  let hasInntekt = false
  let hasPensjon = false
  let pointsFormat = ''

  const inntektSerieName = intl.formatMessage({
    id: SERIES_DEFAULT.SERIE_INNTEKT.name,
  })

  const afpSerieName = intl.formatMessage({
    id: SERIES_DEFAULT.SERIE_AFP.name,
  })
  points.forEach(function (localPoint) {
    if (
      (localPoint.y && localPoint.y > 0) ||
      localPoint.series.name === afpSerieName // Unntak for AFP, skal vises hvis det er 0 i legend
    ) {
      if (localPoint.series.name === inntektSerieName) {
        hasInntekt = true
      } else {
        hasPensjon = true
      }
      pointsFormat +=
        `<tr>` +
        `<td class="${styles.tooltipTableCell}"><span class="${styles.tooltipTableCellDot}" style="backgroundColor:${localPoint.series.color}"></span>${localPoint.series.name}</td>` +
        `<td class="${styles.tooltipTableCell} ${
          styles.tooltipTableCell__right
        }"><span class="nowrap">${formatInntekt(localPoint.y)} kr</span></td>` +
        `</tr>`
    }
  })

  const headerFormat =
    `<table class="${styles.tooltipTable}"><thead><tr>` +
    `<th class="${styles.tooltipTableHeaderCell} ${
      styles.tooltipTableHeaderCell__left
    }">${getTooltipTitle(point.category + '', hasInntekt, hasPensjon, intl)}</th>` +
    `<th class="${styles.tooltipTableHeaderCell} ${
      styles.tooltipTableHeaderCell__right
    }"><span class="nowrap">${formatInntekt(points?.[0].total)} kr</span></th>` +
    `</tr></thead><tbody>`

  const footerFormat = '</tbody></table>'
  return `${headerFormat}${pointsFormat}${footerFormat}${tooltipConnectingLine}`
}

export const getChartOptions = (
  styles: Partial<typeof globalClassNames>,
  showRightButton: React.Dispatch<React.SetStateAction<boolean>>,
  showLeftButton: React.Dispatch<React.SetStateAction<boolean>>,
  intl: IntlShape
): Options => {
  return {
    chart: {
      style: {
        zIndex: 1,
      },
      type: 'column',
      animation: false,
      spacingTop: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      scrollablePlotArea: {
        minWidth: 750,
        scrollPositionX: 0,
      },
      events: {
        render(this) {
          // Denne setTimeout er nødvendig fordi highcharts tegner scroll container litt etter render callback og har ikke noe eget flag for den
          const timeout = setTimeout(() => {
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
              }
            } else {
              showRightButton(false)
              showLeftButton(false)
            }
            const el1 = document.querySelector('[data-highcharts-chart]')
            el1?.setAttribute('data-testid', 'highcharts-done-drawing')
            // Dette er meningsløst for koden som kjører i browser'en, men ser ut til å spare vitest for hanging processes
            clearTimeout(timeout)
          }, 50)
        },
      },
    },
    title: {
      text: '-',
      align: 'left',
      margin: 20,
      y: 0,
      style: { opacity: 0 },
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
          color: 'var(--a-text-subtle)',
        },
        y: 20,
      },
      title: {
        text: intl.formatMessage({ id: 'beregning.highcharts.xaxis' }),
        align: 'high',
        y: -5,
        style: {
          fontFamily: 'var(--a-font-family)',
          fontSize: 'var(--a-font-size-medium)',
          color: 'var(--a-text-subtle)',
        },
      },
      lineColor: 'var(--a-text-subtle)',
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
    credits: {
      enabled: false,
    },
    tooltip: {
      outside: false,
      className: styles.tooltip,
      animation: false,
      followTouchMove: false,
      // /* c8 ignore next 20 */
      formatter: function (this: Point) {
        return tooltipFormatter(this, styles, intl)
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
        itemClick: function (e) {
          e.preventDefault()
          return false
        },
      },
    },
    plotOptions: {
      series: {
        animation: false,
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
            return false
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
            callback: () => {
              return window.matchMedia('(max-width: 1023px)').matches
            },
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
                text: intl.formatMessage({
                  id: 'beregning.highcharts.yaxis.mobile',
                }),
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
      ],
    },
  }
}
