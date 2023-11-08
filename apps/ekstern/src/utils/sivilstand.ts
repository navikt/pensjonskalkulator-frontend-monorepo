export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export const formatSivilstand = (
  sivilstand: Sivilstand,
  showSamboerskap?: { harSamboer: boolean }
): string => {
  const sivilstandMap: Record<Sivilstand, string> = {
    UNKNOWN: 'Ugift',
    UOPPGITT: 'Ugift',
    UGIFT: 'Ugift',
    GIFT: 'Gift',
    ENKE_ELLER_ENKEMANN: 'Enke/enkemann',
    SKILT: 'Skilt',
    SEPARERT: 'Separert',
    REGISTRERT_PARTNER: 'Registrert partner',
    SEPARERT_PARTNER: 'Separert partner',
    SKILT_PARTNER: 'Skilt partner',
    GJENLEVENDE_PARTNER: 'Gjenlevende partner',
  }

  const formatertSivilstand = sivilstandMap[sivilstand]

  if (checkHarSamboer(sivilstand)) {
    return formatertSivilstand
  }

  return showSamboerskap !== undefined
    ? `${formatertSivilstand}, ${
        showSamboerskap?.harSamboer ? 'med samboer' : 'uten samboer'
      }`
    : formatertSivilstand
}
