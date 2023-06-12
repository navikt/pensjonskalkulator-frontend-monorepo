import { PensjonsavtaleType } from '@/types/enums'

export const isPensjonsberegningArray = (
  data?: any
): data is Pensjonsberegning[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (beregning) =>
        typeof beregning.alder === 'number' &&
        typeof beregning.belop === 'number'
    )
  )
}

export const isPensjonsavtale = (data?: any): data is Pensjonsavtale[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (pensjonsavtale) =>
        typeof pensjonsavtale.navn === 'string' &&
        isSomeEnumKey(PensjonsavtaleType)(pensjonsavtale.type) &&
        typeof pensjonsavtale.startAar === 'number' &&
        typeof pensjonsavtale.startMaaned === 'number' &&
        typeof pensjonsavtale.grad === 'number' &&
        typeof pensjonsavtale.beholdning === 'number'
    )
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

export const isPerson = (data?: any): data is Person => {
  return (
    [
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
    ].includes(data?.sivilstand) && typeof data.fornavn === 'string'
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

export const isSomeEnumKey =
  <T extends { [s: string]: unknown }>(e: T) =>
  (token: unknown): token is T[keyof T] => {
    return Object.keys(e).includes(token as string)
  }
