import { add, endOfDay, format, isBefore, parse, startOfMonth } from 'date-fns'

import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputSlice'
import {
  validateAlderFromForm,
  getAlderMinus1Maaned,
  isAlderLikEllerOverAnnenAlder,
  transformUttaksalderToDate,
} from '@/utils/alder'
import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { validateInntekt } from '@/utils/inntekt'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logger } from '@/utils/logging'
import { ALLE_UTTAKSGRAD_AS_NUMBER } from '@/utils/uttaksgrad'

// TODO PEK-1026 - utvide AVANSERT_FORM_NAMES for de 3 skjemaene:
// AVANSERT_SKJEMA_FOR_BRUKERE_MED_GRADERT_UFOERETRYGD
// AVANSERT_SKJEMA_FOR_ANDRE_BRUKERE
// AVANSERT_SKJEMA_FOR_BRUKERE_MED_KAP19_AFP
export type AvansertFormNames =
  (typeof AVANSERT_FORM_NAMES)[keyof typeof AVANSERT_FORM_NAMES]

export const AVANSERT_FORM_NAMES = {
  form: 'avansert-beregning',
  endringAlertFremtidigDato: 'endring-alert-fremtidig-dato',
  uttaksgrad: 'uttaksgrad',
  uttaksalderHeltUttak: 'uttaksalder-helt-uttak',
  uttaksalderGradertUttak: 'uttaksalder-gradert-uttak',
  inntektVsaHeltUttakRadio: 'inntekt-vsa-helt-uttak-radio',
  inntektVsaGradertUttakRadio: 'inntekt-vsa-gradert-uttak-radio',
  inntektVsaHeltUttak: 'inntekt-vsa-helt-uttak',
  inntektVsaHeltUttakSluttAlder: 'inntekt-vsa-helt-uttak-slutt-alder',
  inntektVsaGradertUttak: 'inntekt-vsa-gradert-uttak',
  beregningsTypeRadio: 'beregnings-type-radio',
}

const validateAlderForGradertUttak = (
  heltUttaksalder: Alder,
  gradertUttaksalder:
    | {
        aar: FormDataEntryValue | string | number | undefined | null
        maaneder: FormDataEntryValue | string | number | undefined | null
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
      function (tekst) {
        if (tekst) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert - Uttaksalder for gradert uttak',
            tekst,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.uttaksalderGradertUttak]: tekst,
          }
        })
      }
    ) &&
    validateAlderFromForm(
      {
        ...heltUttaksalder,
      },
      function (tekst) {
        if (tekst) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert - Uttaksalder for gradert uttak',
            tekst,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: tekst,
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
          [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]:
            'beregning.avansert.rediger.agepicker.validation_error.maxAlder',
        }
      })
      logger('skjema validering feilet', {
        skjemanavn: AVANSERT_FORM_NAMES.form,
        data: 'Avansert - Uttaksalder for gradert uttak',
        tekst: 'beregning.avansert.rediger.agepicker.validation_error.maxAlder',
      })
    }
  }

  return isValid
}

const validateEndringGradertUttak = (
  forrigeGrad: number,
  forrigeEndringsdato: string,
  nyGrad: string,
  nyUttaksalder: {
    aar: number
    maaneder: number
  },
  foedselsdato: string,
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
): boolean => {
  const nyGradAsNumber = parseInt(nyGrad.match(/\d+/)?.[0] as string, 10)
  if (nyGradAsNumber === forrigeGrad) {
    return true
  } else {
    const uttaksdato = parse(
      transformUttaksalderToDate(nyUttaksalder, foedselsdato),
      DATE_ENDUSER_FORMAT,
      new Date()
    )

    const fremtidigMuligEndring = startOfMonth(
      add(
        endOfDay(parse(forrigeEndringsdato, DATE_BACKEND_FORMAT, new Date())),
        { months: 12 }
      )
    )
    if (isBefore(uttaksdato, fremtidigMuligEndring)) {
      const formatertDato = format(fremtidigMuligEndring, DATE_ENDUSER_FORMAT)
      updateValidationErrorMessage((prevState) => {
        return {
          ...prevState,
          [AVANSERT_FORM_NAMES.endringAlertFremtidigDato]: formatertDato,
        }
      })
      logger('skjema validering feilet', {
        skjemanavn: AVANSERT_FORM_NAMES.form,
        data: 'Avansert - For tidlig endring av gradert uttak',
        tekst: `Uttaksdato ${uttaksdato} er før ${formatertDato}`,
      })
      window.scrollTo(0, 0)
      return false
    }
  }
  return true
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
  foedselsdato: string,
  normertPensjonsalder: Alder,
  loependeVedtak: LoependeVedtak,
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
      function (tekst) {
        if (tekst) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert - Uttaksalder for helt uttak',
            tekst,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.uttaksalderHeltUttak]: tekst,
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
    /^(?!(0 %|100 %|[1-9][0-9]? %)$).*$/.test(uttaksgradFormData as string)
  ) {
    isValid = false
    logger('skjema validering feilet', {
      skjemanavn: AVANSERT_FORM_NAMES.form,
      data: 'Avansert - Uttaksgrad',
      tekst: 'beregning.avansert.rediger.uttaksgrad.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.uttaksgrad]:
          'beregning.avansert.rediger.uttaksgrad.validation_error',
      }
    })
  }

  // Sjekker at uttaksalder for gradert pensjon er fylt ut med en alder (gitt at uttaksgrad er ulik 100 %)
  if (
    uttaksgradFormData !== '100 %' &&
    !validateAlderForGradertUttak(
      {
        aar: parseInt(heltUttakAarFormData as string, 10),
        maaneder: parseInt(heltUttakMaanederFormData as string, 10),
      },
      {
        aar: gradertUttakAarFormData,
        maaneder: gradertUttakMaanederFormData,
      },
      updateValidationErrorMessage
    )
  ) {
    isValid = false
  }

  // Gitt at brukeren har uføretrygd, og at heltUttaksalder, gradertUttaksalder og uttaksgradFormData er valid
  // Sjekker at uttaksgraden er iht uføregraden
  if (isValid && loependeVedtak.ufoeretrygd.grad) {
    if (loependeVedtak.ufoeretrygd.grad === 100) {
      // Dette kan i teorien ikke oppstå fordi aldersvelgeren for gradert og helt uttak er begrenset fra normert pensjonsalder allerede
      const isHeltUttaksalderValid = isAlderLikEllerOverAnnenAlder(
        {
          aar: parseInt(heltUttakAarFormData as string, 10),
          maaneder: parseInt(heltUttakMaanederFormData as string, 10),
        },
        normertPensjonsalder
      )
      const isGradertUttaksalderValid =
        uttaksgradFormData === '100 %' ||
        (uttaksgradFormData !== '100 %' &&
          isAlderLikEllerOverAnnenAlder(
            {
              aar: parseInt(gradertUttakAarFormData as string, 10),
              maaneder: parseInt(gradertUttakMaanederFormData as string, 10),
            },
            normertPensjonsalder
          ))
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

      // Hvis brukeren har valgt uttaksalder før normert pensjonsalder
      if (
        valgtAlder.aar &&
        valgtAlder.maaneder &&
        parseInt(valgtAlder.aar as string, 10) < normertPensjonsalder.aar
      ) {
        const maksGrad = 100 - loependeVedtak.ufoeretrygd.grad
        const filtrerteUttaksgrad = isLoependeVedtakEndring(loependeVedtak)
          ? [...ALLE_UTTAKSGRAD_AS_NUMBER].filter((grad) => grad <= maksGrad)
          : [...ALLE_UTTAKSGRAD_AS_NUMBER]
              .filter((grad) => grad <= maksGrad)
              .slice(1)
        const valgtUttaksgradAsNumber = parseFloat(
          (uttaksgradFormData as string).replace(/\D/g, '')
        )
        const isUttaksgradValid = filtrerteUttaksgrad.includes(
          valgtUttaksgradAsNumber
        )
        if (!isUttaksgradValid) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert - Uttaksgrad',
            tekst:
              'beregning.avansert.rediger.uttaksgrad.ufoeretrygd.validation_error',
          })
          updateValidationErrorMessage((prevState) => {
            return {
              ...prevState,
              [AVANSERT_FORM_NAMES.uttaksgrad]:
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
    logger('skjema validering feilet', {
      skjemanavn: AVANSERT_FORM_NAMES.form,
      data: 'Avansert - Radio inntekt vsa. helt uttak',
      tekst:
        'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio]:
          'beregning.avansert.rediger.radio.inntekt_vsa_helt_uttak.description.validation_error',
      }
    })
  }

  // Sjekker at inntekt vsa helt uttak og sluttAlder for inntekt er gyldige (gitt at radioknappen er på "ja")
  if (inntektVsaHeltUttakRadioFormData === 'ja') {
    const isInntektValid = validateInntekt(
      inntektVsaHeltUttakFormData as string,
      (tekst: string) => {
        if (tekst) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert -  Inntekt vsa. helt uttak',
            tekst,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.inntektVsaHeltUttak]: tekst,
          }
        })
      },
      true,
      {
        required:
          'beregning.avansert.rediger.inntekt_vsa_helt_uttak.beloep.validation_error',
      }
    )

    const isSluttAlderValid = validateAlderFromForm(
      {
        aar: inntektVsaHeltUttakSluttAlderAarFormData,
        maaneder: inntektVsaHeltUttakSluttAlderMaanederFormData,
      },
      function (tekst) {
        if (tekst) {
          logger('skjema validering feilet', {
            skjemanavn: AVANSERT_FORM_NAMES.form,
            data: 'Avansert -  Sluttalder inntekt vsa. helt uttak',
            tekst,
          })
        }
        updateValidationErrorMessage((prevState) => {
          return {
            ...prevState,
            [AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder]: tekst,
          }
        })
      }
    )

    isValid = isValid && isInntektValid && isSluttAlderValid
  }

  // Sjekker at radio for inntekt vsa gradert uttak er fylt ut (gitt at uttaksgrad er ulik 100 %)
  if (uttaksgradFormData !== '100 %' && !inntektVsaGradertUttakRadioFormData) {
    isValid = false
    logger('skjema validering feilet', {
      skjemanavn: AVANSERT_FORM_NAMES.form,
      data: 'Avansert -  Radio inntekt vsa. gradert uttak',
      tekst:
        'beregning.avansert.rediger.radio.inntekt_vsa_gradert_uttak.description.validation_error',
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio]:
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
        (tekst: string) => {
          if (tekst) {
            logger('skjema validering feilet', {
              skjemanavn: AVANSERT_FORM_NAMES.form,
              data: 'Avansert -  Inntekt vsa. gradert uttak',
              tekst,
            })
          }
          updateValidationErrorMessage((prevState) => {
            return {
              ...prevState,
              [AVANSERT_FORM_NAMES.inntektVsaGradertUttak]: tekst,
            }
          })
        },
        true,
        {
          required:
            'beregning.avansert.rediger.inntekt_vsa_gradert_uttak.beloep.validation_error',
        }
      )
    ) {
      isValid = false
    }
  }

  // Hvis alle feltene er gyldige,
  // Ved endring, sjekker at uttaksalder for gradert pensjon ikke er tidligere enn 12 md. siden sist endring
  if (isValid) {
    if (
      isLoependeVedtakEndring(loependeVedtak) &&
      uttaksgradFormData !== '0 %' &&
      uttaksgradFormData !== '100 %' &&
      loependeVedtak.alderspensjon &&
      !validateEndringGradertUttak(
        loependeVedtak.alderspensjon.grad,
        loependeVedtak.alderspensjon.fom,
        uttaksgradFormData as string,
        {
          aar: parseInt(gradertUttakAarFormData as string, 10),
          maaneder: parseInt(gradertUttakMaanederFormData as string, 10),
        },
        foedselsdato,
        updateValidationErrorMessage
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
    foedselsdato: string
    normertPensjonsalder: Alder
    loependeVedtak: LoependeVedtak
    localInntektFremTilUttak: string | null
    localBeregningsTypeRadio: Beregningsvalg | null
    hasVilkaarIkkeOppfylt: boolean | undefined
    harAvansertSkjemaUnsavedChanges: boolean
  }
): void => {
  const {
    foedselsdato,
    normertPensjonsalder,
    loependeVedtak,
    localInntektFremTilUttak,
    localBeregningsTypeRadio,
    hasVilkaarIkkeOppfylt,
    harAvansertSkjemaUnsavedChanges,
  } = previousData

  const gradertUttakAarFormData = data.get(
    `${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
  )
  const gradertUttakMaanederFormData = data.get(
    `${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
  )
  const heltUttakAarFormData = data.get(
    `${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
  )
  const heltUttakMaanederFormData = data.get(
    `${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
  )
  const uttaksgradFormData = data.get('uttaksgrad')
  const inntektVsaHeltUttakRadioFormData = data.get(
    `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}`
  )
  const inntektVsaGradertUttakRadioFormData = data.get(
    `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}`
  )
  const inntektVsaHeltUttakFormData = data.get(
    AVANSERT_FORM_NAMES.inntektVsaHeltUttak
  )
  const inntektVsaHeltUttakSluttAlderAarFormData = data.get(
    `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
  )
  const inntektVsaHeltUttakSluttAlderMaanederFormData = data.get(
    `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
  )
  const inntektVsaGradertUttakFormData = data.get(
    AVANSERT_FORM_NAMES.inntektVsaGradertUttak
  )
  if (
    !validateAvansertBeregningSkjema(
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
      foedselsdato,
      normertPensjonsalder,
      loependeVedtak,
      setValidationErrors
    )
  ) {
    return
  }

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
        aarligInntektVsaPensjonBeloep: inntektVsaGradertUttakFormData as string,
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

  dispatch(
    userInputActions.setCurrentSimulationBeregningsvalg(
      localBeregningsTypeRadio
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
