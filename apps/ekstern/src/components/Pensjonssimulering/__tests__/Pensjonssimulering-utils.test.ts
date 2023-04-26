import * as Highcharts from 'highcharts'
import { describe, expect, it } from 'vitest'

import {
  generateXAxis,
  labelFormatter,
  onVisFlereAarClick,
  simulateDataArray,
  tooltipFormatter,
} from '../utils'

describe('Pensjonssimulering-utils', () => {
  describe('simulateDataArray', () => {
    it('returnerer riktig array ', () => {
      expect(simulateDataArray([], 10)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 0)).toHaveLength(0)
      expect(simulateDataArray([1, 2, 3], 10)).toHaveLength(3)
      expect(simulateDataArray([1, 2, 3, 4, 5, 6], 2)).toHaveLength(2)
    })
  })

  describe('labelFormatter', () => {
    it('returnerer riktig streng når verdien er under 1000', () => {
      const thisIsThat = {
        value: 300,
      } as Highcharts.AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('300')
    })
    it('returnerer riktig streng når verdien er lik 1000', () => {
      const thisIsThat = {
        value: 1000,
      } as Highcharts.AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('1000')
    })
    it('returnerer riktig streng når verdien er over 1000', () => {
      const thisIsThat = {
        value: 1000000,
      } as Highcharts.AxisLabelsFormatterContextObject
      const a = labelFormatter.bind(thisIsThat)
      expect(a()).toBe('1000')
    })
  })

  describe('tooltipFormatter', () => {
    it('returnerer riktig streng når verdien er under 1000', () => {
      const thisIsThat = {
        x: 63,
        y: 300000,
        series: { name: 'lorem ipsum' },
      } as Highcharts.TooltipFormatterContextObject
      const a = tooltipFormatter.bind(thisIsThat)
      expect(a()).toBe('<b>63</b><br/>lorem ipsum: 300000<br/>Total: x')
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
})
