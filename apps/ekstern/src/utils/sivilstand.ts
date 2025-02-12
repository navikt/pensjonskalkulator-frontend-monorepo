import { IntlShape } from 'react-intl'

export function isSivilstandUkjent(sivilstand?: Sivilstand): boolean {
  if (!sivilstand) return false
  return ['UNKNOWN', 'UOPPGITT'].includes(sivilstand)
}

export function harSamboer(sivilstand?: Sivilstand | null): boolean {
  if (!sivilstand) return false
  const samboerSivilstander = ['SAMBOER', 'GIFT', 'REGISTRERT_PARTNER']
  return samboerSivilstander.includes(sivilstand)
}

export const sivilstandOptions = [
  'ENKE_ELLER_ENKEMANN',
  'GIFT',
  'GJENLEVENDE_PARTNER',
  'REGISTRERT_PARTNER',
  'SAMBOER',
  'SEPARERT_PARTNER',
  'SEPARERT',
  'SKILT',
  'SKILT_PARTNER',
  'UGIFT',
]
export const getSivilstandTekst = (
  intl: IntlShape,
  sivilstandTekst: Sivilstand
) => {
  switch (sivilstandTekst) {
    case 'GIFT':
      return intl.formatMessage({ id: 'stegvisning.sivilstand.ektefellen' })
    case 'REGISTRERT_PARTNER':
      return intl.formatMessage({ id: 'stegvisning.sivilstand.partneren' })
    case 'SAMBOER':
      return intl.formatMessage({ id: 'stegvisning.sivilstand.samboeren' })
  }
}

export const formatSivilstand = (
  intl: IntlShape,
  sivilstand: Sivilstand
): string => {
  const sivilstandMap: Record<Sivilstand, string> = {
    UNKNOWN: intl.formatMessage({ id: 'sivilstand.UGIFT' }),
    UOPPGITT: intl.formatMessage({ id: 'sivilstand.UGIFT' }),
    UGIFT: intl.formatMessage({ id: 'sivilstand.UGIFT' }),
    GIFT: intl.formatMessage({ id: 'sivilstand.GIFT' }),
    ENKE_ELLER_ENKEMANN: intl.formatMessage({
      id: 'sivilstand.ENKE_ELLER_ENKEMANN',
    }),
    SKILT: intl.formatMessage({ id: 'sivilstand.SKILT' }),
    SEPARERT: intl.formatMessage({ id: 'sivilstand.SEPARERT' }),
    REGISTRERT_PARTNER: intl.formatMessage({
      id: 'sivilstand.REGISTRERT_PARTNER',
    }),
    SEPARERT_PARTNER: intl.formatMessage({ id: 'sivilstand.SEPARERT_PARTNER' }),
    SKILT_PARTNER: intl.formatMessage({ id: 'sivilstand.SKILT_PARTNER' }),
    GJENLEVENDE_PARTNER: intl.formatMessage({
      id: 'sivilstand.GJENLEVENDE_PARTNER',
    }),
    SAMBOER: intl.formatMessage({ id: 'sivilstand.SAMBOER' }),
  }

  return sivilstandMap[sivilstand]
}
