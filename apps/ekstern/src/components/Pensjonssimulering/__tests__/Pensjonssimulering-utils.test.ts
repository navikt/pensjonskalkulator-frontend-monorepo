import {
  AxisLabelsFormatterContextObject,
  TooltipFormatterContextObject,
  Chart,
  Point,
} from 'highcharts'
import { describe, expect, it, vi } from 'vitest'

import {
  SERIE_NAME_INNTEKT,
  SERIE_NAME_ALDERSPENSJON,
  highchartsScrollingSelector,
  processPensjonsavtalerArray,
  simulateDataArray,
  generateXAxis,
  labelFormatterDesktop,
  labelFormatterMobile,
  getTooltipTitle,
  tooltipFormatter,
  getHoverColor,
  getNormalColor,
  onPointClick,
  onPointUnclick,
  getChartOptions,
  onVisFlereAarClick,
  onVisFaerreAarClick,
  ExtendedAxis,
  ExtendedPoint,
  handleChartScroll,
} from '../utils'

import globalClassNames from './Pensjonssimulering.module.scss'

describe('Pensjonssimulering-utils', () => {
  const createMockedPensjonsavtale = (args: {
    startAlder: number
    startMaaned?: number
    sluttAlder?: number
    sluttMaaned?: number
    grad?: number
  }) => {
    const {
      startAlder,
      startMaaned = 1,
      sluttAlder,
      sluttMaaned,
      grad = 100,
    } = args
    return {
      produktbetegnelse: 'Innskuddpensjon',
      kategori: 'INNSKUDD',
      startAlder: 67,
      startMaaned: 1,
      utbetalingsperiode: {
        startAlder,
        startMaaned,
        sluttAlder,
        sluttMaaned,
        grad,
        aarligUtbetaling: 100000,
      },
    }
  }

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
    vi.resetAllMocks()
  })

  describe('simulateDataArray', () => {
    it('returnerer riktig array ', () => {
      expect(simulateDataArray([], 10)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 0)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 10)).toHaveLength(3)
      expect(simulateDataArray([1, 2, 3, 4, 5, 6], 2)).toHaveLength(2)
    })

    it('thrower dersom startAge < 60', () => {
      expect(() => simulateDataArray([], 1, 59)).toThrow()
    })

    it('returnerer riktig array når man angir en startAge uten coefficient', () => {
      expect(simulateDataArray([], 10, 62)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 0, 62)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 10, 62)).toHaveLength(3)
    })

    it('returnerer riktig array når man angir en startAge med coefficient', () => {
      expect(simulateDataArray([], 10, 62, 20_000)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 0, 62, 20_000)).toMatchSnapshot()
      expect(simulateDataArray([1, 2, 3], 10, 62, 20_000)).toMatchSnapshot()
      expect(
        simulateDataArray([1, 2, 3, 4, 5, 6], 2, 62, 20_000)
      ).toMatchSnapshot()
    })
  })

  describe('processPensjonsavtalerArray', () => {
    it('returnerer en liste med 0 med riktig lengde', () => {
      expect(processPensjonsavtalerArray(66, 13, '1963-04-30', [])).toEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])
      expect(processPensjonsavtalerArray(66, 1, '1963-04-30', [])).toEqual([0])
      expect(processPensjonsavtalerArray(66, 0, '1963-04-30', [])).toEqual([])
    })
    it('returnerer riktig summer basert på fødselsmaaned med en eller flere avtaler', () => {
      expect(
        processPensjonsavtalerArray(66, 13, '1963-04-30', [
          createMockedPensjonsavtale({ startAlder: 67, sluttAlder: 77 }),
        ])
      ).toEqual([
        0, 66666.66666666667, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 33333.333333333336, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 13, '1963-04-30', [
          createMockedPensjonsavtale({ startAlder: 67, sluttAlder: 77 }),
          createMockedPensjonsavtale({ startAlder: 70, sluttAlder: 78 }),
        ])
      ).toEqual([
        0, 66666.66666666667, 100000, 100000, 166666.6666666667, 200000, 200000,
        200000, 200000, 200000, 200000, 133333.33333333334, 33333.333333333336,
      ])
    })
    it('returnerer riktig summer med livsvarig avtale (avtale uten sluttAlder)', () => {
      expect(
        processPensjonsavtalerArray(66, 13, '1963-04-30', [
          createMockedPensjonsavtale({ startAlder: 67, sluttAlder: undefined }),
        ])
      ).toEqual([
        0, 66666.66666666667, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 100000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(66, 14, '1963-04-30', [
          createMockedPensjonsavtale({ startAlder: 67, sluttAlder: undefined }),
          createMockedPensjonsavtale({ startAlder: 70, sluttAlder: 78 }),
        ])
      ).toEqual([
        0, 66666.66666666667, 100000, 100000, 166666.6666666667, 200000, 200000,
        200000, 200000, 200000, 200000, 200000, 133333.33333333334, 100000,
      ])
    })

    it('returnerer riktig summer med graderte avtaler', () => {
      expect(
        processPensjonsavtalerArray(66, 13, '1963-04-30', [
          createMockedPensjonsavtale({
            startAlder: 67,
            sluttAlder: 77,
            grad: 50,
          }),
        ])
      ).toEqual([
        0, 33333.333333333336, 50000, 50000, 50000, 50000, 50000, 50000, 50000,
        50000, 50000, 16666.666666666668, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 14, '1963-04-30', [
          createMockedPensjonsavtale({
            startAlder: 67,
            sluttAlder: 77,
            grad: 50,
          }),
          createMockedPensjonsavtale({ startAlder: 70, sluttAlder: 78 }),
          createMockedPensjonsavtale({
            startAlder: 75,
            grad: 75,
          }),
        ])
      ).toEqual([
        0, 33333.333333333336, 50000, 50000, 116666.66666666667, 150000, 150000,
        150000, 150000, 200000, 225000, 191666.6666666667, 108333.33333333334,
        75000,
      ])
    })

    describe('returnerer riktig summer basert på startMaaned og sluttMaaned', () => {
      it('med en avtale', () => {
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 2,
              sluttAlder: 77,
            }),
          ])
        ).toEqual([
          0, 58333.333333333336, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 100000, 33333.333333333336, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              sluttAlder: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 66666.66666666667, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 100000, 50000, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 2,
              sluttAlder: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 58333.333333333336, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 100000, 50000, 0,
        ])
      })
      it('med flere avtaler (livsvarige og graderte)', () => {
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 2,
              sluttAlder: 77,
            }),
            createMockedPensjonsavtale({ startAlder: 70, sluttAlder: 78 }),
          ])
        ).toEqual([
          0, 58333.333333333336, 100000, 100000, 166666.6666666667, 200000,
          200000, 200000, 200000, 200000, 200000, 133333.33333333334,
          33333.333333333336,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 6,
              sluttAlder: undefined,
            }),
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 2,
              sluttAlder: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 83333.33333333334, 200000, 200000, 200000, 200000, 200000, 200000,
          200000, 200000, 200000, 150000, 100000,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              sluttAlder: undefined,
              grad: 50,
            }),
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 2,
              sluttAlder: 77,
              sluttMaaned: 2,
            }),
            createMockedPensjonsavtale({
              startAlder: 70,
              sluttAlder: 78,
              sluttMaaned: 4,
            }),
            createMockedPensjonsavtale({
              startAlder: 75,
              startMaaned: 6,
              grad: 75,
            }),
          ])
        ).toEqual([
          0, 91666.66666666667, 150000, 150000, 216666.6666666667, 250000,
          250000, 250000, 250000, 268750, 325000, 275000, 191666.6666666667,
        ])
      })
      it('når antall måneder er lavere enn 0 det første eller siste året blir summen 0', () => {
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              startMaaned: 10,
              sluttAlder: 77,
            }),
          ])
        ).toEqual([
          0, 0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 33333.333333333336, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, '1963-04-30', [
            createMockedPensjonsavtale({
              startAlder: 67,
              sluttAlder: 77,
              sluttMaaned: 10,
            }),
          ])
        ).toEqual([
          0, 66666.66666666667, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 100000, 0, 0,
        ])
      })
    })
  })

  describe('generateXAxis', () => {
    const setIsPensjonsavtaleFlagVisibleMock = vi.fn()
    const maxArray = [
      '61',
      '62',
      '63',
      '64',
      '65',
      '66',
      '67',
      '68',
      '69',
      '70',
      '71',
      '72',
      '73',
      '74',
      '75',
      '76',
      '77',
      '77+',
    ]

    it('returnerer et minimum array fra året før startAlder til 77+ når pensjonsavtaler dekker en mindre periode eller er livsvarige', () => {
      const alderArray = generateXAxis(
        62,
        [
          createMockedPensjonsavtale({
            startAlder: 67,
            sluttAlder: 70,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toHaveLength(18)
      expect(alderArray).toEqual(maxArray)

      const alderArrayUnlimited = generateXAxis(
        62,
        [
          createMockedPensjonsavtale({
            startAlder: 67,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArrayUnlimited).toHaveLength(18)
      expect(alderArrayUnlimited).toEqual(maxArray)
    })
  })

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

  describe('getTooltipTitle', () => {
    it('returnerer riktig streng for inntekt uten pensjon', () => {
      expect(getTooltipTitle(true, false)).toEqual('Inntekt når du er')
    })
    it('returnerer riktig streng for pensjon uten inntekt', () => {
      expect(getTooltipTitle(false, true)).toEqual('Pensjon når du er')
    })
    it('returnerer riktig streng for pensjon og inntekt', () => {
      expect(getTooltipTitle(true, true)).toEqual(
        'Inntekt og pensjon når du er'
      )
    })
    it('returnerer streng for pensjon som fallback', () => {
      expect(getTooltipTitle(false, false)).toEqual('Pensjon når du er')
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

      const beregnetLinePosition = 'top: 130px; left: 34px; height: 19px'
      const beregnetLinePositionAfterScroll =
        'top: 130px; left: -16px; height: 19px'

      const simplePoint = {
        y: pointSumSerie1,
        percentage: 20,
        total,
        series: {
          name: SERIE_NAME_INNTEKT,
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
              name: SERIE_NAME_INNTEKT,
              color: colorSerie1,
              chart: {
                chartHeight: 400,
                plotLeft: 35,
                series: [
                  {
                    name: SERIE_NAME_INNTEKT,
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
                          name: SERIE_NAME_ALDERSPENSJON,
                          color: colorSerie2,
                        },
                      },
                    ],
                  },
                  {
                    name: SERIE_NAME_ALDERSPENSJON,
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
                          name: SERIE_NAME_ALDERSPENSJON,
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
        stylesMock
      )
      expect(tooltipMarkup).toContain(`800 000 kr`)
      expect(tooltipMarkup).toContain(
        `Inntekt og pensjon når du er ${alder} år`
      )
      expect(tooltipMarkup).toContain(SERIE_NAME_INNTEKT)
      expect(tooltipMarkup).toContain(SERIE_NAME_ALDERSPENSJON)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie1}`)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie2}`)
      expect(tooltipMarkup).toContain(`200 000 kr`)
      expect(tooltipMarkup).toContain(`350 000 kr`)
      expect(tooltipMarkup).toContain(beregnetLinePosition)
      expect(tooltipMarkup).toMatchSnapshot()

      const div = document.createElement('div')
      div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
      document.body.appendChild(div)

      onVisFlereAarClick()

      const tooltipMarkupAfterScroll = tooltipFormatter(
        context as unknown as TooltipFormatterContextObject,
        stylesMock
      )
      expect(tooltipMarkupAfterScroll).toMatchSnapshot()
      expect(tooltipMarkupAfterScroll).toContain(
        beregnetLinePositionAfterScroll
      )
    })
  })

  describe('getHoverColor og getNormalColor', () => {
    test.each([
      ['var(--a-deepblue-500)', 'var(--a-deepblue-200)'],
      ['var(--a-green-400)', 'var(--a-green-200)'],
      ['var(--a-purple-400)', 'var(--a-purple-200)'],
      ['var(--a-gray-500)', 'var(--a-gray-300)'],
      ['#FF0000', ''],
    ])('returnerer riktig hover farge for: %s', async (a, expected) => {
      const color = getHoverColor(a)
      expect(color).toEqual(expected)
    })

    test.each([
      ['var(--a-deepblue-200)', 'var(--a-deepblue-500)'],
      ['var(--a-green-200)', 'var(--a-green-400)'],
      ['var(--a-purple-200)', 'var(--a-purple-400)'],
      ['var(--a-gray-300)', 'var(--a-gray-500)'],
      ['var(--a-deepblue-500)', 'var(--a-deepblue-500)'],
      ['var(--a-green-400)', 'var(--a-green-400)'],
      ['var(--a-purple-400)', 'var(--a-purple-400)'],
      ['var(--a-gray-500)', 'var(--a-gray-500)'],
    ])('returnerer riktig normal farge for: %s', async (a, expected) => {
      const color = getNormalColor(a)
      expect(color).toEqual(expected)
    })
  })

  describe('onPointClick og onPointUnclick', () => {
    const pointUpdateMock = vi.fn()
    const redrawMock = vi.fn()
    const tooltipRefreshMock = vi.fn()
    const tooltipUpdateMock = vi.fn()

    const data1 = [
      {
        index: 0,
        color: 'var(--a-deepblue-500)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 1,
        color: 'var(--a-deepblue-500)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 2,
        color: 'var(--a-deepblue-200)',
        update: pointUpdateMock,
      } as unknown as Point,
    ]
    const data2 = [
      {
        index: 0,
        color: 'var(--a-green-400)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 1,
        color: 'var(--a-green-400)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 2,
        color: 'var(--a-green-200)',
        update: pointUpdateMock,
      } as unknown as Point,
    ]
    const data3 = [
      {
        index: 0,
        color: 'var(--a-purple-400)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 1,
        color: 'var(--a-purple-400)',
        update: pointUpdateMock,
      } as unknown as Point,
      {
        index: 2,
        color: 'var(--a-purple-200)',
        update: pointUpdateMock,
      } as unknown as Point,
    ]

    const chart = {
      tooltip: {
        isHidden: false,
        update: tooltipUpdateMock,
        refresh: tooltipRefreshMock,
      },
      series: [
        {
          data: [...data1],
        },
        {
          data: [...data2],
        },
        {
          data: [...data3],
        },
      ],
      xAxis: [
        {
          labelGroup: {
            element: {
              childNodes: [
                <HTMLDivElement>document.createElement('text'),
                <HTMLDivElement>document.createElement('text'),
                <HTMLDivElement>document.createElement('text'),
              ],
            },
          },
        },
      ],
    }

    describe('onPointClick', () => {
      it('oppdaterer fargen på kolonnen som er valgt og de som ikke er det samt label i xAxis', () => {
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
          [{ color: 'var(--a-green-200)' }, false],
          [{ color: 'var(--a-purple-200)' }, false],
        ])
        expect(
          (point.series.chart.xAxis[0] as ExtendedAxis).labelGroup.element
            .childNodes
        ).toMatchSnapshot()
        expect(redrawMock).toHaveBeenCalledOnce()
        expect(tooltipRefreshMock).toHaveBeenCalledOnce()
      })

      describe('onPointUnclick', () => {
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
          vi.useFakeTimers()
          const chartWithSelection = {
            ...chart,
            redraw: redrawMock,
            tooltip: {
              update: tooltipUpdateMock,
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
            [{ color: 'var(--a-green-400)' }, false],
            [{ color: 'var(--a-purple-400)' }, false],
          ])
          expect(
            (chartWithSelection.xAxis[0] as ExtendedAxis).labelGroup.element
              .childNodes
          ).toMatchSnapshot()
          expect(redrawMock).toHaveBeenCalledOnce()
          expect(tooltipUpdateMock).toHaveBeenCalledOnce()
        })

        it('kaller resetColumnColors og nullstiller fargen på alle kolonnene når brukeren klikker utenfor plot area og at tooltip er skjult', () => {
          vi.useFakeTimers()
          const chartWithSelection = {
            ...chart,
            redraw: redrawMock,
            tooltip: {
              update: tooltipUpdateMock,
              isHidden: true,
            },
          } as unknown as Chart
          onPointUnclick({} as unknown as MouseEvent, chartWithSelection)
          vi.advanceTimersByTime(150)
          expect(pointUpdateMock).toHaveBeenCalledTimes(3)
          expect(pointUpdateMock.mock.calls).toEqual([
            [{ color: 'var(--a-deepblue-500)' }, false],
            [{ color: 'var(--a-green-400)' }, false],
            [{ color: 'var(--a-purple-400)' }, false],
          ])
          expect(
            (chartWithSelection.xAxis[0] as ExtendedAxis).labelGroup.element
              .childNodes
          ).toMatchSnapshot()
          expect(redrawMock).toHaveBeenCalledOnce()
          expect(tooltipUpdateMock).toHaveBeenCalledOnce()
        })
      })
    })

    describe('getChartOptions', () => {
      it('returnerer riktig default options', () => {
        const options = getChartOptions(
          {} as Partial<typeof globalClassNames>,
          vi.fn(),
          vi.fn()
        )
        expect(options).toMatchSnapshot()
      })
    })

    describe('onVisFlereAarClick og onVisFaerreAarClick', () => {
      it('finner riktig element og øker scrollLeft', () => {
        const div = document.createElement('div')
        div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
        document.body.appendChild(div)
        expect(div.scrollLeft).toBe(0)
        onVisFlereAarClick()
        expect(
          (document.querySelector(highchartsScrollingSelector) as HTMLElement)
            .scrollLeft
        ).toBe(50)
        onVisFlereAarClick()
        expect(
          (document.querySelector(highchartsScrollingSelector) as HTMLElement)
            .scrollLeft
        ).toBe(100)
        onVisFaerreAarClick()
        expect(
          (document.querySelector(highchartsScrollingSelector) as HTMLElement)
            .scrollLeft
        ).toBe(50)
        onVisFaerreAarClick()
        expect(
          (document.querySelector(highchartsScrollingSelector) as HTMLElement)
            .scrollLeft
        ).toBe(0)
      })
    })

    describe('handleChartScroll', () => {
      it('skjuler tooltip og kaller resetColumnColors når brukeren ikke beveger scroll-posisjonen allikevel', () => {
        vi.useFakeTimers()
        const showRightButtonMock = vi.fn()
        const showLeftButtonMock = vi.fn()
        const mockedEvent = {
          currentTarget: {
            scrollLeft: 150,
            handleButtonVisibility: {
              showRightButton: showRightButtonMock,
              showLeftButton: showLeftButtonMock,
            },
          },
        }
        const chartWithSelection = {
          ...chart,
          redraw: redrawMock,
          tooltip: {
            update: tooltipUpdateMock,
            isHidden: false,
          },
        } as unknown as Chart
        handleChartScroll(mockedEvent as unknown as Event, {
          chart: { ...chartWithSelection } as unknown as Chart,
          scrollPosition: 100,
        })
        vi.advanceTimersByTime(150)
        expect(redrawMock).toHaveBeenCalledOnce()
      })
      describe('Gitt at brukeren scroller', () => {
        it('Viser ingen knapp når det ikke er mer innhold og at graffens scroll posisjon er på 0', () => {
          const showRightButtonMock = vi.fn()
          const showLeftButtonMock = vi.fn()

          const mockedEvent = {
            currentTarget: {
              scrollLeft: 0,
              scrollWidth: 366,
              offsetWidth: 366,
              handleButtonVisibility: {
                showRightButton: showRightButtonMock,
                showLeftButton: showLeftButtonMock,
              },
            },
          }
          handleChartScroll(mockedEvent as unknown as Event, {
            chart: undefined,
            scrollPosition: undefined,
          })
          expect(showRightButtonMock).toHaveBeenCalledWith(false)
          expect(showLeftButtonMock).toHaveBeenCalledWith(false)
        })

        it('Viser Flere år knapp og skjuler Færre år knapp når det er mer innhold og at graffens scroll posisjon er på 0', () => {
          const showRightButtonMock = vi.fn()
          const showLeftButtonMock = vi.fn()

          const mockedEvent = {
            currentTarget: {
              scrollLeft: 0,
              scrollWidth: 500,
              offsetWidth: 366,
              handleButtonVisibility: {
                showRightButton: showRightButtonMock,
                showLeftButton: showLeftButtonMock,
              },
            },
          }
          handleChartScroll(mockedEvent as unknown as Event, {
            chart: undefined,
            scrollPosition: undefined,
          })
          expect(showRightButtonMock).toHaveBeenCalledWith(true)
          expect(showLeftButtonMock).toHaveBeenCalledWith(false)
        })

        it('Skjuler Flere år knapp og viser Færre år knapp når graffens scroll posisjon er på maks', () => {
          const showRightButtonMock = vi.fn()
          const showLeftButtonMock = vi.fn()

          const mockedEvent = {
            currentTarget: {
              scrollLeft: 50,
              offsetWidth: 450,
              scrollWidth: 500,
              handleButtonVisibility: {
                showRightButton: showRightButtonMock,
                showLeftButton: showLeftButtonMock,
              },
            },
          }
          handleChartScroll(mockedEvent as unknown as Event, {
            chart: undefined,
            scrollPosition: undefined,
          })
          expect(showRightButtonMock).toHaveBeenCalledWith(false)
          expect(showLeftButtonMock).toHaveBeenCalledWith(true)
        })

        it('Viser både Flere år knapp og Færre år knapp når graffens scroll posisjon er et sted i midten', () => {
          const showRightButtonMock = vi.fn()
          const showLeftButtonMock = vi.fn()

          const mockedEvent = {
            currentTarget: {
              scrollLeft: 50,
              offsetWidth: 100,
              scrollWidth: 500,
              handleButtonVisibility: {
                showRightButton: showRightButtonMock,
                showLeftButton: showLeftButtonMock,
              },
            },
          }
          handleChartScroll(mockedEvent as unknown as Event, {
            chart: undefined,
            scrollPosition: undefined,
          })
          expect(showRightButtonMock).toHaveBeenCalledWith(true)
          expect(showLeftButtonMock).toHaveBeenCalledWith(true)
        })
      })
    })
  })
})
