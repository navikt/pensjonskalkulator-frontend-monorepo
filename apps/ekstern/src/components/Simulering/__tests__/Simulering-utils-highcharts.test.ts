import { IntlShape } from 'react-intl'

import {
  AxisLabelsFormatterContextObject,
  TooltipFormatterContextObject,
  Chart,
  Point,
} from 'highcharts'
import { describe, expect, it, vi } from 'vitest'

import { SERIES_DEFAULT } from '../constants'
import { onVisFlereAarClick } from '../utils'
import {
  ExtendedAxis,
  ExtendedPoint,
  getChartOptions,
  labelFormatterDesktop,
  labelFormatterMobile,
  onPointClick,
  onPointUnclick,
  tooltipFormatter,
} from '../utils-highcharts'

import { getChartMock } from './chart-mock'

import globalClassNames from './Simulering.module.scss'

describe('Simulering-utils-highcharts', () => {
  describe('labelFormatterMobile', () => {
    it('returnerer riktig streng når verdien er under 1000', () => {
      const a = labelFormatterMobile.bind({
        value: 300,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('300')
    })
    it('returnerer riktig streng når verdien er lik 1000', () => {
      const a = labelFormatterMobile.bind({
        value: 1000,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1000')
    })
    it('returnerer riktig streng når verdien er over 1000', () => {
      const a = labelFormatterMobile.bind({
        value: 1000000,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1000')
    })
    it('returnerer riktig når verdien er av type streng', () => {
      const a = labelFormatterMobile.bind({
        value: '1000000',
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1000')
    })
  })
  describe('labelFormatterDesktop', () => {
    it('returnerer riktig streng når verdien er under 1000', () => {
      const a = labelFormatterDesktop.bind({
        value: 300,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('300')
    })
    it('returnerer riktig streng når verdien er lik 1000', () => {
      const a = labelFormatterDesktop.bind({
        value: 1000,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1 000')
    })
    it('returnerer riktig streng når verdien er over 1000', () => {
      const a = labelFormatterDesktop.bind({
        value: 1000000,
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1 000 000')
    })
    it('returnerer riktig når verdien er av type streng', () => {
      const a = labelFormatterDesktop.bind({
        value: '1000000',
      } as AxisLabelsFormatterContextObject)
      expect(a()).toEqual('1 000 000')
    })
  })
  describe('tooltipFormatter', () => {
    it('returnerer formatert tooltip med riktig data og stiler for begge serier', () => {
      const stylesMock = {
        tooltipLine: 'tooltipLine',
        tooltipTable: 'tooltipTable',
        tooltipTableHeaderCell: 'tooltipTableHeaderCell',
        tooltipTableHeaderCell__left: 'tooltipTableHeaderCell__left',
        tooltipTableHeaderCell__right: 'tooltipTableHeaderCell__right',
        tooltipTableCell: 'tooltipTableCell',
        tooltipTableCell__right: 'tooltipTableCell__right',
        tooltipTableCellDot: 'tooltipTableCellDot',
      } as Partial<typeof globalClassNames>

      const alder = 65
      const total = 800000
      const colorSerie1 = 'lime'
      const colorSerie2 = 'salmon'
      const plotY = 68
      const pointSumSerie1 = 200000
      const pointSumSerie2 = 350000

      const beregnetLinePosition = 'top: 135px; left: 34px; height: 34px'
      const beregnetLinePositionAfterScroll =
        'top: 135px; left: -16px; height: 34px'

      const simplePoint = {
        y: pointSumSerie1,
        percentage: 20,
        total,
        series: {
          name: SERIES_DEFAULT.SERIE_INNTEKT.name,
          color: colorSerie1,
          yAxis: { height: 171 } as ExtendedAxis,
        },
      }

      const context = {
        point: { plotY },
        x: alder,
        points: [
          {
            y: pointSumSerie1,
            percentage: 20,
            total,
            series: {
              name: SERIES_DEFAULT.SERIE_INNTEKT.name,
              color: colorSerie1,
              chart: {
                chartHeight: 400,
                plotLeft: 35,
                series: [
                  {
                    name: SERIES_DEFAULT.SERIE_INNTEKT.name,
                    color: colorSerie1,
                    chart: { chartHeight: 400, plotLeft: 35 },
                    data: [
                      {
                        ...simplePoint,
                      },
                      {
                        ...simplePoint,
                        y: pointSumSerie2,
                        series: {
                          ...simplePoint.series,
                          name: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
                          color: colorSerie2,
                        },
                      },
                    ],
                  },
                  {
                    name: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
                    color: colorSerie2,
                    chart: { chartHeight: 400, plotLeft: 35 },
                    data: [
                      {
                        ...simplePoint,
                      },
                      {
                        ...simplePoint,
                        y: pointSumSerie2,
                        series: {
                          ...simplePoint.series,
                          name: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
                          color: colorSerie2,
                        },
                      },
                    ],
                  },
                ],
              },
            },
            point: {
              plotX: 129,
              series: {
                data: ['70', '71', '72', '73', '74', '75', '76', '77+'],
              },
            } as ExtendedPoint,
          },
        ],
      }
      const tooltipMarkup = tooltipFormatter(
        context as unknown as TooltipFormatterContextObject,
        stylesMock,
        {
          formatMessage: (s: { id: string }) => s.id,
        } as unknown as IntlShape
      )
      expect(tooltipMarkup).toContain('800 000 kr')
      expect(tooltipMarkup).toContain(
        `beregning.highcharts.tooltip.inntekt_og_pensjon 65 alder.aar`
      )
      expect(tooltipMarkup).toContain(SERIES_DEFAULT.SERIE_INNTEKT.name)
      expect(tooltipMarkup).toContain(SERIES_DEFAULT.SERIE_ALDERSPENSJON.name)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie1}`)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie2}`)
      expect(tooltipMarkup).toContain('200 000 kr')
      expect(tooltipMarkup).toContain('350 000 kr')
      expect(tooltipMarkup).toContain(beregnetLinePosition)

      const div = document.createElement('div')
      div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
      document.body.appendChild(div)

      onVisFlereAarClick()

      const tooltipMarkupAfterScroll = tooltipFormatter(
        context as unknown as TooltipFormatterContextObject,
        stylesMock,
        {
          formatMessage: (s: { id: string }) => s.id,
        } as unknown as IntlShape
      )
      expect(tooltipMarkupAfterScroll).toContain(
        beregnetLinePositionAfterScroll
      )
    })
  })
  describe('onPointClick og onPointUnclick', () => {
    describe('onPointClick', () => {
      it('oppdaterer fargen på kolonnen som er valgt og de som ikke er det samt label i xAxis', () => {
        const redrawMock = vi.fn()
        const pointUpdateMock = vi.fn()
        const tooltipUpdateMock = vi.fn()
        const tooltipRefreshMock = vi.fn()

        const chart = getChartMock(
          pointUpdateMock,
          tooltipUpdateMock,
          tooltipRefreshMock
        )

        const point = {
          index: 0,
          series: {
            chart: {
              ...chart,
              redraw: redrawMock,
            } as unknown as Chart,
          },
        } as Point
        onPointClick.call(point)
        expect(tooltipUpdateMock).toHaveBeenCalled()
        expect(pointUpdateMock).toHaveBeenCalledTimes(3)
        expect(pointUpdateMock.mock.calls).toEqual([
          [{ color: 'var(--a-deepblue-200)' }, false],
          [{ color: 'var(--a-data-surface-5-subtle)' }, false],
          [{ color: 'var(--a-purple-200)' }, false],
        ])
        expect(redrawMock).toHaveBeenCalledOnce()
        expect(tooltipRefreshMock).toHaveBeenCalledOnce()
      })

      describe('onPointUnclick', () => {
        const pointUpdateMock = vi.fn()
        const tooltipUpdateMock = vi.fn()
        const tooltipRefreshMock = vi.fn()

        const chart = getChartMock(
          pointUpdateMock,
          tooltipUpdateMock,
          tooltipRefreshMock
        )

        it('gjør ingenting når chart ikke er klar', () => {
          expect(onPointUnclick({} as MouseEvent, undefined)).toBe(undefined)
        })

        it('gjør ingenting når brukeren klikker på et chart point', () => {
          const event = { chartX: 123, point: {} as unknown as Point }
          expect(
            onPointUnclick(
              event as unknown as MouseEvent,
              { ...chart } as unknown as Chart
            )
          ).toBe(undefined)
        })

        it('kaller resetColumnColors og nullstiller fargen på alle kolonnene når brukeren klikker utenfor en chart point', () => {
          const redrawMock = vi.fn()
          vi.useFakeTimers()
          const chartWithSelection = {
            ...chart,
            redraw: redrawMock,
            tooltip: {
              ...chart.tooltip,
              isHidden: false,
            },
          } as unknown as Chart
          onPointUnclick(
            { chartX: 123 } as unknown as MouseEvent,
            chartWithSelection
          )
          vi.advanceTimersByTime(150)
          expect(pointUpdateMock).toHaveBeenCalledTimes(3)
          expect(pointUpdateMock.mock.calls).toEqual([
            [{ color: 'var(--a-deepblue-500)' }, false],
            [{ color: 'var(--a-data-surface-5)' }, false],
            [{ color: 'var(--a-purple-400)' }, false],
          ])
          expect(redrawMock).toHaveBeenCalledOnce()
          expect(tooltipUpdateMock).toHaveBeenCalledOnce()
        })

        it('kaller resetColumnColors og nullstiller fargen på alle kolonnene når brukeren klikker utenfor plot area og at tooltip er skjult', () => {
          const redrawMock = vi.fn()
          vi.useFakeTimers()
          const chartWithSelection = {
            ...chart,
            redraw: redrawMock,
            tooltip: {
              ...chart.tooltip,
              isHidden: true,
            },
          } as unknown as Chart
          onPointUnclick({} as unknown as MouseEvent, chartWithSelection)
          vi.advanceTimersByTime(150)
          expect(pointUpdateMock).toHaveBeenCalledTimes(6)
          expect(pointUpdateMock.mock.calls).toEqual([
            [
              {
                color: 'var(--a-deepblue-500)',
              },
              false,
            ],
            [
              {
                color: 'var(--a-data-surface-5)',
              },
              false,
            ],
            [
              {
                color: 'var(--a-purple-400)',
              },
              false,
            ],
            [
              {
                color: 'var(--a-deepblue-500)',
              },
              false,
            ],
            [
              {
                color: 'var(--a-data-surface-5)',
              },
              false,
            ],
            [
              {
                color: 'var(--a-purple-400)',
              },
              false,
            ],
          ])
          expect(redrawMock).toHaveBeenCalledOnce()
          expect(tooltipUpdateMock).toHaveBeenCalledTimes(2)
        })
      })
    })

    describe('getChartOptions', () => {
      it('returnerer riktig default options', () => {
        const options = getChartOptions(
          {} as Partial<typeof globalClassNames>,
          vi.fn(),
          vi.fn(),
          {
            formatMessage: (s: { id: string }) => s.id,
          } as unknown as IntlShape
        )
        expect(options).toMatchSnapshot()
      })
    })
  })
})
