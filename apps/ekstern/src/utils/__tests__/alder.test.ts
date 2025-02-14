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
  isFoedselsdatoOverEllerLikAlder,
  getAlderPlus1Maaned,
  getAlderMinus1Maaned,
  getBrukerensAlderPlus1Maaned,
  transformFoedselsdatoToAlder,
  transformFoedselsdatoToAlderMinus1md,
  transformUttaksalderToDate,
  transformMaanedToDate,
  validateAlderFromForm,
  getMaanedString,
  formaterSluttAlderString,
  formaterLivsvarigString,
} from '../alder'
import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
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

  describe('isAlderLikEllerOverAnnenAlder', () => {
    const normertPensjonsalder = { aar: 67, maaneder: 0 }
    it('returnerer true når alderen er lik eller over ubetinget uttaksalder', () => {
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 67, maaneder: 0 },
          normertPensjonsalder
        )
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 67, maaneder: 11 },
          normertPensjonsalder
        )
      ).toBeTruthy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 70, maaneder: 3 },
          normertPensjonsalder
        )
      ).toBeTruthy()
    })

    it('returnerer false når alderen er under 67 år', () => {
      expect(
        isAlderLikEllerOverAnnenAlder({}, normertPensjonsalder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder({ maaneder: 6 }, normertPensjonsalder)
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 62, maaneder: 1 },
          normertPensjonsalder
        )
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 63, maaneder: 0 },
          normertPensjonsalder
        )
      ).toBeFalsy()
      expect(
        isAlderLikEllerOverAnnenAlder(
          { aar: 66, maaneder: 11 },
          normertPensjonsalder
        )
      ).toBeFalsy()
    })
  })

  describe('isAlderOverAnnenAlder', () => {
    it('returnerer false når alderen er lik eller under 62 år', () => {
      expect(
        isAlderOverAnnenAlder(
          { aar: 61, maaneder: 11 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeFalsy()
      expect(
        isAlderOverAnnenAlder(
          { aar: 62, maaneder: 0 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeFalsy()
    })

    it('returnerer true når alderen er over 62 år', () => {
      expect(
        isAlderOverAnnenAlder(
          { aar: 62, maaneder: 1 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeTruthy()

      expect(
        isAlderOverAnnenAlder(
          { aar: 62, maaneder: 2 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeTruthy()
      expect(
        isAlderOverAnnenAlder(
          { aar: 63, maaneder: 0 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeTruthy()
      expect(
        isAlderOverAnnenAlder(
          { aar: 70, maaneder: 0 },
          { aar: 62, maaneder: 0 }
        )
      ).toBeTruthy()
    })

    it('returnerer false når alder er lik og største alder er mindre enn minste alder', () => {
      expect(
        isAlderOverAnnenAlder(
          { aar: 62, maaneder: 1 },
          { aar: 62, maaneder: 5 }
        )
      ).toBeFalsy()
    })
  })

  describe('isFoedselsdatoOverEllerLikAlder', () => {
    const nedreAldersgrense = { aar: 62, maaneder: 0 }
    it('returnerer true når fødselsdatoen er 62 år fra nå', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(
        isFoedselsdatoOverEllerLikAlder(foedselsdato, nedreAldersgrense)
      ).toBeTruthy()
    })

    it('returnerer true når fødselsdatoen er mer enn 62 år fra nå', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -62,
        months: -5,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(
        isFoedselsdatoOverEllerLikAlder(foedselsdato, nedreAldersgrense)
      ).toBeTruthy()
    })

    it('returnerer false når fødselsdatoen er mindre enn 62 år fra nå', () => {
      const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
        years: -61,
        months: -11,
      })
      const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)
      expect(
        isFoedselsdatoOverEllerLikAlder(foedselsdato, nedreAldersgrense)
      ).toBeFalsy()
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

  describe('getBrukerensAlderPlus1Maaned', () => {
    const nedreAldersgrense = { aar: 62, maaneder: 0 }
    const person: Person = {
      ...fulfilledGetPerson['getPerson(undefined)'].data,
      sivilstand: fulfilledGetPerson['getPerson(undefined)'].data
        .sivilstand as Person['sivilstand'],
    }

    it('returnerer nedre aldersgrense når person er undefined', () => {
      const expectedAlder = getBrukerensAlderPlus1Maaned(
        undefined,
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual(nedreAldersgrense)
    })

    it('returnerer alderen til personen + 1 måned når alderen er over nedre aldersgrense', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-04'))
      const mock_person = {
        ...person,
        foedselsdato: '1960-01-01',
      }
      // Brukeren er 65 år og 0 md
      const expectedAlder = getBrukerensAlderPlus1Maaned(
        mock_person,
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 65, maaneder: 1 })
      vi.useRealTimers()
    })

    it('returnerer nedre aldersgrense når alderen er lik nedre aldersgrense', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))
      const mock_person = {
        ...person,
        foedselsdato: '1963-01-01',
      }
      // Brukeren er 62 år og 0 md
      const expectedAlder = getBrukerensAlderPlus1Maaned(
        mock_person,
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 62, maaneder: 0 })
      vi.useRealTimers()
    })

    it('returnerer alderen til personen + 1 måned når alderen er nedre aldersgrense + 1 måned', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))
      const mock_person = {
        ...person,
        foedselsdato: '1962-12-01',
      }
      // Brukeren er 62 år og 1 md
      const expectedAlder = getBrukerensAlderPlus1Maaned(
        mock_person,
        nedreAldersgrense
      )
      expect(expectedAlder).toStrictEqual({ aar: 62, maaneder: 2 })
      vi.useRealTimers()
    })

    it('returnerer nedre aldersgrense når alderen er under nedre aldersgrense', () => {
      const mock_person = {
        ...person,
        foedselsdato: '1970-01-01',
      }
      const expectedAlder = getBrukerensAlderPlus1Maaned(
        mock_person,
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
})
