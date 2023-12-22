export const validateInntektInput = (
  inntektInput: string | undefined,
  updateValidationErrorMessage: (s: string) => void
) => {
  let isValid = true
  if (inntektInput === undefined || inntektInput === '') {
    isValid = false
    updateValidationErrorMessage(
      'grunnlag.inntekt.inntektmodal.textfield.validation_error.required'
    )
    return isValid
  }
  const s = inntektInput.replace(/ /g, '')

  if (isNaN(s as unknown as number) || !/^[0-9]+$/.test(s)) {
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
