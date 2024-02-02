import {
  validateAlderFromForm,
  isUttaksalderOverMinUttaksaar,
} from '@/utils/alder'
import { validateInntekt } from '@/utils/inntekt'

export const FORM_NAMES = {
  form: 'avansert-beregning',
  uttaksgrad: 'uttaksgrad',
  uttaksalderHeltUttak: 'uttaksalder-helt-uttak',
  uttaksalderGradertUttak: 'uttaksalder-gradert-uttak',
  inntektVsaGradertUttak: 'inntekt-vsa-gradert-uttak',
}

export const validateAvansertBeregningSkjema = (
  inputData: {
    gradertUttakAarFormData: FormDataEntryValue | null
    gradertUttakMaanederFormData: FormDataEntryValue | null
    heltUttakAarFormData: FormDataEntryValue | null
    heltUttakMaanederFormData: FormDataEntryValue | null
    uttaksgradFormData: FormDataEntryValue | null
    inntektVsaGradertPensjonFormData: FormDataEntryValue | null
  },
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
) => {
  const {
    gradertUttakAarFormData,
    gradertUttakMaanederFormData,
    heltUttakAarFormData,
    heltUttakMaanederFormData,
    uttaksgradFormData,
    inntektVsaGradertPensjonFormData,
  } = inputData

  let isValid = true

  // Sjekker at uttaksgrad er fylt ut med en prosent
  if (
    !uttaksgradFormData ||
    /^(?!(100 %|[1-9][0-9]? %)$).*$/.test(uttaksgradFormData as string)
  ) {
    isValid = false
  }

  // Sjekker at inntekt vsa gradert pensjon er enten tom eller fylt ut med en gyldig string
  if (
    !validateInntekt(
      inntektVsaGradertPensjonFormData as string,
      (s: string) => {
        updateValidationErrorMessage((prevState) => {
          return { ...prevState, [FORM_NAMES.inntektVsaGradertUttak]: s }
        })
      },
      false
    )
  ) {
    isValid = false
  }

  // Sjekker at uttaksalder for hele pensjon er fylt ut med en alder
  if (
    !validateAlderFromForm(
      {
        aar: heltUttakAarFormData,
        maaneder: heltUttakMaanederFormData,
      },
      function (s) {
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderHeltUttak]: s,
          }
        })
      }
    )
  ) {
    isValid = false
  }

  // Sjekker at uttaksalder for gradert pensjon er fylt ut med en alder (gitt at uttaksgrad er ulik 100 %)
  if (
    uttaksgradFormData !== '100 %' &&
    !validateAlderFromForm(
      {
        aar: gradertUttakAarFormData,
        maaneder: gradertUttakMaanederFormData,
      },
      function (s) {
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderGradertUttak]: s,
          }
        })
      }
    )
  ) {
    isValid = false
  }

  return isValid
}

// TDOO skrive tester
export const getMinAlderTilHeltUttak = (args: {
  temporaryGradertUttak: RecursivePartial<Alder> | undefined
  tidligstMuligHeltUttak: Alder | undefined
}): Alder => {
  const { temporaryGradertUttak, tidligstMuligHeltUttak } = args
  // Hvis brukeren ikke har valgt noe gradert uttak, er minAlder definert av tidligstMuligHeltUttak
  // Hvis brukeren har valgt en alder for gradert uttak, vises det den høyeste av disse alternativene:
  // --> Selve gradert uttak + 1 måned
  // --> Hvis brukeren har maksimal opptjening (tidligstMuligUttak 62 år 0md) alternativ tidligstMuligHeltUttak
  // --> Hvis brukeren har lavere opptjening (tidligstMuligUttak høyere enn 62 år 0md) alternativ 67 år og 0 md
  if (
    temporaryGradertUttak?.aar &&
    temporaryGradertUttak?.maaneder !== undefined
  ) {
    const temporaryGradertUttakPlus1Maaned =
      temporaryGradertUttak?.maaneder !== 11
        ? {
            aar: temporaryGradertUttak?.aar,
            maaneder: temporaryGradertUttak?.maaneder + 1,
          }
        : { aar: temporaryGradertUttak?.aar + 1, maaneder: 0 }

    if (tidligstMuligHeltUttak) {
      const alt1 = isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
        ? { aar: 67, maaneder: 0 }
        : tidligstMuligHeltUttak
      const alt1Months = alt1.aar * 12 + alt1.maaneder
      const alt2Months =
        temporaryGradertUttakPlus1Maaned.aar * 12 +
        temporaryGradertUttakPlus1Maaned.maaneder

      return alt1Months > alt2Months ? alt1 : temporaryGradertUttakPlus1Maaned
    } else {
      return temporaryGradertUttakPlus1Maaned
    }
  } else {
    return tidligstMuligHeltUttak
      ? tidligstMuligHeltUttak
      : { aar: 67, maaneder: 0 }
  }
}
