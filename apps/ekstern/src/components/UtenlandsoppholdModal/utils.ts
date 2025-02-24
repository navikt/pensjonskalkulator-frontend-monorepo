import { addYears, areIntervalsOverlapping, isBefore, parse } from 'date-fns'

import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputSlice'
import {
  DATE_BACKEND_FORMAT,
  DATE_ENDUSER_FORMAT,
  validateDateEndUserFormat,
} from '@/utils/dates'
import {
  getTranslatedLandFromLandkode,
  harKravOmArbeidFromLandkode,
} from '@/utils/land'
import { logger } from '@/utils/logging'

export type UtenlandsoppholdFormNames =
  (typeof UTENLANDSOPPHOLD_FORM_NAMES)[keyof typeof UTENLANDSOPPHOLD_FORM_NAMES]

export const UTENLANDSOPPHOLD_FORM_NAMES = {
  form: 'utenlandsopphold-oppholdet-ditt',
  land: 'utenlandsopphold-land',
  arbeidetUtenlands: 'utenlandsopphold-arbeidet-utenlands',
  startdato: 'utenlandsopphold-startdato',
  sluttdato: 'utenlandsopphold-sluttdato',
  overlappende_land: 'utenlandsopphold-overlappende-land',
  overlappende_periodestart: 'utenlandsopphold-overlappende-periodestart',
  overlappende_periodeslutt: 'utenlandsopphold-overlappende-periodeslutt',
}

export const UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS: Record<
  UtenlandsoppholdFormNames,
  string
> = {
  [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]: '',
}

export const validateOpphold = (
  inputData: {
    landFormData: FormDataEntryValue | null
    arbeidetUtenlandsFormData: FormDataEntryValue | null
    startdatoFormData: FormDataEntryValue | null
    sluttdatoFormData: FormDataEntryValue | null
  },
  foedselsdato: string | undefined,
  utenlandsperiodeId: string | undefined,
  utenlandsperioder: Utenlandsperiode[],
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<UtenlandsoppholdFormNames, string>>
  >,
  locale: Locales
) => {
  const {
    landFormData,
    arbeidetUtenlandsFormData,
    startdatoFormData,
    sluttdatoFormData,
  } = inputData
  let isValid = true

  if (!landFormData) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.land]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - land',
      tekst,
    })
    // Hvis land ikke er fylt ut return. Det er ikke nødvendig å sjekke resten
    return isValid
  }

  if (
    harKravOmArbeidFromLandkode(landFormData as string) &&
    (!arbeidetUtenlandsFormData ||
      (arbeidetUtenlandsFormData !== 'ja' &&
        arbeidetUtenlandsFormData !== 'nei'))
  ) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - arbeidet utenlands',
      tekst,
    })
  }

  if (!startdatoFormData) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
  } else if (!validateDateEndUserFormat(startdatoFormData as string)) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
  } else if (
    isBefore(
      parse(startdatoFormData as string, DATE_ENDUSER_FORMAT, new Date()),
      parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
    )
  ) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.before_min'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
  } else if (
    isBefore(
      addYears(
        parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()),
        100
      ),
      parse(startdatoFormData as string, DATE_ENDUSER_FORMAT, new Date())
    )
  ) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.after_max'
    updateValidationErrorMessage((prevState) => {
      /* c8 ignore next 4 */
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
    logger('skjema validering feilet', {
      skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
  }

  if (sluttdatoFormData) {
    if (!validateDateEndUserFormat(sluttdatoFormData as string)) {
      isValid = false
      const tekst =
        'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format'
      logger('skjema validering feilet', {
        skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        /* c8 ignore next 4 */
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    } else if (
      startdatoFormData &&
      isBefore(
        parse(sluttdatoFormData as string, DATE_ENDUSER_FORMAT, new Date()),
        parse(startdatoFormData as string, DATE_ENDUSER_FORMAT, new Date())
      )
    ) {
      isValid = false
      const tekst =
        'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.before_min'
      logger('skjema validering feilet', {
        skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        /* c8 ignore next 4 */
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    } else if (
      foedselsdato &&
      isBefore(
        addYears(
          parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()),
          100
        ),
        parse(sluttdatoFormData as string, DATE_ENDUSER_FORMAT, new Date())
      )
    ) {
      isValid = false
      const tekst =
        'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.after_max'
      logger('skjema validering feilet', {
        skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        /* c8 ignore next 4 */
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    }
  }
  // Hvis alt er gyldig hittil, sjekk overlappende perioder
  if (isValid && utenlandsperioder.length > 0) {
    const currentInterval = {
      start: parse(
        startdatoFormData as string,
        DATE_ENDUSER_FORMAT,
        new Date()
      ),
      end: sluttdatoFormData
        ? parse(sluttdatoFormData as string, DATE_ENDUSER_FORMAT, new Date())
        : addYears(
            parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()),
            100
          ),
    }

    for (let i = 0; i < utenlandsperioder.length; i++) {
      if (!isValid) {
        return
      }
      // Når det er overlapping med en annen registrerte periode
      if (
        utenlandsperiodeId !== utenlandsperioder[i].id &&
        areIntervalsOverlapping(
          { ...currentInterval },
          {
            start: parse(
              utenlandsperioder[i].startdato,
              DATE_ENDUSER_FORMAT,
              new Date()
            ),
            end: utenlandsperioder[i].sluttdato
              ? parse(
                  utenlandsperioder[i].sluttdato as string,
                  DATE_ENDUSER_FORMAT,
                  new Date()
                )
              : addYears(
                  parse(
                    foedselsdato as string,
                    DATE_BACKEND_FORMAT,
                    new Date()
                  ),
                  100
                ),
          }
        )
      ) {
        // Når det allerede er registrert et opphold med et land uten krav om arbeid
        if (!harKravOmArbeidFromLandkode(utenlandsperioder[i].landkode)) {
          isValid = false
          const tekst =
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ikke_avtaleland'
          logger('skjema validering feilet', {
            skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
            data: 'Utenlandsopphold - overlappende perioder',
            tekst,
          })
          updateValidationErrorMessage((prevState) => {
            /* c8 ignore next 15 */
            return {
              ...prevState,
              [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land]:
                getTranslatedLandFromLandkode(
                  utenlandsperioder[i].landkode,
                  locale
                ),
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart]:
                utenlandsperioder[i].startdato,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]:
                utenlandsperioder[i].sluttdato
                  ? (utenlandsperioder[i].sluttdato as string)
                  : '',
            }
          })
          break
        }

        // Når oppholdet som redigeres er i et annet land som det overlappende oppholdet
        if (utenlandsperioder[i].landkode !== landFormData) {
          isValid = false
          const tekst =
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ulike_land'
          logger('skjema validering feilet', {
            skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
            data: 'Utenlandsopphold - overlappende perioder',
            tekst,
          })
          updateValidationErrorMessage((prevState) => {
            /* c8 ignore next 15 */
            return {
              ...prevState,
              [UTENLANDSOPPHOLD_FORM_NAMES.land]: tekst,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land]:
                getTranslatedLandFromLandkode(
                  utenlandsperioder[i].landkode,
                  locale
                ),
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart]:
                utenlandsperioder[i].startdato,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]:
                utenlandsperioder[i].sluttdato
                  ? (utenlandsperioder[i].sluttdato as string)
                  : '',
            }
          })
          break
        }

        // Når oppholdet som redigeres er i samme land som det overlappende oppholdet og med samme bo-status
        if (
          arbeidetUtenlandsFormData === 'nei' &&
          !utenlandsperioder[i].arbeidetUtenlands
        ) {
          isValid = false
          const tekst =
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.bostatus'
          logger('skjema validering feilet', {
            skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
            data: 'Utenlandsopphold - overlappende perioder',
            tekst,
          })
          updateValidationErrorMessage((prevState) => {
            /* c8 ignore next 15 */
            return {
              ...prevState,
              [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: tekst,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land]:
                getTranslatedLandFromLandkode(
                  utenlandsperioder[i].landkode,
                  locale
                ),
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart]:
                utenlandsperioder[i].startdato,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]:
                utenlandsperioder[i].sluttdato
                  ? (utenlandsperioder[i].sluttdato as string)
                  : '',
            }
          })
          break
        }

        // Når oppholdet som redigeres er i samme land som det overlappende oppholdet og med samme jobb-status
        if (
          arbeidetUtenlandsFormData === 'ja' &&
          utenlandsperioder[i].arbeidetUtenlands
        ) {
          isValid = false
          const tekst =
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.jobbstatus'
          logger('skjema validering feilet', {
            skjemanavn: UTENLANDSOPPHOLD_FORM_NAMES.form,
            data: 'Utenlandsopphold - overlappende perioder',
            tekst,
          })
          updateValidationErrorMessage((prevState) => {
            /* c8 ignore next 15 */
            return {
              ...prevState,
              [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: tekst,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_land]:
                getTranslatedLandFromLandkode(
                  utenlandsperioder[i].landkode,
                  locale
                ),
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodestart]:
                utenlandsperioder[i].startdato,
              [UTENLANDSOPPHOLD_FORM_NAMES.overlappende_periodeslutt]:
                utenlandsperioder[i].sluttdato
                  ? (utenlandsperioder[i].sluttdato as string)
                  : '',
            }
          })
          break
        }
      }
    }
  }
  return isValid
}

export const onUtenlandsoppholdSubmit = (
  data: FormData,
  dispatch: AppDispatch,
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<UtenlandsoppholdFormNames, string>>
  >,
  modalRef: React.RefObject<HTMLDialogElement | null>,
  onSubmitCallback: () => void,
  locale: Locales,
  previousData: {
    foedselsdato?: string
    utenlandsperiodeId?: string
    utenlandsperioder: Utenlandsperiode[]
  }
): void => {
  const { foedselsdato, utenlandsperiodeId, utenlandsperioder } = previousData

  const landFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.land)
  const arbeidetUtenlandsFormData = data.get(
    UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands
  )
  const startdatoFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.startdato)
  const sluttdatoFormData = data.get(UTENLANDSOPPHOLD_FORM_NAMES.sluttdato)

  if (
    validateOpphold(
      {
        landFormData,
        arbeidetUtenlandsFormData,
        startdatoFormData,
        sluttdatoFormData,
      },
      foedselsdato,
      utenlandsperiodeId,
      utenlandsperioder,
      setValidationErrors,
      locale
    )
  ) {
    const updatedUtenlandsperiode = {
      id: utenlandsperiodeId
        ? utenlandsperiodeId
        : `${Date.now()}-${Math.random()}`,
      landkode: landFormData as string,
      arbeidetUtenlands: arbeidetUtenlandsFormData === 'ja',
      startdato: startdatoFormData as string,
      sluttdato: sluttdatoFormData ? (sluttdatoFormData as string) : undefined,
    }

    dispatch(
      userInputActions.setUtenlandsperiode({
        ...updatedUtenlandsperiode,
      })
    )

    logger('button klikk', {
      tekst: utenlandsperiodeId
        ? `endrer utenlandsopphold`
        : `legger til utenlandsopphold`,
    })
    onSubmitCallback()
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
  }
}
