import {
  AxisLabelsFormatterContextObject,
  TooltipFormatterContextObject,
  Chart,
  Point,
  PointClickEventObject,
} from 'highcharts'
import { describe, expect, it, vi } from 'vitest'

import {
  highchartsScrollingSelector,
  simulateDataArray,
  simulateTjenestepensjon,
  generateXAxis,
  labelFormatter,
  tooltipFormatter,
  getHoverColor,
  getNormalColor,
  onPointClick,
  onChartClick,
  getChartOptions,
  onVisFlereAarClick,
  onVisFaerreAarClick,
  ExtendedAxis,
  ExtendedPoint,
  handleChartScroll,
  removeHandleChartScrollEventListener,
} from '../utils'

import globalClassNames from './Pensjonssimulering.module.scss'

describe('Pensjonssimulering-utils', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
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

  describe('labelFormatter', () => {
    it('returnerer riktig streng når verdien er under 1000', () => {
      const thisIsThat = {
        value: 300,
      } as AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('300')
    })
    it('returnerer riktig streng når verdien er lik 1000', () => {
      const thisIsThat = {
        value: 1000,
      } as AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('1000')
    })
    it('returnerer riktig streng når verdien er over 1000', () => {
      const thisIsThat = {
        value: 1000000,
      } as AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('1000')
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
      const nameSerie1 = 'name of my serie 1'
      const nameSerie2 = 'name of my serie 2'
      const colorSerie1 = 'lime'
      const colorSerie2 = 'salmon'
      const pointSumSerie1 = 200000
      const pointSumSerie2 = 350000
      const beregnetLinePosition = 'top: 265px; left: 162.5px; height: 100px'
      const beregnetLinePositionAfterScroll =
        'top: 265px; left: 112.5px; height: 100px'

      const point = {
        y: pointSumSerie1,
        total,
        series: {
          name: nameSerie1,
          color: colorSerie1,
          chart: { yAxis: [{ pos: 300 } as ExtendedAxis] },
          yAxis: { height: 400 } as ExtendedAxis,
        },
        point: { plotX: 129, tooltipPos: [50, 100, 120] } as ExtendedPoint,
      }

      const context = {
        x: alder,
        points: [
          {
            ...point,
          },
          {
            ...point,
            y: pointSumSerie2,
            series: {
              ...point.series,
              name: nameSerie2,
              color: colorSerie2,
            },
          },
        ],
      }
      const tooltipMarkup = tooltipFormatter(
        context as unknown as TooltipFormatterContextObject,
        stylesMock
      )
      expect(tooltipMarkup).toContain(`800 000 kr`)
      expect(tooltipMarkup).toContain(
        `Pensjon og inntekt det året du er ${alder} år`
      )
      expect(tooltipMarkup).toContain(nameSerie1)
      expect(tooltipMarkup).toContain(nameSerie2)
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

  describe('onPointClick og onChartClick', () => {
    const pointUpdateMock = vi.fn()
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
        const redrawMock = vi.fn()
        const point = {
          series: {
            chart: {
              ...chart,
              redraw: redrawMock,
            } as unknown as Chart,
          },
        } as Point
        const event = { point: { index: 0 } } as PointClickEventObject
        onPointClick.call(point, event)
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
      })
    })

    describe('onChartClick', () => {
      it('nullstiller fargene og label på xAxis', () => {
        const redrawMock = vi.fn()
        const tooltipHideMock = vi.fn()
        const chartWithSelection = {
          ...chart,
          redraw: redrawMock,
          tooltip: { hide: tooltipHideMock },
        } as unknown as Chart
        onChartClick.call(chartWithSelection)
        expect(pointUpdateMock).toHaveBeenCalledTimes(6)
        expect(pointUpdateMock.mock.calls.slice(3, 6)).toEqual([
          [{ color: 'var(--a-deepblue-500)' }, false],
          [{ color: 'var(--a-green-400)' }, false],
          [{ color: 'var(--a-purple-400)' }, false],
        ])
        expect(
          (chartWithSelection.xAxis[0] as ExtendedAxis).labelGroup.element
            .childNodes
        ).toMatchSnapshot()
        expect(redrawMock).toHaveBeenCalledOnce()
        expect(tooltipHideMock).toHaveBeenCalledOnce()
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
    it('Viser Flere år knapp og skjuler Færre år knapp når graffens scroll posisjon er på 0', () => {
      const showRightButtonMock = vi.fn()
      const showLeftButtonMock = vi.fn()

      const mockedEvent = {
        currentTarget: {
          scrollLeft: 0,
          handleButtonVisibility: {
            showRightButton: showRightButtonMock,
            showLeftButton: showLeftButtonMock,
          },
        },
      }
      handleChartScroll(mockedEvent as unknown as Event)
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
      handleChartScroll(mockedEvent as unknown as Event)
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
      handleChartScroll(mockedEvent as unknown as Event)
      expect(showRightButtonMock).toHaveBeenCalledWith(true)
      expect(showLeftButtonMock).toHaveBeenCalledWith(true)
    })
  })

  describe('removeHandleChartScrollEventListener', () => {
    it('Fjerner listener når elementet finnes i dom1en', () => {
      const fnMock = vi.fn()
      const div = document.createElement('div')
      div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
      document.body.appendChild(div)
      const el = document.querySelector('.highcharts-scrolling')
      ;(el as Element).removeEventListener = fnMock
      removeHandleChartScrollEventListener()
      expect(fnMock).toHaveBeenCalled()
    })
  })
})
