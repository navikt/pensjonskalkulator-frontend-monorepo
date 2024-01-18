import { validateInntekt } from '@/utils/inntekt'

// TODO skrive tester
export const validateAvansertBeregningSkjema = (
  inputData: FormData,
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
) => {
  const uttaksgradData = inputData.get('uttaksgrad')

  const avansertBeregningFormatertUttaksalderHelePensjonData = inputData.get(
    'uttaksalder-hele-pensjon'
  )
  const avansertBeregningFormatertUttaksalderGradertPensjonData = inputData.get(
    'uttaksalder-gradert-pensjon'
  )
  const avansertBeregningInntektVsaGradertPensjon = inputData.get(
    'inntekt-vsa-gradert-pensjon'
  )

  let isValid = true

  // Sjekker at uttaksgrad er fylt ut med en prosent
  if (!uttaksgradData || /^[^0-9]+$/.test(uttaksgradData as string)) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return { ...prevState, uttaksgrad: 'VALIDATION ERROR UTTAKSGRAD' }
    })
  }

  // Sjekker at inntekt vsa gradert pensjon er enten tom eller fylt ut med en gyldig string
  if (
    !validateInntekt(
      avansertBeregningInntektVsaGradertPensjon as string,
      (s: string) => {
        updateValidationErrorMessage((prevState) => {
          return { ...prevState, 'inntekt-vsa-gradert-pensjon': s }
        })
      },
      false
    )
  ) {
    isValid = false
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
      return {
        ...prevState,
        'uttaksalder-hele-pensjon': 'VALIDATION ERROR UTTAKSALDER HEL PENSJON',
      }
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
      return {
        ...prevState,
        'uttaksalder-gradert-pensjon':
          'VALIDATION ERROR UTTAKSALDER GRADERT PENSJON',
      }
    })
  }

  return isValid
}
