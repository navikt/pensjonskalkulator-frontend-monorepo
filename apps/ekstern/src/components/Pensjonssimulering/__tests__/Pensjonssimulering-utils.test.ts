import { describe, expect, it } from 'vitest'

import { generateAlderArray } from '../utils'

describe('Pensjonssimulering-utils', () => {
  describe('generateAlderArray', () => {
    it('returnerer array med én verdi når start og slutt er like', () => {
      const alderArray = generateAlderArray(0, 0)
      expect(alderArray).toHaveLength(1)
      expect(alderArray[0]).toBe('0')

      const alderArray2 = generateAlderArray(62, 62)
      expect(alderArray2).toHaveLength(1)
      expect(alderArray2[0]).toBe('62')
    })

    it('returnerer tomt array når alderSlutt er før alderStart', () => {
      const alderArray = generateAlderArray(67, 62)
      expect(alderArray).toHaveLength(0)

      const alderArray2 = generateAlderArray(0, -2)
      expect(alderArray2).toHaveLength(0)
    })

    it('returnerer array med alle årene fra og med alderStart til og med alderSlutt når alderStart er før alderSlutt', () => {
      const alderArray = generateAlderArray(62, 75)
      expect(alderArray).toHaveLength(14)
      expect(alderArray).toEqual([
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
      ])
    })

    it('returnerer array med alle årene fra og med alderStart til og med alderSlutt når tallene er negative', () => {
      const alderArray = generateAlderArray(-4, 2)
      expect(alderArray).toHaveLength(7)
      expect(alderArray).toEqual(['-4', '-3', '-2', '-1', '0', '1', '2'])
    })
  })
})
