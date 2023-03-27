import { describe, expect, it } from 'vitest'

import { getBarChartHeight, findMaxValue } from './../utils'

describe('BarChart-utils', () => {
  describe('getBarChartHeight', () => {
    it('returnerer 0 når value er 0 ', () => {
      const height = getBarChartHeight(0, 0, 0)
      expect(height).toBe(0)

      const height2 = getBarChartHeight(0, 123)
      expect(height2).toBe(0)

      const height3 = getBarChartHeight(0, 123, 456)
      expect(height3).toBe(0)
    })
    it('beregner riktig høyde når maxValue er større enn maxHeight', () => {
      const height = getBarChartHeight(12, 500)
      expect(height).toBe(3.072)
    })
    it('beregner riktig høyde med maxValue og maxHeight', () => {
      const height = getBarChartHeight(12, 500, 300)
      expect(height).toBe(7.2)
    })
  })

  describe('findMaxValue', () => {
    it('returnerer 0 når data er et tomt array', () => {
      const value = findMaxValue([])
      expect(value).toBe(0)
    })

    it('returnerer den ene verdien når data inneholder én verdi', () => {
      const data = [
        {
          label: 'random label',
          value: 123,
        },
      ]
      const value = findMaxValue(data)
      expect(value).toBe(123)
    })

    it('returnerer den høyeste verdien når data inneholder flere verdier', () => {
      const data = [
        {
          label: 'random label 1',
          value: 456,
        },
        {
          label: 'random label 2',
          value: 1,
        },

        {
          label: 'random label 3',
          value: 123,
        },
      ]
      const value = findMaxValue(data)
      expect(value).toBe(456)
    })
  })
})
