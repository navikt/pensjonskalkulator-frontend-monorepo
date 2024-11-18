import { IntlShape } from 'react-intl'

import {
  add,
  differenceInYears,
  differenceInMonths,
  endOfDay,
  format,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { nb, nn, enGB } from 'date-fns/locale'

import { DATE_ENDUSER_FORMAT, DATE_BACKEND_FORMAT } from '@/utils/dates'

export const DEFAULT_TIDLIGST_UTTAKSALDER: Alder = {
  aar: 62,
  maaneder: 0,
}

export const DEFAULT_UBETINGET_UTTAKSALDER: Alder = {
  aar: 67,
  maaneder: 0,
}

export const DEFAULT_SENEST_UTTAKSALDER: Alder = {
  aar: 75,
  maaneder: 0,
}

export const DEFAULT_MAX_OPPTJENINGSALDER: Alder = {
  aar: 75,
  maaneder: 11,
}

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

export const isAlderLikEllerOverUbetingetUttaksalder = (
  alder: Alder | Partial<Alder>
) => {
  if (!alder.aar) {
    return false
  }
  if (alder.aar >= DEFAULT_UBETINGET_UTTAKSALDER.aar) {
    return true
  } else {
    return false
  }
}

export const isAlderOverMinUttaksalder = (alder: Alder) => {
  if (alder.aar > DEFAULT_TIDLIGST_UTTAKSALDER.aar) {
    return true
  } else if (
    alder.aar === DEFAULT_TIDLIGST_UTTAKSALDER.aar &&
    alder.maaneder > 0
  ) {
    return true
  } else {
    return false
  }
}

export const isFoedselsdatoOverEllerLikMinUttaksalder = (
  foedselsdato: string
) => {
  const birtdateJs = endOfDay(
    parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
  )
  const currentDate = endOfDay(new Date())
  const aar = differenceInYears(currentDate, birtdateJs)
  return aar >= DEFAULT_TIDLIGST_UTTAKSALDER.aar
}

export const getAlderPlus1Maaned = (alder: Alder) => {
  return alder.maaneder !== 11
    ? {
        aar: alder.aar,
        maaneder: (alder.maaneder ?? 0) + 1,
      }
    : { aar: alder.aar + 1, maaneder: 0 }
}

export const getAlderMinus1Maaned = (alder: Alder) => {
  return alder.maaneder !== 0
    ? {
        aar: alder.aar,
        maaneder: alder.maaneder - 1,
      }
    : { aar: alder.aar - 1, maaneder: 11 }
}

export const transformFoedselsdatoToAlder = (foedselsdato: string): Alder => {
  const birtdateJs = startOfMonth(
    parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
  )
  const currentDate = endOfDay(new Date())
  const aar = differenceInYears(currentDate, birtdateJs)
  const maaneder = differenceInMonths(currentDate, birtdateJs) % 12
  return { aar, maaneder }
}

export const transformFoedselsdatoToAlderMinus1md = (
  foedselsdato: string
): Alder => {
  return getAlderMinus1Maaned(transformFoedselsdatoToAlder(foedselsdato))
}

export const transformUttaksalderToDate = (
  alder: Alder,
  foedselsdato: string
) => {
  const foedselsdatoDate = new Date(foedselsdato)
  const antallMaaneder = foedselsdatoDate.getMonth() + alder.maaneder + 1
  const oppdatertAar =
    foedselsdatoDate.getFullYear() + alder.aar + Math.floor(antallMaaneder / 12)

  const calculatedDate = new Date(oppdatertAar, antallMaaneder % 12, 1)

  return format(startOfMonth(calculatedDate), DATE_ENDUSER_FORMAT)
}

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
    1
  )

  return format(startOfMonth(startOfDay(calculatedDate)), 'LLL', {
    locale: locale === 'en' ? enGB : locale === 'nn' ? nn : nb,
  })
}

export const validateAlderFromForm = (
  alder:
    | {
        aar: FormDataEntryValue | number | undefined | null
        maaneder: FormDataEntryValue | number | undefined | null
      }
    | undefined
    | null,
  updateValidationErrorMessage: (s: string) => void
) => {
  let isValid = true
  // Sørger for at aar er definert og består av 2 digits og ingen bokstav
  if (
    alder === null ||
    alder === undefined ||
    !alder ||
    !alder.aar ||
    !/^\d{2}$/.test(alder.aar as string)
  ) {
    isValid = false

    updateValidationErrorMessage('agepicker.validation_error.aar')
    return isValid
  }
  // Sørger for at maaneder ikke er null eller undefined og består at tall mellom 0 og 11
  if (
    alder.maaneder === undefined ||
    !/^([0-9]|10|11)$/.test(alder.maaneder as string)
  ) {
    isValid = false
    updateValidationErrorMessage('agepicker.validation_error.maaneder')
    return isValid
  }

  return isValid
}
