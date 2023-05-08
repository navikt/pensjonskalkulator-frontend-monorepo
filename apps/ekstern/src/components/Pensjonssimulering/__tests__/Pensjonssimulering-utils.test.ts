import {
  AxisLabelsFormatterContextObject,
  TooltipFormatterContextObject,
} from 'highcharts'
import { describe, expect, it } from 'vitest'

import {
  simulateDataArray,
  simulateTjenestepensjon,
  generateXAxis,
  labelFormatter,
  tooltipFormatter,
  getChartOptions,
  onVisFlereAarClick,
  ExtendedYAxis,
  ExtendedPoint,
} from '../utils'

import globalClassNames from './Pensjonssimulering.module.scss'

describe('Pensjonssimulering-utils', () => {
  describe('simulateDataArray', () => {
    it('returnerer riktig array ', () => {
      expect(simulateDataArray([], 10)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 0)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 10)).toHaveLength(3)
      expect(simulateDataArray([1, 2, 3, 4, 5, 6], 2)).toHaveLength(2)
    })
  })

  describe('simulateTjenestepensjon', () => {
    it('returnerer en liste med 0 t.o.m. alder 66 og 0 på siste plass i lista', () => {
      expect(simulateTjenestepensjon(65, 70, 123)).toEqual([
        0, 0, 0, 123, 123, 123, 0,
      ])
      expect(simulateTjenestepensjon(62, 78, 246)).toEqual([
        0, 0, 0, 0, 0, 0, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246,
        0,
      ])
    })

    it('thrower dersom endAge < startAge', () => {
      expect(() => simulateTjenestepensjon(2, 1)).toThrow()
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
      const pointSumSerie1 = 200
      const pointSumSerie2 = 350
      const beregnetLinePosition = 'top: 265px; left: 162.5px; height: 100px'

      const point = {
        y: pointSumSerie1,
        total,
        series: {
          name: nameSerie1,
          color: colorSerie1,
          chart: { yAxis: [{ pos: 300 } as ExtendedYAxis] },
          yAxis: { height: 400 } as ExtendedYAxis,
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
      expect(tooltipMarkup).toContain(`${total} kr`)
      expect(tooltipMarkup).toContain(`Utbetaling det året du er ${alder} år`)
      expect(tooltipMarkup).toContain(nameSerie1)
      expect(tooltipMarkup).toContain(nameSerie2)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie1}`)
      expect(tooltipMarkup).toContain(`backgroundColor:${colorSerie2}`)
      expect(tooltipMarkup).toContain(`${pointSumSerie1} kr`)
      expect(tooltipMarkup).toContain(`${pointSumSerie2} kr`)
      expect(tooltipMarkup).toContain(beregnetLinePosition)
      expect(tooltipMarkup).toMatchSnapshot()
    })
  })
  describe('getChartOptions', () => {
    it('returnerer riktig default options', () => {
      const options = getChartOptions({} as Partial<typeof globalClassNames>)
      expect(options).toMatchSnapshot()
    })
  })

  describe('onVisFlereAarClick', () => {
    it('finner riktig element og øker scrollLeft', () => {
      const div = document.createElement('div')
      div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
      document.body.appendChild(div)
      expect(div.scrollLeft).toBe(0)
      onVisFlereAarClick()
      expect(
        (document.querySelector('.highcharts-scrolling') as HTMLElement)
          .scrollLeft
      ).toBe(50)
      onVisFlereAarClick()
      expect(
        (document.querySelector('.highcharts-scrolling') as HTMLElement)
          .scrollLeft
      ).toBe(100)
      div.remove()
    })
  })
})
