import { IntlShape } from 'react-intl'

import { Events } from '@navikt/nav-dekoratoren-moduler'

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
    logger(Events.SKJEMA_VALIDERING_FEILET, {
      skjemanavn: STEGVISNING_FORM_NAMES.utenlandsopphold,
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
      logger(Events.SKJEMA_VALIDERING_FEILET, {
        skjemanavn: STEGVISNING_FORM_NAMES.utenlandsopphold,
      })
    } else {
      logger.custom('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: utenlandsoppholdData,
      })
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger.custom('button klikk', {
        tekst: `Neste fra ${paths.utenlandsopphold}`,
      })
      logger(Events.KNAPP_KLIKKET, {
        tekst: `Neste fra ${paths.utenlandsopphold}`,
      })
      onNext(utenlandsoppholdData)
    }
  }
}
