import { describe, expect, it } from 'vitest'
import { PensjonsavtaleType } from '@/types/enums'

import {
  isPensjonsberegningArray,
  isPerson,
  isUnleashToggle,
  isUttaksalder,
  isPensjonsavtale,
  isSomeEnumKey,
} from '../typeguards'

describe('Typeguards', () => {
  describe('isPensjonsberegningArray', () => {
    it('returnerer true når typen er riktig', () => {
      expect(isPensjonsberegningArray([])).toBeTruthy()
      expect(
        isPensjonsberegningArray([
          {
            belop: 2,
            alder: 3,
          },
        ])
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsberegning inneholder noe annet enn number', () => {
      expect(isPensjonsberegningArray(undefined)).toBeFalsy()
      expect(
        isPensjonsberegningArray([
          {
            beloep: 1,
            alder: 2,
          },
        ])
      ).toBeFalsy()
    })
  })

  describe('isPensjonsavtale', () => {
    it('returnerer true når typen er riktig', () => {
      expect(isPensjonsavtale([])).toBeTruthy()
      expect(
        isPensjonsavtale([
          {
            navn: 'Storebrand',
            type: 'PRIVAT_TP',
            startAar: 67,
            startMaaned: 1,
            sluttAar: 77,
            sluttMaaned: 1,
            grad: 100,
            beholdning: 39582,
          },
        ])
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsavtale ikke inneholder alle forventet keys', () => {
      expect(isPensjonsavtale(undefined)).toBeFalsy()
      expect(
        isPensjonsavtale([
          {
            navn: 'Storebrand',
            type: 'PRIVAT_TP',
            startAar: 67,
            startMaaned: 1,

            grad: 100,
          },
        ])
      ).toBeFalsy()
    })

    it('returnerer false når typen er undefined eller at Pensjonsavtale ikke inneholder riktig type', () => {
      expect(isPensjonsavtale(undefined)).toBeFalsy()
      expect(
        isPensjonsavtale([
          {
            navn: 'Storebrand',
            type: 'RANDOM_TYPE',
            startAar: 67,
            startMaaned: 1,
            grad: 100,
            beholdning: 39582,
          },
        ])
      ).toBeFalsy()
    })
  })

  describe('isTidligsteUttaksalder', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isUttaksalder({
          aar: 12,
          maaned: 2,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at TidligsteMuligeUttaksalder inneholder noe annet enn number', () => {
      expect(isUttaksalder(undefined)).toBeFalsy()
      expect(isUttaksalder([])).toBeFalsy()
      expect(isUttaksalder({})).toBeFalsy()
      expect(
        isUttaksalder({
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

  describe('isSomeEnumKey', () => {
    it('returnerer false når typen ikke er riktig', () => {
      expect(isSomeEnumKey(PensjonsavtaleType)('RANDOM')).toBeFalsy()
    })
    it('returnerer true når typen er riktig', () => {
      expect(isSomeEnumKey(PensjonsavtaleType)('INNSKUDD')).toBeTruthy()
    })
  })
})
