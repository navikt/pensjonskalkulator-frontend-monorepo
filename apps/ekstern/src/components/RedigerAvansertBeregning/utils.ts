// TODO skrive tester
export const validateInput = (
  inputData: FormData,
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
) => {
  const uttaksgradData = inputData.get('uttaksgrad')

  const avansertBeregningFormatertUttaksalderHelePensjonData = inputData.get(
    'uttaksalder-hele-pensjon'
  )
  const avansertBeregningFormatertUttaksalderGradertPensjonData = inputData.get(
    'uttaksalder-gradert-pensjon'
  )

  let isValid = true

  // Sjekker at uttaksgrad er fylt ut med en prosent
  if (!uttaksgradData || /^[^0-9]+$/.test(uttaksgradData as string)) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return { ...prevState, uttaksgrad: true }
    })
  }

  // Sjekker at uttaksalder for hele pensjon er fylt ut med en alder
  if (
    !avansertBeregningFormatertUttaksalderHelePensjonData ||
    /^[^0-9]+$/.test(
      avansertBeregningFormatertUttaksalderHelePensjonData as string
    )
  ) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return { ...prevState, 'uttaksalder-hele-pensjon': true }
    })
  }

  // Sjekker at uttaksalder for gradert pensjon er fylt ut med en alder (gitt at uttaksgrad er ulik 100 %)
  if (
    uttaksgradData !== '100 %' &&
    (!avansertBeregningFormatertUttaksalderGradertPensjonData ||
      /^[^0-9]+$/.test(
        avansertBeregningFormatertUttaksalderGradertPensjonData as string
      ))
  ) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return { ...prevState, 'uttaksalder-gradert-pensjon': true }
    })
  }

  return isValid
}
