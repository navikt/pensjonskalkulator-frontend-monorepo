import { parse, isBefore, addYears } from 'date-fns'

import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'
import {
  DATE_BACKEND_FORMAT,
  DATE_ENDUSER_FORMAT,
  validateDateEndUserFormat,
} from '@/utils/dates'
import { logger } from '@/utils/logging'

export type UtenlandsoppholdFormNames =
  (typeof UTENLANDSOPPHOLD_FORM_NAMES)[keyof typeof UTENLANDSOPPHOLD_FORM_NAMES]

export const UTENLANDSOPPHOLD_FORM_NAMES = {
  form: 'utenlandsopphold-oppholdet-ditt',
  land: 'utenlandsopphold-land',
  arbeidetUtenlands: 'utenlandsopphold-arbeidet-utenlands',
  startdato: 'utenlandsopphold-startdato',
  sluttdato: 'utenlandsopphold-sluttdato',
}

export const UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS: Record<
  UtenlandsoppholdFormNames,
  string
> = {
  [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
}

export const validateOpphold = (
  inputData: {
    landFormData: FormDataEntryValue | null
    arbeidetUtenlandsFormData: FormDataEntryValue | null
    startdatoFormData: FormDataEntryValue | null
    sluttdatoFormData: FormDataEntryValue | null
  },
  foedselsdato: string | undefined,
  utenlandsperioder: Utenlandsperiode[],
  updateValidationErrorMessage: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
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
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - land',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.land]: tekst,
      }
    })
  }

  if (
    !arbeidetUtenlandsFormData ||
    (arbeidetUtenlandsFormData !== 'ja' && arbeidetUtenlandsFormData !== 'nei')
  ) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error'
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - arbeidet utenlands',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: tekst,
      }
    })
  }

  if (!startdatoFormData) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required'
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
  } else if (!validateDateEndUserFormat(startdatoFormData as string)) {
    isValid = false
    const tekst =
      'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format'
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
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
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
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
    logger('valideringsfeil', {
      data: 'Utenlandsopphold - startdato',
      tekst,
    })
    updateValidationErrorMessage((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: tekst,
      }
    })
  }

  if (sluttdatoFormData) {
    if (!validateDateEndUserFormat(sluttdatoFormData as string)) {
      isValid = false
      const tekst =
        'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format'
      logger('valideringsfeil', {
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
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
      logger('valideringsfeil', {
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    } else if (
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
      logger('valideringsfeil', {
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    }
  } else {
    // Sjekker om det finnes et annet utenlandsopphold uten sluttdato på et annet land
    // TODO bør logikken utvides? F.eks.:
    // sjekke at det ikke er flere enn 2 opphold
    // sjekke at den ene har svart nei på jobb eller motsatt?
    if (
      utenlandsperioder.some(
        (opphold) => !opphold.sluttdato && opphold.landkode !== landFormData
      )
    ) {
      isValid = false
      const tekst =
        'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.required'
      logger('valideringsfeil', {
        data: 'Utenlandsopphold - sluttdato',
        tekst,
      })
      updateValidationErrorMessage((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: tekst,
        }
      })
    }
  }

  // TODO mangler logikk for overlappende perioder
  return isValid
}

export const onUtenlandsoppholdSubmit = (
  data: FormData,
  dispatch: AppDispatch,
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
  modalRef: React.RefObject<HTMLDialogElement>,
  onSubmitCallback: () => void,
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
      utenlandsperioder,
      setValidationErrors
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
      userInputActions.setCurrentSimulationUtenlandsperiode({
        ...updatedUtenlandsperiode,
      })
    )

    logger('button klikk', {
      tekst: utenlandsperiodeId
        ? `endrer utenlandsperiode`
        : `legger til utenlandsperiode`,
    })
    onSubmitCallback()
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
  }
}
