export const formatWithoutDecimal = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return ''
  return Intl.NumberFormat('nb-NO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const validateInntekt = (
  input: string | null | undefined,
  updateValidationErrorMessage: (s: string) => void,
  isRequired: boolean = true
) => {
  let isValid = true

  if (input === null || input === undefined || input === '') {
    if (isRequired) {
      isValid = false
      updateValidationErrorMessage(
        'inntekt.endre_inntekt_modal.textfield.validation_error.required'
      )
    } else {
      isValid = true
    }
    return isValid
  }
  const s = input.replace(/ /g, '')

  if (isNaN(s as unknown as number) || !/^[0-9]+$/.test(s)) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_modal.textfield.validation_error.type'
    )
  } else if (parseInt(s as string, 10) > 100000000) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_modal.textfield.validation_error.max'
    )
  }
  console.log('>>> validateInntekt', isValid, input)
  return isValid
}
