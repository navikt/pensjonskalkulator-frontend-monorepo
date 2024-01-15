import { IntlShape } from 'react-intl'

import { describe, expect, it } from 'vitest'

import {
  formatUttaksalder,
  unformatUttaksalder,
  isFoedtFoer1963,
  isFoedtFoer1964,
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
})
