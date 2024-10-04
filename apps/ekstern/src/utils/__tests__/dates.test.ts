import { validateDateEndUserFormat, isVedtakBeforeNow } from '../dates'

describe('dates-utils', () => {
  describe('validateDateEndUserFormat', () => {
    it('returnerer false når datoen er null eller undefined', () => {
      expect(validateDateEndUserFormat(null)).toBeFalsy()
      expect(validateDateEndUserFormat(undefined)).toBeFalsy()
      expect(validateDateEndUserFormat('')).toBeFalsy()
    })
    it('returnerer false når datoen er ugyldig', () => {
      expect(
        validateDateEndUserFormat('2015-04-09 14:07:46.580465000')
      ).toBeFalsy()
      expect(validateDateEndUserFormat('1963-04-30')).toBeFalsy()
      expect(validateDateEndUserFormat('1963.04.30')).toBeFalsy()
      expect(validateDateEndUserFormat('lorem ipsum')).toBeFalsy()
    })
    it('returnerer true når datoen har riktig format', () => {
      expect(validateDateEndUserFormat('30.04.1963')).toBeTruthy()
    })
  })

  describe('isVedtakBeforeNow', () => {
    it('returnerer false når datoen er 1 md frem i tid', () => {
      const date = new Date()
      expect(
        isVedtakBeforeNow(new Date(date.setMonth(date.getMonth() + 1)))
      ).toBeFalsy()
    })

    it('returnerer true når datoen er samme måned', () => {
      expect(isVedtakBeforeNow(new Date())).toBeTruthy()
    })

    it('returnerer true når datoen er i fortid', () => {
      const date = new Date()
      expect(
        isVedtakBeforeNow(new Date(date.setMonth(date.getMonth() - 1)))
      ).toBeTruthy()
    })
  })
})
