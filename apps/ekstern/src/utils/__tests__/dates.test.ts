import { validateDateEndUserFormat } from '../dates'

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
})
