export const isPensjonsberegning = (
  data?: any
): data is Pensjonsberegning[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (beregning) =>
        typeof beregning.alder === 'number' &&
        typeof beregning.pensjonsaar === 'number' &&
        typeof beregning.pensjonsbeloep === 'number'
    )
  )
}

export const isTidligsteMuligeUttaksalder = (
  data?: any
): data is Uttaksalder => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.aar === 'number' &&
    typeof data.maaned === 'number'
  )
}

export const isPerson = (data?: any): data is Person => {
  return [
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
  ].includes(data?.sivilstand)
}

export const isUnleashToggle = (data?: any): data is UnleashToggle => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.enabled === 'boolean'
  )
}
