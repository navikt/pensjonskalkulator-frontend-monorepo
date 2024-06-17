import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'
import {
  DEFAULT_UBETINGET_UTTAKSALDER,
  validateAlderFromForm,
  getAlderMinus1Maaned,
  isAlderLikEllerOverUbetingetUttaksalder,
} from '@/utils/alder'
import { validateInntekt } from '@/utils/inntekt'
import { logger } from '@/utils/logging'
import { ALLE_UTTAKSGRAD_AS_NUMBER } from '@/utils/uttaksgrad'

export const FORM_NAMES = {
  form: 'avansert-beregning',
  uttaksgrad: 'uttaksgrad',
  uttaksalderHeltUttak: 'uttaksalder-helt-uttak',
  uttaksalderGradertUttak: 'uttaksalder-gradert-uttak',
  inntektVsaHeltUttakRadio: 'inntekt-vsa-helt-uttak-radio',
  inntektVsaGradertUttakRadio: 'inntekt-vsa-gradert-uttak-radio',
  inntektVsaHeltUttak: 'inntekt-vsa-helt-uttak',
  inntektVsaHeltUttakSluttAlder: 'inntekt-vsa-helt-uttak-slutt-alder',
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
  let isValid =
    validateAlderFromForm(
      {
        aar: gradertUttaksalder?.aar,
        maaneder: gradertUttaksalder?.maaneder,
      },
      function (s) {
        if (s) {
          logger('valideringsfeil', {
            data: 'Avansert - Uttaksalder for gradert uttak',
            tekst: s,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderGradertUttak]: s,
          }
        })
      }
    ) &&
    validateAlderFromForm(
      {
        ...heltUttaksalder,
      },
      function (s) {
        if (s) {
          logger('valideringsfeil', {
            data: 'Avansert - Uttaksalder for gradert uttak',
            tekst: s,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.uttaksalderHeltUttak]: s,
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
      logger('valideringsfeil', {
        data: 'Avansert - Uttaksalder for gradert uttak',
        tekst: 'beregning.avansert.rediger.agepicker.validation_error.maxAlder',
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
    uttaksgradFormData: FormDataEntryValue | null
    inntektVsaHeltUttakRadioFormData: FormDataEntryValue | null
    inntektVsaGradertUttakRadioFormData: FormDataEntryValue | null
    inntektVsaHeltUttakFormData: FormDataEntryValue | null
    inntektVsaHeltUttakSluttAlderAarFormData: FormDataEntryValue | null
    inntektVsaHeltUttakSluttAlderMaanederFormData: FormDataEntryValue | null
    inntektVsaGradertUttakFormData: FormDataEntryValue | null
  },
  ufoeregrad: number,
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
    inntektVsaHeltUttakRadioFormData,
    inntektVsaGradertUttakRadioFormData,
    inntektVsaHeltUttakFormData,
    inntektVsaHeltUttakSluttAlderAarFormData,
    inntektVsaHeltUttakSluttAlderMaanederFormData,
    inntektVsaGradertUttakFormData,
  } = inputData

  let isValid = true

  // Sjekker at uttaksalder for hele pensjon er fylt ut med en alder
  if (
    !validateAlderFromForm(
      {
        aar: heltUttakAarFormData,
        maaneder: heltUttakMaanederFormData,
      },
      function (s) {
        if (s) {
          logger('valideringsfeil', {
            data: 'Avansert - Uttaksalder for helt uttak',
            tekst: s,
          })
        }
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

  // Sjekker at uttaksgrad er fylt ut med en prosent
  if (
    !uttaksgradFormData ||
    /^(?!(100 %|[1-9][0-9]? %)$).*$/.test(uttaksgradFormData as string)
  ) {
    isValid = false
    logger('valideringsfeil', {
      data: 'Avansert - Uttaksgrad',
      tekst: 'beregning.avansert.rediger.uttaksgrad.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.uttaksgrad]:
          'beregning.avansert.rediger.uttaksgrad.validation_error',
      }
    })
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

  // Gitt at brukeren har uføretrygd, og at heltUttaksalder, gradertUttaksalder og uttaksgradFormData er valid
  // Sjekker at uttaksgraden er iht uføregraden
  if (isValid && ufoeregrad) {
    if (ufoeregrad === 100) {
      // Dette kan i terorien ikke oppstå fordi aldersvelgeren for gradert og helt uttak er begrenset fra ubetinget uttaksalderen allerede
      const isHeltUttaksalderValid = isAlderLikEllerOverUbetingetUttaksalder({
        aar: parseInt(heltUttakAarFormData as string, 10),
        maaneder: parseInt(heltUttakMaanederFormData as string, 10),
      })
      const isGradertUttaksalderValid =
        uttaksgradFormData === '100 %' ||
        (uttaksgradFormData !== '100 %' &&
          isAlderLikEllerOverUbetingetUttaksalder({
            aar: parseInt(gradertUttakAarFormData as string, 10),
            maaneder: parseInt(gradertUttakAarFormData as string, 10),
          }))
      isValid = isHeltUttaksalderValid && isGradertUttaksalderValid
    } else {
      // Hvis uttaksalder for gradert ikke eksisterer, ta utgangspunkt i helt uttaksalder
      // Hvis uttaksalder for gradert eksisterer, ta utgangspunkt i denne
      const valgtAlder =
        uttaksgradFormData === '100 %'
          ? { aar: heltUttakAarFormData, maaneder: heltUttakMaanederFormData }
          : {
              aar: gradertUttakAarFormData,
              maaneder: gradertUttakMaanederFormData,
            }

      // Hvis brukeren har valgt uttaksalder før ubetinget uttaksalderen
      if (
        valgtAlder.aar &&
        valgtAlder.maaneder &&
        parseInt(valgtAlder.aar as string, 10) <
          DEFAULT_UBETINGET_UTTAKSALDER.aar
      ) {
        const maksGrad = 100 - ufoeregrad
        const filtrerteUttaksgrad = ALLE_UTTAKSGRAD_AS_NUMBER.filter(
          (grad) => grad <= maksGrad
        )
        const valgtUttaksgradAsNumber = parseFloat(
          (uttaksgradFormData as string).replace(/\D/g, '')
        )
        const isUttaksgradValid = filtrerteUttaksgrad.includes(
          valgtUttaksgradAsNumber
        )
        if (!isUttaksgradValid) {
          logger('valideringsfeil', {
            data: 'Avansert - Uttaksgrad',
            tekst:
              'beregning.avansert.rediger.uttaksgrad.ufoeretrygd.validation_error',
          })
          updateValidationErrorMessage((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.uttaksgrad]:
                'beregning.avansert.rediger.uttaksgrad.ufoeretrygd.validation_error',
            }
          })
        }
        isValid = isUttaksgradValid
      }
    }
  }

  // Sjekker at radio for inntekt vsa helt uttak er fylt ut (gitt at uttaksalder er fylt ut)
  if (
    heltUttakAarFormData &&
    heltUttakMaanederFormData &&
    !inntektVsaHeltUttakRadioFormData
  ) {
    isValid = false
    logger('valideringsfeil', {
      data: 'Avansert - Radio inntekt vsa. helt uttak',
      tekst:
        'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaHeltUttakRadio]:
          'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error',
      }
    })
  }

  // Sjekker at inntekt vsa helt uttak og sluttAlder for inntekt er gyldige (gitt at radioknappen er på "ja")
  if (inntektVsaHeltUttakRadioFormData === 'ja') {
    const isInntektValid = validateInntekt(
      inntektVsaHeltUttakFormData as string,
      () => {
        logger('valideringsfeil', {
          data: 'Avansert -  Inntekt vsa. helt uttak',
          tekst:
            'beregning.avansert.rediger.inntekt_vsa_helt_uttak.beloep.validation_error',
        })
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.inntektVsaHeltUttak]:
              'beregning.avansert.rediger.inntekt_vsa_helt_uttak.beloep.validation_error',
          }
        })
      },
      true
    )

    const isSluttAlderValid = validateAlderFromForm(
      {
        aar: inntektVsaHeltUttakSluttAlderAarFormData,
        maaneder: inntektVsaHeltUttakSluttAlderMaanederFormData,
      },
      function (s) {
        if (s) {
          logger('valideringsfeil', {
            data: 'Avansert -  Sluttalder inntekt vsa. helt uttak',
            tekst: s,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.inntektVsaHeltUttakSluttAlder]: s,
          }
        })
      }
    )

    isValid = isValid && isInntektValid && isSluttAlderValid
  }

  // Sjekker at radio for inntekt vsa gradert uttak er fylt ut (gitt at uttaksgrad er ulik 100 %)
  if (uttaksgradFormData !== '100 %' && !inntektVsaGradertUttakRadioFormData) {
    isValid = false
    logger('valideringsfeil', {
      data: 'Avansert -  Radio inntekt vsa. gradert uttak',
      tekst:
        'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaGradertUttakRadio]:
          'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description.validation_error',
      }
    })
  }

  // Sjekker at inntekt vsa gradert uttak er fylt ut (gitt at uttaksgrad er ulik 100 % og radioknappen er på "ja")
  if (
    uttaksgradFormData !== '100 %' &&
    inntektVsaGradertUttakRadioFormData === 'ja'
  ) {
    if (
      !validateInntekt(
        inntektVsaGradertUttakFormData as string,
        () => {
          logger('valideringsfeil', {
            data: 'Avansert -  Inntekt vsa. gradert uttak',
            tekst:
              'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.beloep.validation_error',
          })
          updateValidationErrorMessage((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.inntektVsaGradertUttak]:
                'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.beloep.validation_error',
            }
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
    localInntektFremTilUttak: string | null
    ufoeregrad: number
    hasVilkaarIkkeOppfylt: boolean | undefined
    harAvansertSkjemaUnsavedChanges: boolean
  }
): void => {
  const {
    localInntektFremTilUttak,
    ufoeregrad,
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
  const uttaksgradFormData = data.get('uttaksgrad')
  const inntektVsaHeltUttakRadioFormData = data.get(
    `${FORM_NAMES.inntektVsaHeltUttakRadio}`
  )
  const inntektVsaGradertUttakRadioFormData = data.get(
    `${FORM_NAMES.inntektVsaGradertUttakRadio}`
  )
  const inntektVsaHeltUttakFormData = data.get(FORM_NAMES.inntektVsaHeltUttak)
  const inntektVsaHeltUttakSluttAlderAarFormData = data.get(
    `${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
  )
  const inntektVsaHeltUttakSluttAlderMaanederFormData = data.get(
    `${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
  )
  const inntektVsaGradertUttakFormData = data.get(
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
        inntektVsaHeltUttakFormData,
        inntektVsaHeltUttakSluttAlderAarFormData,
        inntektVsaHeltUttakSluttAlderMaanederFormData,
        inntektVsaGradertUttakFormData,
      },
      ufoeregrad,
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
      dispatch(userInputActions.setCurrentSimulationGradertUttaksperiode(null))
      logger('radiogroup valgt', {
        tekst: 'Inntekt vsa. helt uttak',
        valg: inntektVsaHeltUttakRadioFormData ? 'ja' : 'nei',
      })
    } else {
      logger('valg av uttaksgrad', {
        tekst: `${uttaksgradFormData}`,
      })
      logger('valg av uttaksalder for gradert alderspensjon', {
        tekst: `${gradertUttakAarFormData} år og ${gradertUttakMaanederFormData} md.`,
      })
      if (inntektVsaGradertUttakFormData) {
        logger('radiogroup valgt', {
          tekst: 'Inntekt vsa. gradert uttak',
          valg: inntektVsaGradertUttakRadioFormData ? 'ja' : 'nei',
        })
        logger('valg av inntekt vsa. gradert pensjon (antall sifre)', {
          tekst: `${(inntektVsaGradertUttakFormData as string).replace(/ /g, '').length}`,
        })
      }
      dispatch(
        userInputActions.setCurrentSimulationGradertUttaksperiode({
          uttaksalder: {
            aar: parseInt(gradertUttakAarFormData as string, 10),
            maaneder: parseInt(gradertUttakMaanederFormData as string, 10),
          },
          grad: parseInt(
            (uttaksgradFormData as string).match(/\d+/)?.[0] as string,
            10
          ),
          aarligInntektVsaPensjonBeloep:
            inntektVsaGradertUttakFormData as string,
        })
      )
    }

    if (inntektVsaHeltUttakFormData !== null) {
      logger('valg av inntekt vsa. 100 % pensjon (antall sifre)', {
        tekst: `${(inntektVsaHeltUttakFormData as string).replace(/ /g, '').length}`,
      })
    }

    dispatch(
      userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(
        inntektVsaHeltUttakFormData !== null &&
          inntektVsaHeltUttakSluttAlderAarFormData &&
          inntektVsaHeltUttakSluttAlderMaanederFormData !== null
          ? {
              beloep: inntektVsaHeltUttakFormData as string,
              sluttAlder: {
                aar: parseInt(
                  inntektVsaHeltUttakSluttAlderAarFormData as string,
                  10
                ),
                maaneder: parseInt(
                  inntektVsaHeltUttakSluttAlderMaanederFormData as string,
                  10
                ),
              },
            }
          : undefined
      )
    )
    dispatch(
      userInputActions.setCurrentSimulationAarligInntektFoerUttakBeloep(
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
