import { describe, expect, it } from 'vitest'

import { formatWithoutDecimal } from '../currency'

describe('currency-utils', () => {
  describe('formatWithoutDecimal', () => {
    it('returnerer tom string når amount er null eller undefined', () => {
      expect(formatWithoutDecimal(null)).toBe('')
      expect(formatWithoutDecimal(undefined)).toBe('')
    })

    it('returnerer string uten komma når amount er 0', () => {
      expect(formatWithoutDecimal(0)).toBe('0')
    })

    it('returnerer string uten komma når amount er integer', () => {
      expect(formatWithoutDecimal(1)).toBe('1')
      expect(formatWithoutDecimal(25)).toBe('25')
      expect(formatWithoutDecimal(-4)).toBe('−4')
    })

    it('returnerer formatert string med heltall rundet opp eller ned når amount er float', () => {
      expect(formatWithoutDecimal(100123.95)).toBe('100 124')
      expect(formatWithoutDecimal(100123.5)).toBe('100 124')
      expect(formatWithoutDecimal(100123.49)).toBe('100 123')
      expect(formatWithoutDecimal(-15.2)).toBe('−15')
    })

    it('returnerer string med mellomrom mellom hvert tredje siffer', () => {
      expect(formatWithoutDecimal(100_000)).toBe('100 000')
      expect(formatWithoutDecimal(9_999_999)).toBe('9 999 999')
    })
  })
})
