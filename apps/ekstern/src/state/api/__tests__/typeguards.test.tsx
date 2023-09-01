import { describe, expect, it } from 'vitest'
import { PensjonsavtaleKategori } from '@/types/enums'

import {
  isPensjonsavtale,
  isPensjonsberegningArray,
  isPerson,
  isTpoMedlemskap,
  isUnleashToggle,
  isUttaksalder,
  isSomeEnumKey,
} from '../typeguards'

describe('Typeguards', () => {
  describe('isPensjonsavtale', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAlder: 67,
          startMaaned: 1,
          utbetalingsperioder: {
            startAlder: 67,
            startMaaned: 1,
            sluttAlder: 77,
            sluttMaaned: 1,
            aarligUtbetaling: 39582,
            grad: 100,
          },
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsavtale ikke inneholder alle forventet keys', () => {
      expect(isPensjonsavtale(undefined)).toBeFalsy()
      expect(isPensjonsavtale({})).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAlder: 67,
          startMaaned: 1,
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAlder: 67,
          startMaaned: 1,
          utbetalingsperioder: {
            startAlder: 67,
            startMaaned: 1,
            grad: 100,
          },
        })
      ).toBeFalsy()
    })

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

  describe('isPerson', () => {
    it('returnerer true når input er et Person-objekt', () => {
      expect(
        isPerson({
          fornavn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et Person-objekt', () => {
      expect(isPerson(undefined)).toEqual(false)
      expect(isPerson(null)).toEqual(false)
      expect(isPerson({})).toEqual(false)
      expect(isPerson({ fornavn: 'Ola', sivilstand: 'GIFT' })).toEqual(false)
      expect(
        isPerson({
          fornavn: 'Ola',
          sivilstand: 'LOREMIPSUM',
          foedselsdato: null,
        })
      ).toEqual(false)
      expect(
        isPerson({
          fornavn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: 'abc',
        })
      ).toEqual(false)
      expect(isPerson({ fornavn: 'Ola', foedselsdato: '1963-04-30' })).toEqual(
        false
      )
      expect(isPerson({ sivilstand: 'GIFT' })).toEqual(false)
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

  describe('isTpoMedlemskap', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isTpoMedlemskap({
          harTjenestepensjonsforhold: false,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at UnleashToggle inneholder noe annet', () => {
      expect(isTpoMedlemskap(undefined)).toBeFalsy()
      expect(isTpoMedlemskap([])).toBeFalsy()
      expect(isTpoMedlemskap({})).toBeFalsy()
      expect(
        isTpoMedlemskap({
          harTjenestepensjonsforhold: 'string',
        })
      ).toBeFalsy()
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
      expect(isSomeEnumKey(PensjonsavtaleKategori)('RANDOM')).toBeFalsy()
    })
    it('returnerer true når typen er riktig', () => {
      expect(
        isSomeEnumKey(PensjonsavtaleKategori)('INDIVIDUELL_ORDNING')
      ).toBeTruthy()
    })
  })
})
