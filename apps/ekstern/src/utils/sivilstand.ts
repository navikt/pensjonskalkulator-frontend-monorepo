import { IntlShape } from 'react-intl'

export function checkHarSamboer(sivilstand: Sivilstand): boolean {
  return ['GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
}

export const formatSivilstand = (
  intl: IntlShape,
  sivilstand: Sivilstand,
  showSamboerskap?: { harSamboer: boolean }
): string => {
  const sivilstandMap: Record<Sivilstand, string> = {
    GIFT: intl.formatMessage({ id: 'sivilstand.gift' }),
    UGIFT: intl.formatMessage({ id: 'sivilstand.ugift' }),
    REGISTRERT_PARTNER: intl.formatMessage({
      id: 'sivilstand.registrert_partner',
    }),
    ENKE_ELLER_ENKEMANN: intl.formatMessage({ id: 'sivilstand.enke_enkemann' }),
    SKILT: intl.formatMessage({ id: 'sivilstand.skilt' }),
    SEPARERT: intl.formatMessage({ id: 'sivilstand.separert' }),
    SEPARERT_PARTNER: intl.formatMessage({ id: 'sivilstand.separert_partner' }),
    SKILT_PARTNER: intl.formatMessage({ id: 'sivilstand.skilt_partner' }),
    GJENLEVENDE_PARTNER: intl.formatMessage({
      id: 'sivilstand.gjenlevende_partner',
    }),
    UOPPGITT: intl.formatMessage({ id: 'sivilstand.ugift' }),
  }

  const formatertSivilstand = sivilstandMap[sivilstand]

  if (checkHarSamboer(sivilstand)) {
    return formatertSivilstand
  }

  return showSamboerskap !== undefined
    ? `${formatertSivilstand}, ${
        showSamboerskap?.harSamboer
          ? intl.formatMessage({ id: 'sivilstand.med_samboer' })
          : intl.formatMessage({ id: 'sivilstand.uten_samboer' })
      }`
    : formatertSivilstand
}
