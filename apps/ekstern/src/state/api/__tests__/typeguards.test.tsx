import { describe, expect, it } from 'vitest'

import {
  isPensjonsberegning,
  isTidligsteMuligeUttaksalder,
  isPerson,
  isUnleashToggle,
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
      expect(isTidligsteMuligeUttaksalder([])).toBeFalsy()
      expect(isTidligsteMuligeUttaksalder({})).toBeFalsy()
      expect(
        isTidligsteMuligeUttaksalder({
          aar: 'string',
          maaned: 2,
        })
      ).toBeFalsy()
    })
  })

  describe('isPerson', () => {
    it('returnerer true når input er et Person-objekt', () => {
      expect(isPerson({ sivilstand: 'GIFT' })).toEqual(true)
    })

    it('returnerer false når input ikke er et Person-objekt', () => {
      expect(isPerson(undefined)).toEqual(false)
      expect(isPerson(null)).toEqual(false)
      expect(isPerson({})).toEqual(false)
      expect(isPerson({ sivilstand: 'SINNATAGG' }))
    })
  })

  describe('isUnleashToggle', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isUnleashToggle({
          enabled: true,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at UnleashToggle inneholder noe annet', () => {
      expect(isUnleashToggle(undefined)).toBeFalsy()
      expect(isUnleashToggle([])).toBeFalsy()
      expect(isUnleashToggle({})).toBeFalsy()
      expect(
        isUnleashToggle({
          enabled: 'string',
        })
      ).toBeFalsy()
    })
  })
})
