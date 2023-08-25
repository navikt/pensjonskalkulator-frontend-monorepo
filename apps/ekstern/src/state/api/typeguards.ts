import { PensjonsavtaleKategori } from '@/types/enums'

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

export const isPensjonsavtale = (data?: any): data is Pensjonsavtale => {
  return (
    data !== null &&
    data !== undefined &&
    !Array.isArray(data) &&
    data.produktbetegnelse &&
    typeof data.produktbetegnelse === 'string' &&
    data.kategori &&
    isSomeEnumKey(PensjonsavtaleKategori)(data.kategori) &&
    data.startAlder &&
    typeof data.startAlder === 'number' &&
    data.startMaaned &&
    typeof data.startMaaned === 'number' &&
    data.utbetalingsperiode &&
    data.utbetalingsperiode.startAlder &&
    typeof data.utbetalingsperiode.startAlder === 'number' &&
    data.utbetalingsperiode.startMaaned &&
    typeof data.utbetalingsperiode.startMaaned === 'number' &&
    data.utbetalingsperiode.grad &&
    typeof data.utbetalingsperiode.grad === 'number' &&
    data.utbetalingsperiode.aarligUtbetaling &&
    typeof data.utbetalingsperiode.aarligUtbetaling === 'number'
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
