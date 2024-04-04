import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { validateAlderFromForm, getAlderMinus1Maaned } from '@/utils/alder'
import { validateInntekt, formatInntekt } from '@/utils/inntekt'
import { logger } from '@/utils/logging'

export const FORM_NAMES = {
  form: 'avansert-beregning',
  uttaksgrad: 'uttaksgrad',
  uttaksalderHeltUttak: 'uttaksalder-helt-uttak',
  uttaksalderGradertUttak: 'uttaksalder-gradert-uttak',
  inntektVsaHeltUttakRadio: 'inntekt-vsa-helt-uttak-radio',
  inntektVsaGradertUttakRadio: 'inntekt-vsa-gradert-uttak-radio',
  inntektVsaGradertUttak: 'inntekt-vsa-gradert-uttak',
}

const validateAlderForGradertUttak = (
  heltUttaksalder: Alder,
  gradertUttaksalder:
    | {
        aar: FormDataEntryValue | number | undefined | null
        maaneder: FormDataEntryValue | number | undefined | null
      }
    | undefined
    | null,
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
): boolean => {
  let isValid = validateAlderFromForm(
    {
      aar: gradertUttaksalder?.aar,
      maaneder: gradertUttaksalder?.maaneder,
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

  if (isValid) {
    const maxAlder = getAlderMinus1Maaned(heltUttaksalder)
    isValid =
      maxAlder.maaneder + maxAlder.aar * 12 >=
      parseInt(gradertUttaksalder?.maaneder as string, 10) +
        parseInt(gradertUttaksalder?.aar as string, 10) * 12

    if (!isValid) {
      updateValidationErrorMessage((prevState) => {
        return {
          ...prevState,
          [FORM_NAMES.uttaksalderHeltUttak]:
            'beregning.avansert.rediger.agepicker.validation_error.maxAlder',
        }
      })
    }
  }

  return isValid
}

export const validateAvansertBeregningSkjema = (
  inputData: {
    gradertUttakAarFormData: FormDataEntryValue | null
    gradertUttakMaanederFormData: FormDataEntryValue | null
    heltUttakAarFormData: FormDataEntryValue | null
    heltUttakMaanederFormData: FormDataEntryValue | null
    inntektVsaHeltUttakRadioFormData: FormDataEntryValue | null
    inntektVsaGradertUttakRadioFormData: FormDataEntryValue | null
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
    inntektVsaHeltUttakRadioFormData,
    inntektVsaGradertUttakRadioFormData,
    uttaksgradFormData,
    inntektVsaGradertPensjonFormData,
  } = inputData

  let isValid = true

  // Sjekker at radio for inntekt vsa helt uttak er fylt ut
  if (!inntektVsaHeltUttakRadioFormData) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaHeltUttakRadio]:
          'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error',
      }
    })
  }

  // Sjekker at uttaksgrad er fylt ut med en prosent
  if (
    !uttaksgradFormData ||
    /^(?!(100 %|[1-9][0-9]? %)$).*$/.test(uttaksgradFormData as string)
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
    !validateAlderForGradertUttak(
      {
        aar: heltUttakAarFormData as unknown as number,
        maaneder: heltUttakMaanederFormData as unknown as number,
      },
      {
        aar: gradertUttakAarFormData as unknown as number,
        maaneder: gradertUttakMaanederFormData as unknown as number,
      },
      updateValidationErrorMessage
    )
  ) {
    isValid = false
  }

  // Sjekker at radio for inntekt vsa helt uttak er fylt ut (gitt at uttaksgrad er ulik 100 %)
  if (uttaksgradFormData !== '100 %' && !inntektVsaGradertUttakRadioFormData) {
    isValid = false
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaGradertUttakRadio]:
          'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description.validation_error',
      }
    })
  }

  // Sjekker at  inntekt vsa gradert uttak er fylt ut (gitt at uttaksgrad er ulik 100 % og radioknappen er på "ja")
  // Sjekker at inntekt vsa gradert pensjon er enten tom eller fylt ut med en gyldig string
  if (
    uttaksgradFormData !== '100 %' &&
    inntektVsaGradertUttakRadioFormData === 'ja'
  ) {
    if (
      !validateInntekt(
        inntektVsaGradertPensjonFormData as string,
        (s: string) => {
          updateValidationErrorMessage((prevState) => {
            return { ...prevState, [FORM_NAMES.inntektVsaGradertUttak]: s }
          })
        },
        true
      )
    ) {
      isValid = false
    }
  }

  return isValid
}

export const onAvansertBeregningSubmit = (
  data: FormData,
  dispatch: AppDispatch,
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
  gaaTilResultat: () => void,
  previousData: {
    localHeltUttak: RecursivePartial<HeltUttak> | undefined
    localInntektFremTilUttak: string | null
    hasVilkaarIkkeOppfylt: boolean | undefined
    harAvansertSkjemaUnsavedChanges: boolean
  }
): void => {
  const {
    localHeltUttak,
    localInntektFremTilUttak,
    hasVilkaarIkkeOppfylt,
    harAvansertSkjemaUnsavedChanges,
  } = previousData

  const gradertUttakAarFormData = data.get(
    `${FORM_NAMES.uttaksalderGradertUttak}-aar`
  )
  const gradertUttakMaanederFormData = data.get(
    `${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
  )
  const heltUttakAarFormData = data.get(
    `${FORM_NAMES.uttaksalderHeltUttak}-aar`
  )
  const heltUttakMaanederFormData = data.get(
    `${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
  )
  const inntektVsaHeltUttakRadioFormData = data.get(
    `${FORM_NAMES.inntektVsaHeltUttakRadio}`
  )
  const inntektVsaGradertUttakRadioFormData = data.get(
    `${FORM_NAMES.inntektVsaGradertUttakRadio}`
  )
  const uttaksgradFormData = data.get('uttaksgrad')
  const inntektVsaGradertPensjonFormData = data.get(
    FORM_NAMES.inntektVsaGradertUttak
  )
  if (
    validateAvansertBeregningSkjema(
      {
        gradertUttakAarFormData,
        gradertUttakMaanederFormData,
        heltUttakAarFormData,
        heltUttakMaanederFormData,
        inntektVsaHeltUttakRadioFormData,
        inntektVsaGradertUttakRadioFormData,
        uttaksgradFormData,
        inntektVsaGradertPensjonFormData,
      },
      setValidationErrors
    )
  ) {
    dispatch(
      userInputActions.setCurrentSimulationUttaksalder({
        aar: parseInt(heltUttakAarFormData as string, 10),
        maaneder: parseInt(heltUttakMaanederFormData as string, 10),
      })
    )
    logger('valg av uttaksalder for 100 % alderspensjon', {
      tekst: `${heltUttakAarFormData} år og ${heltUttakMaanederFormData} md.`,
    })
    if (uttaksgradFormData === '100 %') {
      dispatch(userInputActions.setCurrentSimulationGradertuttaksperiode(null))
    } else {
      if (inntektVsaGradertPensjonFormData) {
        logger('valg av uttaksgrad', {
          tekst: `${uttaksgradFormData}`,
        })
        logger('valg av uttaksalder for gradert alderspensjon', {
          tekst: `${gradertUttakAarFormData} år og ${gradertUttakMaanederFormData} md.`,
        })
        logger('valg av inntekt vsa. gradert pensjon (antall sifre)', {
          tekst: `${(inntektVsaGradertPensjonFormData as string).replace(/ /g, '').length}`,
        })
      }
      dispatch(
        userInputActions.setCurrentSimulationGradertuttaksperiode({
          uttaksalder: {
            aar: parseInt(gradertUttakAarFormData as string, 10),
            maaneder: parseInt(gradertUttakMaanederFormData as string, 10),
          },
          grad: parseInt(
            (uttaksgradFormData as string).match(/\d+/)?.[0] as string,
            10
          ),
          aarligInntektVsaPensjonBeloep:
            inntektVsaGradertPensjonFormData as string,
        })
      )
    }
    dispatch(
      userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(
        localHeltUttak?.aarligInntektVsaPensjon?.beloep !== undefined &&
          localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder?.aar &&
          localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder?.maaneder !==
            undefined
          ? {
              beloep: formatInntekt(
                localHeltUttak?.aarligInntektVsaPensjon?.beloep
              ),
              sluttAlder: localHeltUttak?.aarligInntektVsaPensjon
                ?.sluttAlder as Alder,
            }
          : undefined
      )
    )
    dispatch(
      userInputActions.setCurrentSimulationaarligInntektFoerUttakBeloep(
        localInntektFremTilUttak
      )
    )

    // Dersom vilkårene ikke var oppfylt, sjekk at noe ble endret for å sende til resultat
    if (
      !hasVilkaarIkkeOppfylt ||
      (hasVilkaarIkkeOppfylt && harAvansertSkjemaUnsavedChanges)
    ) {
      logger('button klikk', {
        tekst: harAvansertSkjemaUnsavedChanges
          ? 'Oppdater avansert pensjon'
          : 'Beregn avansert pensjon',
      })
      gaaTilResultat()
    }
  }
}
