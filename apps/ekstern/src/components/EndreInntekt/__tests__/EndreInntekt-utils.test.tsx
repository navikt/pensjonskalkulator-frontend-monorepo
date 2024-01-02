import { validateInntektInput } from '../utils'

describe('EndreInntekt-utils', () => {
  describe('validateInntektInput', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    const updateValidationErrorMessageMock = vi.fn()

    it('returnerer false med riktig feilmelding når input er tomt', async () => {
      expect(
        validateInntektInput(undefined, updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntektInput('', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        2,
        'inntekt.endre_inntekt_modal.textfield.validation_error.required'
      )
    })

    it('returnerer false med riktig feilmelding når input er noe annet enn tall mellom 0-9 med/uten mellomrom', async () => {
      expect(
        validateInntektInput('qwerty', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntektInput('123.43', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntektInput('123,45', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntektInput('-25', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(
        validateInntektInput('-', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        5,
        'inntekt.endre_inntekt_modal.textfield.validation_error.type'
      )
    })

    it('returnerer false med riktig feilmelding når input oversiger maks beløpet', async () => {
      expect(
        validateInntektInput('100000001', updateValidationErrorMessageMock)
      ).toBeFalsy()
      expect(updateValidationErrorMessageMock).toHaveBeenNthCalledWith(
        1,
        'inntekt.endre_inntekt_modal.textfield.validation_error.max'
      )
    })

    it('returnerer true uten feilmelding når input er riktig', async () => {
      expect(
        validateInntektInput('500000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntektInput('500 000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntektInput('0', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntektInput('100000000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(
        validateInntektInput('100 000 000', updateValidationErrorMessageMock)
      ).toBeTruthy()
      expect(updateValidationErrorMessageMock).not.toHaveBeenCalled()
    })
  })
})
