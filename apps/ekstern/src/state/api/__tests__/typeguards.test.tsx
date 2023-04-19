import { describe, expect, it } from 'vitest'

import {
  isPensjonsberegning,
  isTidligsteMuligeUttaksalder,
} from '../typeguards'

describe('Typeguards', () => {
  describe('isPensjonsberegning', () => {
    it('returnerer true når typen er riktig', () => {
      expect(isPensjonsberegning([])).toBeTruthy()
      expect(
        isPensjonsberegning([
          {
            pensjonsaar: 1,
            pensjonsbeloep: 2,
            alder: 3,
          },
        ])
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsberegning inneholder noe annet enn number', () => {
      expect(isPensjonsberegning(undefined)).toBeFalsy()
      expect(
        isPensjonsberegning([
          {
            pensjonsaar: 'string',
            pensjonsbeloep: 1,
            alder: 2,
          },
        ])
      ).toBeFalsy()
    })
  })

  describe('isTidligsteUttaksalder', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isTidligsteMuligeUttaksalder({
          aar: 12,
          maaned: 2,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at TidligsteMuligeUttaksalder inneholder noe annet enn number', () => {
      expect(isTidligsteMuligeUttaksalder(undefined)).toBeFalsy()
      /* @ts-ignore */
      expect(isPensjonsberegning({})).toBeFalsy()
      expect(
        isPensjonsberegning({
          /* @ts-ignore */
          aar: 'string',
          maaned: 2,
        })
      ).toBeFalsy()
    })
  })
})
