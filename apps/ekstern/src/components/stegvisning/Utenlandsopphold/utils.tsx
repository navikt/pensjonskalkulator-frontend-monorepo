import { IntlShape } from 'react-intl'

import { paths } from '@/router/constants'
import { logger } from '@/utils/logging'

import { STEGVISNING_FORM_NAMES } from '../utils'

export const onSubmit = (
  data: FormDataEntryValue | null,
  intl: IntlShape,
  setValidationErrors: React.Dispatch<
    React.SetStateAction<{ top: string; bottom: string }>
  >,
  utenlandsperioderLength: number,
  onNext: (utenlandsoppholdData: BooleanRadio) => void
): void => {
  if (!data || (data !== 'ja' && data !== 'nei')) {
    const tekst = intl.formatMessage({
      id: 'stegvisning.utenlandsopphold.validation_error',
    })
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        top: tekst,
      }
    })
    logger('skjemavalidering feilet', {
      skjemanavn: STEGVISNING_FORM_NAMES.utenlandsopphold,
      data: intl.formatMessage({
        id: 'stegvisning.utenlandsopphold.radio_label',
      }),
      tekst,
    })
  } else {
    const utenlandsoppholdData = data as BooleanRadio

    if (data === 'ja' && utenlandsperioderLength === 0) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.utenlandsopphold.mangler_opphold.validation_error',
      })
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          bottom: tekst,
        }
      })
      logger('skjemavalidering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.utenlandsopphold,
        data: intl.formatMessage({
          id: 'stegvisning.utenlandsopphold.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: utenlandsoppholdData,
      })
      logger('knapp klikket', {
        tekst: `Neste fra ${paths.utenlandsopphold}`,
      })
      onNext(utenlandsoppholdData)
    }
  }
}
