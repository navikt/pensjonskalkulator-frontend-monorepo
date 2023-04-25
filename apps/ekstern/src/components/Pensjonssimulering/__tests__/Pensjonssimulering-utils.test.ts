import * as Highcharts from 'highcharts'
import { describe, expect, it, vi } from 'vitest'

import {
  simulateDataArray,
  labelFormatter,
  tooltipFormatter,
  onVisFlereAarClick,
} from '../utils'
import { waitFor } from '@/test-utils'

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
})
