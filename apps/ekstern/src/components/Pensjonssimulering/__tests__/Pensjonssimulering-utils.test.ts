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
  simulateDataArray,
  simulateTjenestepensjon,
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

  describe('simulateTjenestepensjon', () => {
    it('returnerer en liste med 0 t.o.m. alder 66 og 0 på siste plass i lista', () => {
      expect(simulateTjenestepensjon(65, 70, 100)).toEqual([
        0, 0, 0, 2300, 2300, 2300, 0,
      ])
      expect(simulateTjenestepensjon(62, 78, 200)).toEqual([
        0, 0, 0, 0, 0, 0, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000, 4000,
        4000, 4000, 0,
      ])
    })

    it('øker beløpet på tjenestepensjon basert på startAge', () => {
      expect(simulateTjenestepensjon(62, 72, 100)[6]).toEqual(2000)
      expect(simulateTjenestepensjon(65, 72, 100)[6]).toEqual(2300)
      expect(simulateTjenestepensjon(67, 72, 100)[1]).toEqual(2500)
      expect(simulateTjenestepensjon(70, 72, 100)[1]).toEqual(2800)
    })

    it('thrower dersom endAge < startAge eller at startAge er mindre enn 60', () => {
      expect(() => simulateTjenestepensjon(65, 64)).toThrow()
      expect(() => simulateTjenestepensjon(60, 65)).toThrow()
    })
  })

  describe('generateXAxis', () => {
    it('returnerer array med to verdier når start og slutt er like', () => {
      const alderArray = generateXAxis(0, 0)
      expect(alderArray).toHaveLength(2)

      const alderArray2 = generateXAxis(62, 62)
      expect(alderArray2).toHaveLength(2)
      expect(alderArray2[0]).toBe('61')
      expect(alderArray2[1]).toBe('61+')
    })

    it('returnerer tomt array når alderSlutt er før alderStart', () => {
      const alderArray = generateXAxis(67, 62)
      expect(alderArray).toHaveLength(0)

      const alderArray2 = generateXAxis(0, -2)
      expect(alderArray2).toHaveLength(0)
    })

    it('returnerer array med alle årene fra og med ett år før alderStart til og med alderSlutt når alderStart er før alderSlutt', () => {
      const alderArray = generateXAxis(62, 75)
      expect(alderArray).toHaveLength(15)
      expect(alderArray).toEqual([
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
        '74+',
      ])
    })

    it('returnerer array med alle årene fra og med ett år før alderStart til og med alderSlutt når tallene er negative', () => {
      const alderArray = generateXAxis(-4, 2)
      expect(alderArray).toHaveLength(8)
      expect(alderArray).toEqual(['-5', '-4', '-3', '-2', '-1', '0', '1', '1+'])
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
      ['#868F9C', '#AfAfAf'],
      ['#FF0000', ''],
    ])('returnerer riktig hover farge for: %s', async (a, expected) => {
      const color = getHoverColor(a)
      expect(color).toEqual(expected)
    })

    test.each([
      ['var(--a-deepblue-200)', 'var(--a-deepblue-500)'],
      ['var(--a-green-200)', 'var(--a-green-400)'],
      ['var(--a-purple-200)', 'var(--a-purple-400)'],
      ['#AfAfAf', '#868F9C'],
      ['var(--a-deepblue-500)', 'var(--a-deepblue-500)'],
      ['var(--a-green-400)', 'var(--a-green-400)'],
      ['var(--a-purple-400)', 'var(--a-purple-400)'],
      ['#868F9C', '#868F9C'],
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
