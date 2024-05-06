import { describe, expect, it } from 'vitest'
import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

import {
  isInntekt,
  isPensjonsavtale,
  isPensjonsberegningArray,
  isAfpOffentlig,
  isPerson,
  isEkskludertStatus,
  isUfoeregrad,
  isTpoMedlemskap,
  isUtbetalingsperiode,
  isUnleashToggle,
  isAlder,
  isSomeEnumKey,
} from '../typeguards'
import { trackOrSetValue } from '@testing-library/user-event/dist/types/document/trackValue'
import { af } from 'date-fns/locale'

describe('Typeguards', () => {
  describe('isInntekt', () => {
    it('returnerer true når input er et Inntekt-objekt', () => {
      expect(
        isInntekt({
          beloep: 500000,
          aar: 2021,
        })
      ).toEqual(true)
    })

    it('returnerer true når input er et Inntekt-objekt med 0 verdier', () => {
      expect(
        isInntekt({
          beloep: 0,
          aar: 0,
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et Inntekt-objekt', () => {
      expect(isInntekt(undefined)).toEqual(false)
      expect(isInntekt(null)).toEqual(false)
      expect(isInntekt({})).toEqual(false)
      expect(isInntekt({ beloep: 500000 })).toEqual(false)
      expect(isInntekt({ beloep: 500000, aar: '2021' })).toEqual(false)
      expect(isInntekt({ aar: 2021 })).toEqual(false)
      expect(isInntekt({ beloep: '500000', aar: 2021 })).toEqual(false)
    })
  })

  describe('isUtbetalingsperiode', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Utbetalingsperiode ikke inneholder alle forventet keys', () => {
      expect(isUtbetalingsperiode(undefined)).toBeFalsy()
      expect(isUtbetalingsperiode({})).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 'abc', maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 'abc' },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 'abc',
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 'abc',
        })
      ).toBeFalsy()
    })
    it('returnerer false når Utbetalingsperiode har feil sluttAlder eller sluttMaaned', () => {
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          sluttAlder: { aar: 'abc', maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 'abc' },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
    })
  })

  describe('isPensjonsavtale', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeTruthy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsavtale ikke inneholder alle forventet keys eller har feil utbetalingsperiode', () => {
      expect(isPensjonsavtale(undefined)).toBeFalsy()
      expect(isPensjonsavtale({})).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'RANDOM KATEGORI',
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [
            {
              startAlder: { aar: 'abc', maaneder: 0 },
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
    })
    it('returnerer false når Pensjonsavtale har feil startAar eller startMaaned', () => {
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 'abc',
          sluttAar: 67,
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 62,
          sluttAar: 'abc',
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
    })
  })

  describe('isPensjonsberegningArray', () => {
    it('returnerer true når typen er riktig', () => {
      expect(isPensjonsberegningArray([])).toBeTruthy()
      expect(
        isPensjonsberegningArray([
          {
            beloep: 2,
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
          },
        ])
      ).toBeFalsy()
      expect(
        isPensjonsberegningArray([
          {
            beloep: 1,
            alder: 'abc',
          },
        ])
      ).toBeFalsy()
    })
  })

  describe('isAfpOffentlig', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isAfpOffentlig({
          afpLeverandoer: 'KLP',
          afpOffentligListe: [],
        })
      ).toBeTruthy()

      expect(
        isAfpOffentlig({
          afpLeverandoer: 'KLP',
          afpOffentligListe: [
            {
              beloep: 2,
              alder: 3,
            },
          ],
        })
      ).toBeTruthy()
    })

    it('returnerer false når typen er undefined, har feil leverandør eller at Pensjonsberegning i listen har feil type', () => {
      expect(isAfpOffentlig(undefined)).toBeFalsy()

      expect(
        isAfpOffentlig({
          afpLeverandoer: 123,
          afpOffentligListe: [
            {
              beloep: 2,
              alder: 3,
            },
          ],
        })
      ).toBeFalsy()
      expect(
        isAfpOffentlig({
          afpLeverandoer: 'KLP',
          afpOffentligListe: [
            {
              beloep: 2,
            },
          ],
        })
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

  describe('isAlder', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isAlder({
          aar: 12,
          maaneder: 2,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Tidligst Mulig Uttak inneholder noe annet enn number', () => {
      expect(isAlder(undefined)).toBeFalsy()
      expect(isAlder([])).toBeFalsy()
      expect(isAlder({})).toBeFalsy()
      expect(
        isAlder({
          aar: 'string',
          maaneder: 2,
        })
      ).toBeFalsy()
    })
  })

  describe('isEkskludertStatus', () => {
    it('returnerer true når input er et EkskludertStatus-objekt', () => {
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et EkskludertStatus-objekt', () => {
      expect(isEkskludertStatus(undefined)).toEqual(false)
      expect(isEkskludertStatus(null)).toEqual(false)
      expect(isEkskludertStatus({})).toEqual(false)
      expect(isEkskludertStatus({ ekskludert: true })).toEqual(false)
      expect(isEkskludertStatus({ aarsak: 'ER_APOTEKER' })).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: null,
          aarsak: 'ER_APOTEKER',
        })
      ).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: null,
        })
      ).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: 'abc',
        })
      ).toEqual(false)
    })
  })

  describe('isUfoeregrad', () => {
    it('returnerer true når input er et Ufoeregrad-objekt', () => {
      expect(
        isUfoeregrad({
          ufoeregrad: 75,
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et Ufoeregrad-objekt', () => {
      expect(isUfoeregrad(undefined)).toEqual(false)
      expect(isUfoeregrad(null)).toEqual(false)
      expect(isUfoeregrad({})).toEqual(false)
      expect(isUfoeregrad({ random: 75 })).toEqual(false)
      expect(isUfoeregrad({ ufoeregrad: null })).toEqual(false)
      expect(isUfoeregrad({ ufoeregrad: {} })).toEqual(false)
      expect(isUfoeregrad({ ufoeregrad: '75' })).toEqual(false)
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
      expect(isSomeEnumKey(pensjonsavtalerKategoriMapObj)('RANDOM')).toBeFalsy()
    })
    it('returnerer true når typen er riktig', () => {
      expect(
        isSomeEnumKey(pensjonsavtalerKategoriMapObj)('INDIVIDUELL_ORDNING')
      ).toBeTruthy()
    })
  })
})
