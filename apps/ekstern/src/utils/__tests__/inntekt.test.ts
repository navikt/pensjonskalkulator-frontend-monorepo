import { describe, expect, it } from 'vitest'

import { formatWithoutDecimal, validateInntekt } from '../inntekt'

describe('inntekt-utils', () => {
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

    it('returnerer riktig string når amount kommer som string', () => {
      expect(formatWithoutDecimal('')).toBe('')
      expect(formatWithoutDecimal('0')).toBe('0')
      expect(formatWithoutDecimal('123000')).toBe('123 000')
    })
  })

  describe('validateInntekt', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    const updateValidationErrorMessageMock = vi.fn()

    it('Gitt at input er required (default), returnerer false med riktig feilmelding når input er tomt', async () => {
      expect(
        validateInntekt(undefined, updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(validateInntekt('', updateValidationErrorMessageMock)).toBeFalsy()
      expect(
        validateInntekt(null, updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        3,
        'inntekt.endre_inntekt_modal.textfield.validation_error.required'
      )
    })

    it('Gitt at input ikke er required, returnerer true med riktig feilmelding når input er tomt', async () => {
      expect(
        validateInntekt(undefined, updateValidationErrorMessageMock, false)
      ).toBeTruthy()
      expect(
        validateInntekt('', updateValidationErrorMessageMock, false)
      ).toBeTruthy()
      expect(
        validateInntekt(undefined, updateValidationErrorMessageMock, false)
      ).toBeTruthy()
    })

    it('returnerer false med riktig feilmelding når input er noe annet enn tall mellom 0-9 med/uten mellomrom', async () => {
      expect(
        validateInntekt('qwerty', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('123.43', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('123,45', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('-25', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(validateInntekt('-', updateValidationErrorMessageMock)).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        5,
        'inntekt.endre_inntekt_modal.textfield.validation_error.type'
      )
    })

    it('returnerer false med riktig feilmelding når input oversiger maks beløpet', async () => {
      expect(
        validateInntekt('100000001', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        1,
        'inntekt.endre_inntekt_modal.textfield.validation_error.max'
      )
    })

    it('returnerer true uten feilmelding når input er riktig', async () => {
      expect(
        validateInntekt('500000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntekt('500 000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntekt('0', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntekt('100000000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntekt('100 000 000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(updateValidationErrorMessageMock).not.toHaveBeenCalled()
    })
  })
})
