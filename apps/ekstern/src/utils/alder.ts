import { IntlShape } from 'react-intl'

import { format, isBefore, isSameDay, startOfMonth } from 'date-fns'
import { nb, nn, enGB } from 'date-fns/locale'

export const DEFAULT_TIDLIGST_UTTAKSALDER: Alder = {
  aar: 62,
  maaneder: 0,
}
export const DEFAULT_SENEST_UTTAKSALDER: Alder = {
  aar: 75,
  maaneder: 0,
}

const MINIMUM_UTTAKSAAR_IFOLGE_LOVEN: number = 62

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

export const isUttaksalderOverMinUttaksaar = (tidligstMuligUttak: Alder) => {
  if (tidligstMuligUttak.aar > MINIMUM_UTTAKSAAR_IFOLGE_LOVEN) {
    return true
  } else if (
    tidligstMuligUttak.aar === MINIMUM_UTTAKSAAR_IFOLGE_LOVEN &&
    tidligstMuligUttak.maaneder > 0
  ) {
    return true
  } else {
    return false
  }
}

export const transformUttaksalderToDate = (
  alder: Alder,
  foedselsdato: string
) => {
  const foedselsdatoDate = new Date(foedselsdato)
  const antallMaaneder = foedselsdatoDate.getMonth() + alder.maaneder + 1
  const oppdatertAar =
    foedselsdatoDate.getFullYear() + alder.aar + Math.floor(antallMaaneder / 12)

  const calculatedDate = new Date(
    oppdatertAar,
    antallMaaneder % 12,
    foedselsdatoDate.getDate()
  )

  return format(startOfMonth(calculatedDate), 'dd.MM.yyyy')
}

// TODO PEK-279 skrive tester
export const transformMaanedToDate = (
  maaneder: number,
  foedselsdato: string,
  locale: Locales
) => {
  const foedselsdatoDate = new Date(foedselsdato)
  const antallMaaneder = foedselsdatoDate.getMonth() + maaneder + 1

  const calculatedDate = new Date(
    foedselsdatoDate.getFullYear(),
    antallMaaneder % 12,
    foedselsdatoDate.getDate()
  )

  return format(startOfMonth(calculatedDate), 'LLL', {
    locale: locale === 'en' ? enGB : locale === 'nn' ? nn : nb,
  })
}

// TODO PEK-279 vurdere etter utvikling av AgePicker om dette kan finpusses og gjenbrukes av RedigerAvansertBeregning
// sjekke for null / undefined
// sjekke om aar er med, men ikke maaneder, og omvendt
// sende minAlder, maxAlder og sjekke mot dem
export const validateAlder = (
  alder: Partial<Alder> | undefined | null,
  updateValidationErrorMessage: (s: string) => void
) => {
  let isValid = true
  if (alder === null || alder === undefined || !alder) {
    isValid = false
    updateValidationErrorMessage(
      'inntekt.endre_inntekt_vsa_pensjon_modal.aldervelger.validation_error'
    )
    return isValid
  }
  if (
    !alder.aar ||
    alder.aar < 62 ||
    alder.aar > 75 ||
    alder.maaneder === undefined ||
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
