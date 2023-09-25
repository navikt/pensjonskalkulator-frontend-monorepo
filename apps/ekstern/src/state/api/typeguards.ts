import { PensjonsavtaleKategori } from '@/types/enums'

export const isInntekt = (data?: any): data is Inntekt => {
  if (data === null || data === undefined) {
    return false
  }
  return !!(
    data.beloep &&
    typeof data.beloep === 'number' &&
    data.aar &&
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

export const isUtbetalingsperiode = (
  data?: any
): data is Utbetalingsperiode => {
  if (data === null || data === undefined) {
    return false
  }
  const harFeilSluttAlder =
    data.sluttAlder && typeof data.sluttAlder !== 'number'
  const harFeilSluttMaaned =
    data.sluttMaaned && typeof data.sluttMaaned !== 'number'
  return (
    data.startAlder &&
    typeof data.startAlder === 'number' &&
    data.startMaaned &&
    typeof data.startMaaned === 'number' &&
    data.grad &&
    typeof data.grad === 'number' &&
    data.aarligUtbetaling &&
    typeof data.aarligUtbetaling === 'number' &&
    !harFeilSluttAlder &&
    !harFeilSluttMaaned
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

  const harFeilStartAlder =
    data.startAlder && typeof data.startAlder !== 'number'
  const harFeilSluttAlder =
    data.sluttAlder && typeof data.sluttAlder !== 'number'

  return (
    !Array.isArray(data) &&
    data.produktbetegnelse &&
    typeof data.produktbetegnelse === 'string' &&
    data.kategori &&
    isSomeEnumKey(PensjonsavtaleKategori)(data.kategori) &&
    Array.isArray(data.utbetalingsperioder) &&
    !harFeilUtbetalingsperiode &&
    !harFeilStartAlder &&
    !harFeilSluttAlder
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

export const isUttaksalder = (data?: any): data is Uttaksalder => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.aar === 'number' &&
    typeof data.maaned === 'number'
  )
}

export const isSomeEnumKey =
  <T extends { [s: string]: unknown }>(e: T) =>
  (token: unknown): token is T[keyof T] => {
    return Object.keys(e).includes(token as string)
  }
