import { IntlShape } from 'react-intl'

import { add, endOfDay, format } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  formatUttaksalder,
  unformatUttaksalder,
  isFoedtFoer1963,
  isFoedtFoer1964,
  isAlderLikEllerOverAnnenAlder,
  isAlderOverAnnenAlder,
  isFoedselsdatoOverAlder,
  getAlderPlus1Maaned,
  getAlderMinus1Maaned,
  getBrukerensAlderISluttenAvMaaneden,
  transformFoedselsdatoToAlder,
  transformFoedselsdatoToAlderMinus1md,
  transformUttaksalderToDate,
  transformMaanedToDate,
  validateAlderFromForm,
  getMaanedString,
  formaterSluttAlderString,
  formaterLivsvarigString,
  isOvergangskull,
  isAlderOver,
  getAlderFromFoedselsdato,
} from '../alder'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'

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

  describe('isAlderOverAnnenAlder', () => {
    const minsteAlder = { aar: 62, maaneder: 3 }
    it('returnerer true når stoersteAlder er over den andre alderen', () => {
      expect(
        isAlderOverAnnenAlder({ aar: 62, maaneder: 4 }, minsteAlder)
      ).toBeTruthy()
      expect(
        isAlderOverAnnenAlder({ aar: 63, maaneder: 0 }, minsteAlder)
      ).toBeTruthy()
      expect(
        isAlderOverAnnenAlder({ aar: 70, maaneder: 0 }, minsteAlder)
      ).toBeTruthy()
    })

    it('returnerer false når stoersteAlder er lik eller under den andre alderen', () => {
      expect(
        isAlderOverAnnenAlder({ aar: 62, maaneder: 3 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderOverAnnenAlder({ aar: 62, maaneder: 0 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderOverAnnenAlder({ aar: 62, maaneder: 1 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderOverAnnenAlder({ aar: 61, maaneder: 11 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderOverAnnenAlder({ aar: 61, maaneder: 0 }, minsteAlder)
      ).toBeFalsy()
    })
  })

  describe('isAlderLikEllerOverAnnenAlder', () => {
    const minsteAlder = { aar: 67, maaneder: 3 }
    it('returnerer true når stoersteAlder er lik eller over den andre alderen', () => {
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 68 }, minsteAlder)
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 67, maaneder: 0 },
          { aar: 67, maaneder: 0 }
        )
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 67, maaneder: 3 }, minsteAlder)
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 67, maaneder: 11 }, minsteAlder)
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 70, maaneder: 3 }, minsteAlder)
      ).toBeTruthy()
    })

    it('returnerer false når stoersteAlder er under den andre alderen', () => {
      expect(isAlderLikEllerOverAnnenAlder({}, minsteAlder)).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ maaneder: 6 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 62 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 62, maaneder: 1 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 67, maaneder: 0 }, minsteAlder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ aar: 67, maaneder: 2 }, minsteAlder)
      ).toBeFalsy()
    })
  })

  describe('isFoedselsdatoOverAlder', () => {
    const minsteAlder = { aar: 62, maaneder: 0 }

    it('returnerer false når fødselsdatoen gir færre aar', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -61,
        months: -11,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeFalsy()
    })

    it('returnerer false når fødselsdatoen gir færre måneder', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
        months: -4,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(
        isFoedselsdatoOverAlder(foedselsdato, { aar: 62, maaneder: 5 })
      ).toBeFalsy()
    })

    it('returnerer false når fødselsdatoen gir samme antall aar og måneder', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeFalsy()
    })

    it('returnerer false når fødselsdatoen gir samme antall aar og måneder, og flere dager', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-02-15'))
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
        days: -5,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeFalsy()
    })

    it('returnerer true når fødselsdatoen gir samme antall aar og flere måneder', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
        months: -5,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeTruthy()
    })

    it('returnerer true når fødselsdatoen gir flere aar', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -63,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeTruthy()
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

  describe('getBrukerensAlderISluttenAvMaaneden', () => {
    const nedreAldersgrense = { aar: 62, maaneder: 0 }

    it('returnerer nedre aldersgrense når person er undefined', () => {
      const expectedAlder = getBrukerensAlderISluttenAvMaaneden(
        undefined,
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual(nedreAldersgrense)
    })

    it('returnerer alderen til personen når alderen er over nedre aldersgrense', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-04'))

      // Brukeren er 65 år, 0 md og 3 dager den 4. januar 2025
      const expectedAlder = getBrukerensAlderISluttenAvMaaneden(
        '1960-01-01',
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 65, maaneder: 0 })
      vi.useRealTimers()
    })

    it('returnerer nedre aldersgrense når alderen er lik nedre aldersgrense', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))

      // Brukeren er 62 år og 0 md den 1. januar 2025
      const expectedAlder = getBrukerensAlderISluttenAvMaaneden(
        '1963-01-01',
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 62, maaneder: 0 })
      vi.useRealTimers()
    })

    it('returnerer alderen til personen når alderen er nedre aldersgrense + 1 måned', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))

      // Brukeren er 62 år og 1 md den 1. januar 2025
      const expectedAlder = getBrukerensAlderISluttenAvMaaneden(
        '1962-12-01',
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 62, maaneder: 1 })
      vi.useRealTimers()
    })

    it('returnerer nedre aldersgrense når alderen er under nedre aldersgrense', () => {
      const expectedAlder = getBrukerensAlderISluttenAvMaaneden(
        '1970-01-01',
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual(nedreAldersgrense)
    })
  })

  describe('transformUttaksalderToDate', () => {
    it('returnerer riktig dato når foedselsdato er første eller siste i måned', () => {
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 0 }, '1970-01-01')
      ).toBe('01.02.2040')
      expect(
        transformUttaksalderToDate({ aar: 70, maaneder: 0 }, '1970-01-31')
      ).toBe('01.02.2040')
    })
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
    it('returnerer riktig måned når dagen er første eller siste i måned', () => {
      expect(transformMaanedToDate(8, '1970-01-31', 'nb')).toBe('okt.')
      expect(transformMaanedToDate(8, '1970-12-01', 'nb')).toBe('sep.')
    })

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

  describe('transformFoedselsdatoToAlder', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2030-06-06'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('returnerer riktig alder når datoen er én måned før fødselsdatoen', () => {
      const expectedAlder = transformFoedselsdatoToAlder('1970-07-06')
      expect(expectedAlder).toStrictEqual({ aar: 59, maaneder: 11 })
    })

    it('returnerer riktig alder når datoen er på samme måned som fødselsdatoen', () => {
      expect(transformFoedselsdatoToAlder('1970-06-01')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
      expect(transformFoedselsdatoToAlder('1970-06-06')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
      expect(transformFoedselsdatoToAlder('1970-06-30')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
    })

    it('returnerer riktig alder når datoen er én måned etter fødselsdatoen', () => {
      expect(transformFoedselsdatoToAlder('1970-05-01')).toStrictEqual({
        aar: 60,
        maaneder: 1,
      })
      expect(transformFoedselsdatoToAlder('1970-05-06')).toStrictEqual({
        aar: 60,
        maaneder: 1,
      })
      expect(transformFoedselsdatoToAlder('1970-05-31')).toStrictEqual({
        aar: 60,
        maaneder: 1,
      })
    })

    it('returnerer riktig alder når datoen bikker over et år', () => {
      expect(transformFoedselsdatoToAlder('1969-06-01')).toStrictEqual({
        aar: 61,
        maaneder: 0,
      })
      expect(transformFoedselsdatoToAlder('1969-05-01')).toStrictEqual({
        aar: 61,
        maaneder: 1,
      })
    })
  })

  describe('transformFoedselsdatoToAlderMinus1md', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2030-06-06'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('returnerer riktig alder når datoen er én måned før fødselsdatoen', () => {
      const expectedAlder = transformFoedselsdatoToAlderMinus1md('1970-07-06')
      expect(expectedAlder).toStrictEqual({ aar: 59, maaneder: 10 })
    })

    it('returnerer riktig alder når datoen er på samme måned som fødselsdatoen', () => {
      expect(transformFoedselsdatoToAlderMinus1md('1970-06-01')).toStrictEqual({
        aar: 59,
        maaneder: 11,
      })
      expect(transformFoedselsdatoToAlderMinus1md('1970-06-06')).toStrictEqual({
        aar: 59,
        maaneder: 11,
      })
      expect(transformFoedselsdatoToAlderMinus1md('1970-06-30')).toStrictEqual({
        aar: 59,
        maaneder: 11,
      })
    })

    it('returnerer riktig alder når datoen er én måned etter fødselsdatoen', () => {
      expect(transformFoedselsdatoToAlderMinus1md('1970-05-01')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
      expect(transformFoedselsdatoToAlderMinus1md('1970-05-06')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
      expect(transformFoedselsdatoToAlderMinus1md('1970-05-31')).toStrictEqual({
        aar: 60,
        maaneder: 0,
      })
    })

    it('returnerer riktig alder når datoen bikker over et år', () => {
      expect(transformFoedselsdatoToAlderMinus1md('1969-06-01')).toStrictEqual({
        aar: 60,
        maaneder: 11,
      })
      expect(transformFoedselsdatoToAlderMinus1md('1969-05-01')).toStrictEqual({
        aar: 61,
        maaneder: 0,
      })
    })
  })

  describe('getMaanedString', () => {
    it('returnerer tom streng når måned er undefined eller lik 0', () => {
      const mockFn = vi.fn()
      expect(getMaanedString(mockFn)).toEqual('')
      expect(getMaanedString(mockFn, 0)).toEqual('')
      expect(mockFn).not.toHaveBeenCalled()
    })
    it('returnerer riktig streng når måned er større enn 0', () => {
      const mockFn = vi.fn().mockReturnValue('string')
      expect(getMaanedString(mockFn, 1)).toEqual(' string 1 string')
      expect(mockFn).toHaveBeenNthCalledWith(1, {
        id: 'string.og',
      })
      expect(mockFn).toHaveBeenNthCalledWith(2, {
        id: 'alder.md',
      })
      expect(getMaanedString(mockFn, 5)).toEqual(' string 5 string')
    })
  })

  describe('formaterSluttAlderString', () => {
    it('returnerer riktig formatert streng', () => {
      const intlMock = {
        formatMessage: (s: { id: string }) => s.id,
      } as unknown as IntlShape

      expect(
        formaterSluttAlderString(
          intlMock,
          { aar: 67, maaneder: 3 },
          { aar: 67, maaneder: 6 }
        )
      ).toBe(
        'String.fra 67 alder.aar string.og 3 alder.md string.til 67 alder.aar string.og 6 alder.md'
      )
      expect(
        formaterSluttAlderString(
          intlMock,
          { aar: 67, maaneder: 0 },
          { aar: 67, maaneder: 11 }
        )
      ).toBe('String.fra 67 alder.aar string.til 67 alder.aar')
    })
  })

  describe('formaterLivsvarigString', () => {
    it('returnerer riktig formatert streng for livsvarig', () => {
      const intlMock = {
        formatMessage: (s: { id: string }) => s.id,
      } as unknown as IntlShape

      expect(formaterLivsvarigString(intlMock, { aar: 67, maaneder: 3 })).toBe(
        'alder.livsvarig 67 alder.aar string.og 3 alder.md'
      )
      expect(formaterLivsvarigString(intlMock, { aar: 67, maaneder: 0 })).toBe(
        'alder.livsvarig 67 alder.aar'
      )
    })
  })

  describe('isOvergangskull', () => {
    it('før overgangskull', () => {
      const foedselsdato = '1953-12-31'

      const actual = isOvergangskull(foedselsdato)
      expect(actual).toBe(false)
    })

    it('start av overgangskull', () => {
      const foedselsdato = '1954-01-01'

      const actual = isOvergangskull(foedselsdato)
      expect(actual).toBe(true)
    })

    it('slutt av overgangskull', () => {
      const foedselsdato = '1962-12-31'

      const actual = isOvergangskull(foedselsdato)
      expect(actual).toBe(true)
    })

    it('etter overgangskull', () => {
      const foedselsdato = '1963-01-01'

      const actual = isOvergangskull(foedselsdato)
      expect(actual).toBe(false)
    })
  })

  describe('getAlderFromFoedselsdato', () => {
    beforeAll(() => {
      vi.useFakeTimers().setSystemTime(new Date('2025-06-06'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('faketimers is set', () => {
      const today = new Date()
      expect(format(today, 'yyyy-MM-dd')).toBe('2025-06-06')
    })

    it('is 63 år today', () => {
      const foedselsdato = '1962-06-06'
      const age = getAlderFromFoedselsdato(foedselsdato)

      expect(age).toBe(63)
    })

    it('is 63 år tomorrow', () => {
      const foedselsdato = '1962-06-07'
      const age = getAlderFromFoedselsdato(foedselsdato)

      expect(age).toBe(62)
    })
  })

  describe('isAlderOver', () => {
    beforeAll(() => {
      vi.useFakeTimers().setSystemTime(new Date('2025-06-06'))
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    it('faketimers is set', () => {
      const today = new Date()
      expect(format(today, 'yyyy-MM-dd')).toBe('2025-06-06')
    })

    it('over 67 år', () => {
      const foedselsdato = '1958-06-06' // 67 today (faketimers)
      const actual = isAlderOver(67)(foedselsdato)
      expect(actual).toBe(true)
    })

    it('over 30 år', () => {
      const foedselsdato = '1967-06-06' // 58 today
      const actual = isAlderOver(30)(foedselsdato)
      expect(actual).toBe(true)
    })

    it('ikke over 63 år', () => {
      const foedselsdato = '1967-06-06' // 58 today
      const actual = isAlderOver(63)(foedselsdato)
      expect(actual).toBe(false)
    })
  })
})
