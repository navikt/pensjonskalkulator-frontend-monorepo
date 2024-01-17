import { IntlShape } from 'react-intl'

import { isBefore, isSameDay } from 'date-fns'

export const formatUttaksalder = (
  intl: IntlShape,
  { aar, maaneder }: Alder,
  options: { compact: boolean } = { compact: false }
): string => {
  const alderOg = intl.formatMessage({ id: 'string.og' })
  const alderAar = intl.formatMessage({ id: 'alder.aar' })
  const alderMd = intl.formatMessage({ id: 'alder.md' })
  const alderMaaned = intl.formatMessage({ id: 'alder.maaned' })
  const alderMaaneder = intl.formatMessage({ id: 'alder.maaneder' })

  if (maaneder === 0) {
    return `${aar} ${alderAar}`
  }

  return options.compact
    ? `${aar} ${alderAar} ${alderOg} ${maaneder} ${alderMd}`
    : `${aar} ${alderAar} ${alderOg} ${maaneder} ${
        maaneder > 1 ? alderMaaneder : alderMaaned
      }`
}

export const unformatUttaksalder = (alderChip: string): Alder => {
  const uttaksalder = alderChip.match(/[-+]?[0-9]*\.?[0-9]+/g)
  const aar = uttaksalder?.[0] ? parseInt(uttaksalder?.[0], 10) : 0
  const maaneder = uttaksalder?.[1] ? parseInt(uttaksalder?.[1], 10) : 0
  return { aar, maaneder }
}

export const isFoedtFoer1963 = (foedselsdato: string): boolean => {
  const LAST_DAY_1962 = new Date(1962, 11, 31)
  return (
    isBefore(new Date(foedselsdato), LAST_DAY_1962) ||
    isSameDay(new Date(foedselsdato), LAST_DAY_1962)
  )
}

export const isFoedtFoer1964 = (foedselsdato: string): boolean => {
  const LAST_DAY_1963 = new Date(1963, 11, 31)
  return (
    isBefore(new Date(foedselsdato), LAST_DAY_1963) ||
    isSameDay(new Date(foedselsdato), LAST_DAY_1963)
  )
}

// TODO vurdere etter utvikling av AgePicker om dette kan finpusses og gjenbrukes av RedigerAvansertBeregning
export const validateAlder = (
  alder: Alder | null,
  updateValidationErrorMessage: (s: string) => void
) => {
  let isValid = true
  if (alder === undefined || !alder) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_vsa_pensjon_modal.aldervelger.validation_error'
    )
    return isValid
  }
  if (
    alder.aar < 62 ||
    alder.aar > 75 ||
    alder.maaneder < 0 ||
    alder.maaneder > 11
  ) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_vsa_pensjon_modal.aldervelger.validation_error'
    )
    return isValid
  }

  return isValid
}
