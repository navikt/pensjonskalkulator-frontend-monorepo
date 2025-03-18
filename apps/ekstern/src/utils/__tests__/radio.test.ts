import {
  convertBooleanRadioToBoolean,
  convertBooleanToBooleanRadio,
} from '../radio'

describe('radio utils', () => {
  describe('convertBooleanToBooleanRadio', () => {
    it('convert true -> ja', () => {
      const actual = convertBooleanToBooleanRadio(true)
      expect(actual).toBe('ja')
    })

    it('convert false -> nei', () => {
      const actual = convertBooleanToBooleanRadio(false)
      expect(actual).toBe('nei')
    })

    it('convert null -> null', () => {
      const actual = convertBooleanToBooleanRadio(null)
      expect(actual).toBe(null)
    })
  })

  describe('convertBooleanRadioToBoolean ', () => {
    it('convert ja -> true', () => {
      const actual = convertBooleanRadioToBoolean('ja')
      expect(actual).toBe(true)
    })

    it('convert nei -> false', () => {
      const actual = convertBooleanRadioToBoolean('nei')
      expect(actual).toBe(false)
    })

    it('convert null -> null', () => {
      const actual = convertBooleanRadioToBoolean(null)
      expect(actual).toBe(null)
    })
  })
})
