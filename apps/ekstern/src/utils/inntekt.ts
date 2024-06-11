export const formatInntekt = (amount?: number | string | null): string => {
  if (amount === null || amount === undefined || amount === '') return ''
  const integerAmount =
    typeof amount === 'string'
      ? parseInt(amount.replace(/\D+/g, ''), 10)
      : amount

  return !isNaN(integerAmount)
    ? Intl.NumberFormat('nb-NO', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(integerAmount)
    : ''
}

export const formatInntektToNumber = (s?: string) => {
  if (!s) return 0
  const inntekt = parseInt(s.replace(/[^-0-9]/g, ''), 10)
  return !isNaN(inntekt) ? inntekt : 0
}

export const updateAndFormatInntektFromInputField = (
  inputElement: HTMLInputElement | null,
  inntekt: string,
  updateInntekt: (s: string) => void,
  updateValidationErrors: (s: string) => void
) => {
  const inntektContainsOnlyZeroAndWhitespace = /^[0\s]*$/
  if (!inntektContainsOnlyZeroAndWhitespace.test(inntekt)) {
    const caretPosition = inputElement?.selectionStart ?? 0
    const antallTegnBefore = inntekt.length
    const formatertInntekt = formatInntekt(inntekt)
    const antallTegnAfter = formatertInntekt.length

    updateInntekt(formatertInntekt)
    updateValidationErrors('')

    setTimeout(() => {
      const updatedCaretPosition =
        antallTegnAfter > antallTegnBefore
          ? caretPosition + 1
          : antallTegnAfter < antallTegnBefore
            ? caretPosition - 1
            : caretPosition
      inputElement?.setSelectionRange(
        updatedCaretPosition,
        updatedCaretPosition
      )
    }, 10)
  } else {
    updateInntekt(inntekt)
    updateValidationErrors('')
  }
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

  if (!/^[0-9\s\-.]+$/.test(input)) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_modal.textfield.validation_error.type'
    )
  } else if (parseInt(input as string, 10) > 100000000) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_modal.textfield.validation_error.max'
    )
  }
  return isValid
}
