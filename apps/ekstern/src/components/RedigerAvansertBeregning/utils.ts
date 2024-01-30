import { validateInntekt } from '@/utils/inntekt'

// TODO se for å gjenbruke valideringsfunksjon i utils/alder.ts
// TODO skrive tester
export const validateAvansertBeregningSkjema = (
  inputData: FormData,
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
) => {
  const uttaksgradData = inputData.get('uttaksgrad')

  const avansertBeregningFormatertUttaksalderAarHelPensjonData = inputData.get(
    'uttaksalder-hele-pensjon-aar'
  )
  const avansertBeregningFormatertUttaksalderMaanederHelPensjonData =
    inputData.get('uttaksalder-hele-pensjon-maaneder')

  const avansertBeregningFormatertUttaksalderAarGradertPensjonData =
    inputData.get('uttaksalder-gradert-pensjon-aar')
  const avansertBeregningFormatertUttaksalderMaanederGradertPensjonData =
    inputData.get('uttaksalder-gradert-pensjon-maaneder')
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
  // Sørger for at aar er definert og består av 2 digits og ingen bokstav
  // Sørger for at maaneder ikke er null eller undefined og består at tall mellom 0 og 11
  if (
    !avansertBeregningFormatertUttaksalderAarHelPensjonData ||
    avansertBeregningFormatertUttaksalderMaanederHelPensjonData === null ||
    avansertBeregningFormatertUttaksalderMaanederHelPensjonData === undefined ||
    !/^\d{2}$/.test(
      avansertBeregningFormatertUttaksalderAarHelPensjonData as string
    ) ||
    !/^([0-9]|10|11)$/.test(
      avansertBeregningFormatertUttaksalderMaanederHelPensjonData as string
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
  // If
  if (
    uttaksgradData !== '100 %' &&
    (!avansertBeregningFormatertUttaksalderAarGradertPensjonData ||
      avansertBeregningFormatertUttaksalderMaanederGradertPensjonData ===
        null ||
      avansertBeregningFormatertUttaksalderMaanederGradertPensjonData ===
        undefined ||
      !/^\d{2}$/.test(
        avansertBeregningFormatertUttaksalderAarGradertPensjonData as string
      ) ||
      !/^([0-9]|10|11)$/.test(
        avansertBeregningFormatertUttaksalderMaanederGradertPensjonData as string
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
