export const validateInntektInput = (
  s: string | undefined,
  updateValidationErrorMessage: (s: string) => void
) => {
  let isValid = true
  if (s === undefined || s === '') {
    isValid = false
    updateValidationErrorMessage(
      'grunnlag.inntekt.inntektmodal.textfield.validation_error.required'
    )
  } else if (isNaN(s as unknown as number) || !/^[0-9]+$/.test(s)) {
    isValid = false
    updateValidationErrorMessage(
      'grunnlag.inntekt.inntektmodal.textfield.validation_error.type'
    )
  } else if (parseInt(s as string, 10) > 100000000) {
    isValid = false
    updateValidationErrorMessage(
      'grunnlag.inntekt.inntektmodal.textfield.validation_error.max'
    )
  }
  return isValid
}
