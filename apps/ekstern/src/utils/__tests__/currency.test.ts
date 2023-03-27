import { describe, expect, it } from 'vitest'

import { formatAsDecimal } from '../currency'

describe('currency-utils', () => {
  describe('formatAsDecimal', () => {
    it('returnerer string uten komma når amount er 0', () => {
      expect(formatAsDecimal(0)).toBe('0')
    })

    it('returnerer string uten komma når amount er integer', () => {
      expect(formatAsDecimal(1)).toBe('1')
      expect(formatAsDecimal(25)).toBe('25')
      expect(formatAsDecimal(-4)).toBe('−4')
    })

    it('returnerer formatert string med komma når amount er float', () => {
      expect(formatAsDecimal(1.25)).toBe('1,25')
      expect(formatAsDecimal(-15.2)).toBe('−15,2')
    })
  })
})
