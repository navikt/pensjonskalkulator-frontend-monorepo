import { describe, expect, it } from 'vitest'

import { isFoedtFoer1963, isFoedtFoer1964 } from '../alder'

describe('alder-utils', () => {
  describe('isFoedtFoer1963', () => {
    it.skip('returnerer false når datoen er ugydlig', () => {
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
    it.skip('returnerer false når datoen er ugydlig', () => {
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
