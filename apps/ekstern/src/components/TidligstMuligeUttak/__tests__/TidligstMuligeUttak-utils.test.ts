import { describe, expect, it } from 'vitest'

import {
  generateAlderArray,
  generateXAxis,
  formatTidligsteMuligeUttaksalder,
} from '../utils'

describe('TidligstMuligeUttak-utils', () => {
  describe('generateAlderArray', () => {
    const firstString = 'x år og x måneder'
    it('returnerer array med én verdi når start og slutt er like', () => {
      const alderArray = generateAlderArray(0, 0, firstString)
      expect(alderArray).toHaveLength(1)
      expect(alderArray[0]).toBe(firstString)

      const alderArray2 = generateAlderArray(62, 62, firstString)
      expect(alderArray2).toHaveLength(1)
      expect(alderArray2[0]).toBe(firstString)
    })

    it('returnerer tomt array når alderSlutt er før alderStart', () => {
      const alderArray = generateAlderArray(67, 62, firstString)
      expect(alderArray).toHaveLength(0)

      const alderArray2 = generateAlderArray(0, -2, firstString)
      expect(alderArray2).toHaveLength(0)
    })

    it('returnerer array med alle årene fra og med alderStart til og med alderSlutt når alderStart er før alderSlutt', () => {
      const alderArray = generateAlderArray(62, 75, firstString)
      expect(alderArray).toHaveLength(14)
      expect(alderArray).toEqual([
        firstString,
        '63 år',
        '64 år',
        '65 år',
        '66 år',
        '67 år',
        '68 år',
        '69 år',
        '70 år',
        '71 år',
        '72 år',
        '73 år',
        '74 år',
        '75 år',
      ])
    })

    describe('generateXAxis', () => {
      it('returnerer array med én verdi når start og slutt er like', () => {
        const alderArray = generateXAxis(0, 0)
        expect(alderArray).toHaveLength(1)
        expect(alderArray[0]).toBe(0)

        const alderArray2 = generateXAxis(62, 62)
        expect(alderArray2).toHaveLength(1)
        expect(alderArray2[0]).toBe(62)
      })

      it('returnerer tomt array når alderSlutt er før alderStart', () => {
        const alderArray = generateXAxis(67, 62)
        expect(alderArray).toHaveLength(0)

        const alderArray2 = generateXAxis(0, -2)
        expect(alderArray2).toHaveLength(0)
      })

      it('returnerer array med alle årene fra og med alderStart til og med alderSlutt når alderStart er før alderSlutt', () => {
        const alderArray = generateXAxis(62, 75)
        expect(alderArray).toHaveLength(14)
        expect(alderArray).toEqual([
          62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,
        ])
      })

      it('returnerer array med alle årene fra og med alderStart til og med alderSlutt når tallene er negative', () => {
        const alderArray = generateXAxis(-4, 2)
        expect(alderArray).toHaveLength(7)
        expect(alderArray).toEqual([-4, -3, -2, -1, 0, 1, 2])
      })
    })

    describe('formatTidligsteMuligeUttaksalder', () => {
      it('returnerer riktig streng med år og måned', () => {
        const streng = formatTidligsteMuligeUttaksalder({ aar: 62, maaned: 3 })
        expect(streng).toBe('62 år og 3 måneder')
      })
      it('returnerer riktig streng med år og uten  måned', () => {
        const streng = formatTidligsteMuligeUttaksalder({ aar: 62, maaned: 0 })
        expect(streng).toBe('62 år')
      })
    })
  })
})
