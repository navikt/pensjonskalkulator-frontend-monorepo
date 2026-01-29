import { describe, expect, it } from 'vitest'

import { waitFor } from '@/test-utils'

import {
  formatDecimalWithComma,
  formatInntekt,
  formatInntektMedKr,
  formatInntektToNumber,
  updateAndFormatInntektFromInputField,
  validateInntekt,
} from '../inntekt'

describe('inntekt-utils', () => {
  describe('formatInntekt', () => {
    it('returnerer tom string når amount er null eller undefined', () => {
      expect(formatInntekt(null)).toBe('')
      expect(formatInntekt(undefined)).toBe('')
      expect(formatInntekt('')).toBe('')
    })

    it('returnerer tom string når amount er ugyldig', () => {
      expect(formatInntekt('ytr')).toBe('')
    })

    it('returnerer string uten komma når amount er 0', () => {
      expect(formatInntekt(0)).toBe('0')
    })

    it('returnerer string uten komma når amount er integer', () => {
      expect(formatInntekt(1)).toBe('1')
      expect(formatInntekt(25)).toBe('25')
      expect(formatInntekt(-4)).toBe('−4')
    })

    it('returnerer nærmeste tall når amount har ugyldige karakter', () => {
      expect(formatInntekt('100.000')).toBe('100 000')
      expect(formatInntekt('100-000')).toBe('100 000')
      expect(formatInntekt('100/000')).toBe('100 000')
    })

    it('returnerer formatert string med heltall rundet opp eller ned når amount er float', () => {
      expect(formatInntekt(100123.95)).toBe('100 124')
      expect(formatInntekt(100123.5)).toBe('100 124')
      expect(formatInntekt(100123.49)).toBe('100 123')
      expect(formatInntekt(-15.2)).toBe('−15')
    })

    it('returnerer string med mellomrom mellom hvert tredje siffer', () => {
      expect(formatInntekt(100_000)).toBe('100 000')
      expect(formatInntekt(9_999_999)).toBe('9 999 999')
    })

    it('returnerer riktig string når amount kommer som string', () => {
      expect(formatInntekt('')).toBe('')
      expect(formatInntekt('0')).toBe('0')
      expect(formatInntekt('123000')).toBe('123 000')
    })
  })

  describe('formatInntektToNumber', () => {
    it('returnerer 0 når amount er tom eller undefined', () => {
      expect(formatInntektToNumber(undefined)).toBe(0)
      expect(formatInntektToNumber('')).toBe(0)
    })

    it('returnerer 0 når amount er ugyldig', () => {
      expect(formatInntektToNumber('ytr')).toBe(0)
    })

    it('returnerer 0 når amount er 0', () => {
      expect(formatInntektToNumber('0')).toBe(0)
    })

    it('returnerer riktig tall når amount er integer', () => {
      expect(formatInntektToNumber('1')).toBe(1)
      expect(formatInntektToNumber('25')).toBe(25)
      expect(formatInntektToNumber('-4')).toBe(-4)
    })

    it('returnerer nærmeste tall når amount inneholder ugyldige tegn', () => {
      expect(formatInntektToNumber('100 000')).toBe(100000)
      expect(formatInntektToNumber('100 000')).toBe(100000)
      expect(formatInntektToNumber('100.000')).toBe(100000)
      expect(formatInntektToNumber('100/000')).toBe(100000)
      expect(formatInntektToNumber('9_999_999')).toBe(9999999)
    })
  })

  describe('updateAndFormatInntektFromInputField', () => {
    it('når input elementet er null feiler ikke funksjonen og inntekt og valideringsfeil oppdateres', () => {
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      updateAndFormatInntektFromInputField(
        null,
        '123000',
        updateInntektMock,
        updateValideringsfeilMock
      )
      expect(updateInntektMock).toHaveBeenCalled()
      expect(updateValideringsfeilMock).toHaveBeenCalled()
    })

    it('når input elementet er funnet og at input er ugyldig , formateres den ikke, og inntekt og valideringsfeil oppdateres', async () => {
      const setSelectionRangeMock = vi.fn()
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      const inputHtmlElement = {
        selectionStart: 3,
        setSelectionRange: setSelectionRangeMock,
      } as unknown as HTMLInputElement

      updateAndFormatInntektFromInputField(
        inputHtmlElement,
        'abc', // denne strenges skal ikke formateres
        updateInntektMock,
        updateValideringsfeilMock
      )

      expect(updateInntektMock).toHaveBeenCalledWith('abc')
      expect(updateValideringsfeilMock).toHaveBeenCalled()

      expect(setSelectionRangeMock).not.toHaveBeenCalled()
    })
    it('når input elementet er funnet og at input strengen inneholder bare 0 og whitespace, formateres den ikke, og inntekt og valideringsfeil oppdateres', async () => {
      const setSelectionRangeMock = vi.fn()
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      const inputHtmlElement = {
        selectionStart: 3,
        setSelectionRange: setSelectionRangeMock,
      } as unknown as HTMLInputElement

      updateAndFormatInntektFromInputField(
        inputHtmlElement,
        '00 000', // denne strenges skal ikke formateres
        updateInntektMock,
        updateValideringsfeilMock
      )

      expect(updateInntektMock).toHaveBeenCalledWith('00 000')
      expect(updateValideringsfeilMock).toHaveBeenCalled()

      expect(setSelectionRangeMock).not.toHaveBeenCalled()
    })

    it('når input elementet er funnet og at input strengen blir lik etter formatering, plasseres caret tilbake til sin opprinnelig posisjon, og inntekt og valideringsfeil oppdateres', async () => {
      const setSelectionRangeMock = vi.fn()
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      const inputHtmlElement = {
        selectionStart: 3,
        setSelectionRange: setSelectionRangeMock,
      } as unknown as HTMLInputElement

      updateAndFormatInntektFromInputField(
        inputHtmlElement,
        '100', // denne strenges skal formateres til 100, altså med samme antakk karakter
        updateInntektMock,
        updateValideringsfeilMock
      )

      expect(updateInntektMock).toHaveBeenCalled()
      expect(updateValideringsfeilMock).toHaveBeenCalled()
      await waitFor(() => {
        expect(setSelectionRangeMock).toHaveBeenCalledWith(3, 3)
      })
    })

    it('når input elementet er funnet og at input strengen blir mindre etter formatering, plasseres caret et hakk nærmere fra sin opprinnelig posisjon, og inntekt og valideringsfeil oppdateres', async () => {
      const setSelectionRangeMock = vi.fn()
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      const inputHtmlElement = {
        selectionStart: 3,
        setSelectionRange: setSelectionRangeMock,
      } as unknown as HTMLInputElement

      updateAndFormatInntektFromInputField(
        inputHtmlElement,
        '1 00', // denne strenges skal formateres til 100, altså ett karakter mindre
        updateInntektMock,
        updateValideringsfeilMock
      )

      expect(updateInntektMock).toHaveBeenCalled()
      expect(updateValideringsfeilMock).toHaveBeenCalled()
      await waitFor(() => {
        expect(setSelectionRangeMock).toHaveBeenCalledWith(2, 2)
      })
    })

    it('når input elementet er funnet og at input strengen blir større etter formatering, plasseres caret et hakk videre fra sin opprinnelig posisjon, og inntekt og valideringsfeil oppdateres', async () => {
      const setSelectionRangeMock = vi.fn()
      const updateInntektMock = vi.fn()
      const updateValideringsfeilMock = vi.fn()
      const inputHtmlElement = {
        selectionStart: 4,
        setSelectionRange: setSelectionRangeMock,
      } as unknown as HTMLInputElement

      updateAndFormatInntektFromInputField(
        inputHtmlElement,
        '123000', // denne strenges skal formateres til 123 000, altså ett karakter mer
        updateInntektMock,
        updateValideringsfeilMock
      )

      expect(updateInntektMock).toHaveBeenCalled()
      expect(updateValideringsfeilMock).toHaveBeenCalled()
      await waitFor(() => {
        expect(setSelectionRangeMock).toHaveBeenCalledWith(5, 5)
      })
    })
  })

  it('når input elementet er funnet og at ny input prøver å fjerne et mellomrom, vil caret beholde sin nye posisjon, og inntekt og valideringsfeil oppdateres', async () => {
    const setSelectionRangeMock = vi.fn()
    const updateInntektMock = vi.fn()
    const updateValideringsfeilMock = vi.fn()
    const inputHtmlElement = {
      selectionStart: 3,
      setSelectionRange: setSelectionRangeMock,
    } as unknown as HTMLInputElement

    updateAndFormatInntektFromInputField(
      inputHtmlElement,
      '123000', // denne strenges skal formateres til 123 000, altså ett karakter mer
      updateInntektMock,
      updateValideringsfeilMock
    )

    expect(updateInntektMock).toHaveBeenCalled()
    expect(updateValideringsfeilMock).toHaveBeenCalled()
    await waitFor(() => {
      expect(setSelectionRangeMock).toHaveBeenCalledWith(3, 3)
    })
  })

  it('når input elementet er funnet og at ny input sletter første tegn slik at formatert verdi blir mindre, vil caret gå til posisjon 0, og inntekt og valideringsfeil oppdateres', async () => {
    const setSelectionRangeMock = vi.fn()
    const updateInntektMock = vi.fn()
    const updateValideringsfeilMock = vi.fn()
    const inputHtmlElement = {
      selectionStart: 0,
      setSelectionRange: setSelectionRangeMock,
    } as unknown as HTMLInputElement

    updateAndFormatInntektFromInputField(
      inputHtmlElement,
      ' 123 000', // denne strenges skal formateres til 123 000, med ett tegn mindre
      updateInntektMock,
      updateValideringsfeilMock
    )

    expect(updateInntektMock).toHaveBeenCalled()
    expect(updateValideringsfeilMock).toHaveBeenCalled()
    await waitFor(() => {
      expect(setSelectionRangeMock).toHaveBeenCalledWith(0, 0)
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
      expect(
        validateInntekt(
          undefined,
          updateValidationErrorMessageMock,
          undefined,
          { required: 'requiredString', type: 'typeString', max: 'maxString' }
        )
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        3,
        'inntekt.endre_inntekt_modal.textfield.validation_error.required'
      )
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        4,
        'requiredString'
      )
    })

    it('Gitt at input ikke er required, returnerer true uten feilmelding når input er tomt', async () => {
      expect(
        validateInntekt(undefined, updateValidationErrorMessageMock, false)
      ).toBeTruthy()
      expect(
        validateInntekt('', updateValidationErrorMessageMock, false)
      ).toBeTruthy()
      expect(
        validateInntekt(undefined, updateValidationErrorMessageMock, false)
      ).toBeTruthy()
      expect(updateValidationErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false med riktig feilmelding når input er noe annet enn tall mellom 0-9 med/uten mellomrom, bindestrekk eller punktum', async () => {
      expect(
        validateInntekt('qwerty', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('qwerty', updateValidationErrorMessageMock, undefined, {
          required: 'requiredString',
          type: 'typeString',
          max: 'maxString',
        })
      ).toBeFalsy()
      expect(
        validateInntekt('123,45', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('123/45', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt('-25', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(validateInntekt('-', updateValidationErrorMessageMock)).toBeFalsy()
      expect(
        validateInntekt('123.43', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        1,
        'inntekt.endre_inntekt_modal.textfield.validation_error.type'
      )
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        2,
        'typeString'
      )
    })

    it('returnerer false med riktig feilmelding når input oversiger maks beløpet', async () => {
      expect(
        validateInntekt('100000001', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntekt(
          '100000001',
          updateValidationErrorMessageMock,
          undefined,
          {
            required: 'requiredString',
            type: 'typeString',
            max: 'maxString',
          }
        )
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        1,
        'inntekt.endre_inntekt_modal.textfield.validation_error.max'
      )
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        2,
        'maxString'
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

  describe('formatInntektMedKr', () => {
    it('returnerer formattert beløp med "kr" for gitt beløp', () => {
      expect(formatInntektMedKr(12345)).toMatch(/12\s345\s*kr/)
      expect(formatInntektMedKr(0)).toBe('0\u00A0kr')
    })

    it('returnerer tom streng når beløp er undefined', () => {
      expect(formatInntektMedKr(undefined)).toBe('')
    })

    it('returnerer tom streng når beløp er null', () => {
      expect(formatInntektMedKr(null as unknown as number)).toBe('')
    })
  })

  describe('formatDecimalWithComma', () => {
    it('returnerer string med komma som desimalseparator for desimaltall', () => {
      expect(formatDecimalWithComma(5.4)).toBe('5,4')
      expect(formatDecimalWithComma(3.14159)).toBe('3,14159')
      expect(formatDecimalWithComma(0.5)).toBe('0,5')
      expect(formatDecimalWithComma(12.345)).toBe('12,345')
    })

    it('returnerer string uten komma når value er heltall', () => {
      expect(formatDecimalWithComma(3)).toBe('3')
      expect(formatDecimalWithComma(0)).toBe('0')
      expect(formatDecimalWithComma(100)).toBe('100')
      expect(formatDecimalWithComma(-5)).toBe('-5')
    })

    it('returnerer string med komma for negative desimaltall', () => {
      expect(formatDecimalWithComma(-5.4)).toBe('-5,4')
      expect(formatDecimalWithComma(-0.5)).toBe('-0,5')
    })
  })
})
