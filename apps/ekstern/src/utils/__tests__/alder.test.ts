import { IntlShape } from 'react-intl'

import { describe, expect, it } from 'vitest'

import {
  formatUttaksalder,
  unformatUttaksalder,
  isFoedtFoer1963,
  isFoedtFoer1964,
  isAlderOverMinUttaksaar,
  getAlderPlus1Maaned,
  getAlderMinus1Maaned,
  transformUttaksalderToDate,
  transformMaanedToDate,
  validateAlderFromForm,
} from '../alder'

describe('alder-utils', () => {
  describe('formatUttaksalder', () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape

    it('returnerer riktig streng med år og måned', () => {
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 3,
        })
      ).toBe('62 alder.aar string.og 3 alder.maaneder')
    })
    it('returnerer riktig streng med år og uten måned', () => {
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 0,
        })
      ).toBe('62 alder.aar')
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 1,
        })
      ).toBe('62 alder.aar string.og 1 alder.maaned')
    })
    it('returnerer riktig streng med år og kompakt måned', () => {
      expect(
        formatUttaksalder(intlMock, { aar: 62, maaneder: 3 }, { compact: true })
      ).toBe('62 alder.aar string.og 3 alder.md')
    })
  })

  describe('unformatUttaksalder', () => {
    it('returnerer riktig aar og maaned', () => {
      expect(
        unformatUttaksalder('random string without number (feil)')
      ).toEqual({ aar: 0, maaneder: 0 })
      expect(unformatUttaksalder('67 alder.aar')).toEqual({
        aar: 67,
        maaneder: 0,
      })
      expect(unformatUttaksalder('62 alder.aar og 5 alder.maaneder')).toEqual({
        aar: 62,
        maaneder: 5,
      })
    })
  })

  describe('isFoedtFoer1963', () => {
    it('returnerer false når datoen er ugydlig', () => {
      expect(isFoedtFoer1963('')).toBeFalsy()
      expect(isFoedtFoer1963(' ')).toBeFalsy()
      expect(isFoedtFoer1963('tullball')).toBeFalsy()
    })
    it('returnerer false når datoen er fom. 1963', () => {
      expect(isFoedtFoer1963('1963-01-01')).toBeFalsy()
      expect(isFoedtFoer1963('1963-04-30')).toBeFalsy()
      expect(isFoedtFoer1963('1965-12-04')).toBeFalsy()
    })
    it('returnerer true når datoen er før 1963', () => {
      expect(isFoedtFoer1963('1962-12-31')).toBeTruthy()
      expect(isFoedtFoer1963('1960-04-30')).toBeTruthy()
      expect(isFoedtFoer1963('1945-12-04')).toBeTruthy()
    })
  })

  describe('isFoedtFoer1964', () => {
    it('returnerer false når datoen er ugydlig', () => {
      expect(isFoedtFoer1964('')).toBeFalsy()
      expect(isFoedtFoer1964(' ')).toBeFalsy()
      expect(isFoedtFoer1964('tullball')).toBeFalsy()
    })
    it('returnerer false når datoen er fom. 1964', () => {
      expect(isFoedtFoer1964('1964-01-01')).toBeFalsy()
      expect(isFoedtFoer1964('1964-04-30')).toBeFalsy()
      expect(isFoedtFoer1964('1965-12-04')).toBeFalsy()
    })
    it('returnerer true når datoen er før 1964', () => {
      expect(isFoedtFoer1964('1963-12-31')).toBeTruthy()
      expect(isFoedtFoer1964('1960-04-30')).toBeTruthy()
      expect(isFoedtFoer1964('1945-12-04')).toBeTruthy()
    })
  })

  describe('isAlderOverMinUttaksaar', () => {
    it('returnerer false når alderen er lik eller under 62 år', () => {
      expect(isAlderOverMinUttaksaar({ aar: 61, maaneder: 11 })).toBeFalsy()
      expect(isAlderOverMinUttaksaar({ aar: 62, maaneder: 0 })).toBeFalsy()
    })

    it('returnerer true når alderen er over 62 år', () => {
      expect(isAlderOverMinUttaksaar({ aar: 62, maaneder: 1 })).toBeTruthy()

      expect(isAlderOverMinUttaksaar({ aar: 62, maaneder: 2 })).toBeTruthy()
      expect(isAlderOverMinUttaksaar({ aar: 63, maaneder: 0 })).toBeTruthy()
      expect(isAlderOverMinUttaksaar({ aar: 70, maaneder: 0 })).toBeTruthy()
    })
  })

  describe('getAlderPlus1Maaned', () => {
    it('returnerer riktig alder med en måned mellom 1-10', () => {
      const alder = getAlderPlus1Maaned({ aar: 63, maaneder: 3 })
      expect(alder.aar).toBe(63)
      expect(alder.maaneder).toBe(4)
    })

    it('returnerer riktig alder med måned 0', () => {
      const alder = getAlderPlus1Maaned({ aar: 63, maaneder: 0 })
      expect(alder.aar).toBe(63)
      expect(alder.maaneder).toBe(1)
    })

    it('returnerer riktig alder med måned 11', () => {
      const alder = getAlderPlus1Maaned({ aar: 63, maaneder: 11 })
      expect(alder.aar).toBe(64)
      expect(alder.maaneder).toBe(0)
    })
  })

  describe('getAlderMinus1Maaned', () => {
    it('returnerer riktig alder med en måned mellom 1-10', () => {
      const alder = getAlderMinus1Maaned({ aar: 63, maaneder: 3 })
      expect(alder.aar).toBe(63)
      expect(alder.maaneder).toBe(2)
    })

    it('returnerer riktig alder med måned 0', () => {
      const alder = getAlderMinus1Maaned({ aar: 63, maaneder: 0 })
      expect(alder.aar).toBe(62)
      expect(alder.maaneder).toBe(11)
    })

    it('returnerer riktig alder med måned 11', () => {
      const alder = getAlderMinus1Maaned({ aar: 63, maaneder: 11 })
      expect(alder.aar).toBe(63)
      expect(alder.maaneder).toBe(10)
    })
  })

  describe('transformUttaksalderToDate', () => {
    it('returnerer riktig dato', () => {
      const foedselsdato = '1970-04-15'
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 0 }, foedselsdato)
      ).toBe('01.05.2040')
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 7 }, foedselsdato)
      ).toBe('01.12.2040')
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 8 }, foedselsdato)
      ).toBe('01.01.2041')
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 11 }, foedselsdato)
      ).toBe('01.04.2041')
    })
  })

  describe('transformMaanedToDate', () => {
    it('returnerer riktig måned basert på locale', () => {
      const foedselsdato = '1970-04-15'
      expect(transformMaanedToDate(0, foedselsdato, 'nb')).toBe('mai')
      expect(transformMaanedToDate(7, foedselsdato, 'nb')).toBe('des.')
      expect(transformMaanedToDate(8, foedselsdato, 'nb')).toBe('jan.')
      expect(transformMaanedToDate(11, foedselsdato, 'nb')).toBe('apr.')
      expect(transformMaanedToDate(0, foedselsdato, 'en')).toBe('May')
    })
  })

  describe('validateAlderFromForm', () => {
    it('returnerer false og viser riktig feilmelding når alder er null eller undefined ', () => {
      const updateValidationMessageMock = vi.fn()
      expect(
        validateAlderFromForm(undefined, updateValidationMessageMock)
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        1,
        'agepicker.validation_error.aar'
      )
      expect(
        validateAlderFromForm(null, updateValidationMessageMock)
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        2,
        'agepicker.validation_error.aar'
      )
    })

    it('returnerer false og viser riktig feilmelding når aar mangler, er null, undefined eller er noe annet enn tall to siffer', () => {
      const updateValidationMessageMock = vi.fn()
      expect(
        validateAlderFromForm(
          { aar: undefined, maaneder: 6 },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        1,
        'agepicker.validation_error.aar'
      )
      expect(
        validateAlderFromForm(
          { aar: null, maaneder: 6 },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        2,
        'agepicker.validation_error.aar'
      )
      expect(
        validateAlderFromForm(
          { aar: 'ghjk', maaneder: 6 },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        3,
        'agepicker.validation_error.aar'
      )
      expect(
        validateAlderFromForm(
          { aar: 999, maaneder: 6 },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        3,
        'agepicker.validation_error.aar'
      )
    })
    it('returnerer false og viser riktig feilmelding når måned mangler, er null, undefined eller er noe annet enn tall', () => {
      const updateValidationMessageMock = vi.fn()
      expect(
        validateAlderFromForm(
          { aar: 67, maaneder: undefined },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        1,
        'agepicker.validation_error.maaneder'
      )
      expect(
        validateAlderFromForm(
          { aar: 67, maaneder: null },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        2,
        'agepicker.validation_error.maaneder'
      )
      expect(
        validateAlderFromForm(
          { aar: 67, maaneder: 'ghjk' },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        3,
        'agepicker.validation_error.maaneder'
      )
      expect(
        validateAlderFromForm(
          { aar: 67, maaneder: 999 },
          updateValidationMessageMock
        )
      ).toBeFalsy()
      expect(updateValidationMessageMock).toHaveBeenNthCalledWith(
        3,
        'agepicker.validation_error.maaneder'
      )
    })
  })
})
