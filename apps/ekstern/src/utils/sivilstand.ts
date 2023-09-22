export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export const formatSivilstand = (
  sivilstand: Sivilstand,
  showSamboerskap?: { harSamboer: boolean }
): string => {
  const sivilstandMap: Record<Sivilstand, string> = {
    GIFT: 'Gift',
    UGIFT: 'Ugift',
    REGISTRERT_PARTNER: 'Registrert partner',
    ENKE_ELLER_ENKEMANN: 'Enke/enkemann',
    SKILT: 'Skilt',
    SEPARERT: 'Separert',
    SEPARERT_PARTNER: 'Separert partner',
    SKILT_PARTNER: 'Skilt partner',
    GJENLEVENDE_PARTNER: 'Gjenlevende partner',
    UOPPGITT: 'Ugift',
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
