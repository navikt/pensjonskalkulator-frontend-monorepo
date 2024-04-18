import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

export const isInntekt = (data?: any): data is Inntekt => {
  if (
    data === null ||
    data === undefined ||
    data.beloep === undefined ||
    data.aar === undefined
  ) {
    return false
  }
  return !!(
    data.beloep >= 0 &&
    typeof data.beloep === 'number' &&
    data.aar >= 0 &&
    typeof data.aar === 'number'
  )
}

export const isPensjonsberegningArray = (
  data?: any
): data is Pensjonsberegning[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (beregning) =>
        typeof beregning.alder === 'number' &&
        typeof beregning.beloep === 'number'
    )
  )
}

export const isAfpOffentlig = (data?: any): data is AfpOffentlig => {
  return (
    data &&
    'afpLeverandoer' in data &&
    typeof data.afpLeverandoer === 'string' &&
    isPensjonsberegningArray(data.afpOffentligListe)
  )
}

export const isUtbetalingsperiode = (
  data?: any
): data is Utbetalingsperiode => {
  if (data === null || data === undefined) {
    return false
  }

  const hasCorrectSluttAlder =
    data.sluttAlder === undefined ||
    (data.sluttAlder !== undefined && isAlder(data.sluttAlder))

  return (
    data.startAlder !== undefined &&
    isAlder(data.startAlder) &&
    typeof data.grad === 'number' &&
    data.aarligUtbetaling !== undefined &&
    typeof data.aarligUtbetaling === 'number' &&
    hasCorrectSluttAlder
  )
}

export const isPensjonsavtale = (data?: any): data is Pensjonsavtale => {
  if (data === null || data === undefined) {
    return false
  }
  const harFeilUtbetalingsperiode =
    data.utbetalingsperioder !== undefined &&
    Array.isArray(data.utbetalingsperioder) &&
    data.utbetalingsperioder.some(
      (utbetalingsperiode: Utbetalingsperiode) =>
        !isUtbetalingsperiode(utbetalingsperiode)
    )

  const harFeilStartAar =
    data.startAar === undefined ||
    !data.startAar ||
    typeof data.startAar !== 'number'
  const harFeilSluttAar =
    data.sluttAar !== undefined && typeof data.sluttAar !== 'number'
  return (
    !Array.isArray(data) &&
    data.produktbetegnelse &&
    typeof data.produktbetegnelse === 'string' &&
    data.kategori &&
    isSomeEnumKey(pensjonsavtalerKategoriMapObj)(data.kategori) &&
    Array.isArray(data.utbetalingsperioder) &&
    !harFeilUtbetalingsperiode &&
    !harFeilStartAar &&
    !harFeilSluttAar
  )
}

export const isPerson = (data?: any): data is Person => {
  return !!(
    [
      null,
      'UOPPGITT',
      'UGIFT',
      'GIFT',
      'ENKE_ELLER_ENKEMANN',
      'SKILT',
      'SEPARERT',
      'REGISTRERT_PARTNER',
      'SEPARERT_PARTNER',
      'SKILT_PARTNER',
      'GJENLEVENDE_PARTNER',
    ].includes(data?.sivilstand) &&
    data.fornavn &&
    typeof data.fornavn === 'string' &&
    data.foedselsdato &&
    data.foedselsdato !== undefined &&
    new Date(data.foedselsdato).toString() !== 'Invalid Date'
  )
}

export const isTpoMedlemskap = (data?: any): data is TpoMedlemskap => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.harTjenestepensjonsforhold === 'boolean'
  )
}

export const isUnleashToggle = (data?: any): data is UnleashToggle => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.enabled === 'boolean'
  )
}

export const isEkskludertStatus = (data?: any): data is EkskludertStatus => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.ekskludert === 'boolean' &&
    [
      'NONE',
      'HAR_LOEPENDE_UFOERETRYGD',
      'HAR_GJENLEVENDEYTELSE',
      'ER_APOTEKER',
    ].includes(data?.aarsak)
  )
}

export const isAlder = (data?: any): data is Alder => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.aar === 'number' &&
    typeof data.maaneder === 'number'
  )
}

export const isSomeEnumKey =
  <T extends { [s: string]: unknown }>(e: T) =>
  (token: unknown): token is T[keyof T] => {
    return Object.keys(e).includes(token as string)
  }

export const isAnchorTag = (target?: any): target is HTMLAnchorElement => {
  return target && target?.tagName === 'A' && target?.href
}
