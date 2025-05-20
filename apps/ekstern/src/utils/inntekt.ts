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

export const validateInntekt = (
  input: string | null | undefined,
  updateValidationErrorMessage?: (s: string) => void,
  isRequired: boolean = true,
  validationStrings?: {
    required?: string
    type?: string
    max?: string
  }
) => {
  let isValid = true

  if (input === null || input === undefined || input === '') {
    if (isRequired) {
      isValid = false
      if (updateValidationErrorMessage) {
        updateValidationErrorMessage(
          validationStrings?.required ??
            'inntekt.endre_inntekt_modal.textfield.validation_error.required'
        )
      }
    } else {
      isValid = true
    }
    return isValid
  }

  if (!/^[0-9\s]+$/.test(input)) {
    isValid = false
    if (updateValidationErrorMessage) {
      updateValidationErrorMessage(
        validationStrings?.type ??
          'inntekt.endre_inntekt_modal.textfield.validation_error.type'
      )
    }
  } else if (parseInt(input.replace(/\D+/g, ''), 10) > 100000000) {
    isValid = false
    if (updateValidationErrorMessage) {
      updateValidationErrorMessage(
        validationStrings?.max ??
          'inntekt.endre_inntekt_modal.textfield.validation_error.max'
      )
    }
  }
  return isValid
}

export const updateAndFormatInntektFromInputField = (
  inputElement: HTMLInputElement | null,
  inntekt: string,
  updateInntekt: (s: string) => void,
  updateValidationErrors: (s: string) => void
) => {
  const isInntektValid = validateInntekt(inntekt, undefined, false)

  const inntektContainsOnlyZeroAndWhitespace = /^[0\s]*$/
  if (isInntektValid && !inntektContainsOnlyZeroAndWhitespace.test(inntekt)) {
    const caretPosition = inputElement?.selectionStart ?? 0
    const antallTegnBefore = inntekt.length
    const formatertInntekt = formatInntekt(inntekt)
    const antallTegnAfter = formatertInntekt.length
    const charAtCaret = formatertInntekt[Math.max(caretPosition, 0)]

    updateInntekt(formatertInntekt)
    updateValidationErrors('')

    setTimeout(() => {
      let updatedCaretPosition = caretPosition

      if (antallTegnAfter > antallTegnBefore && charAtCaret === '\u00A0') {
        updatedCaretPosition = caretPosition
      } else if (antallTegnAfter > antallTegnBefore) {
        updatedCaretPosition = caretPosition + 1
      } else if (antallTegnAfter < antallTegnBefore) {
        updatedCaretPosition = Math.max(caretPosition - 1, 0)
      }

      inputElement?.setSelectionRange(
        updatedCaretPosition,
        updatedCaretPosition
      )
    }, 0)
  } else {
    updateInntekt(inntekt)
    updateValidationErrors('')
  }
}
