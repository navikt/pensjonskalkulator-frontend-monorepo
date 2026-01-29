import { IntlShape } from 'react-intl'

export function isSivilstandUkjent(sivilstand?: Sivilstand): boolean {
  if (!sivilstand) return false
  return ['UNKNOWN', 'UOPPGITT'].includes(sivilstand)
}

export function checkHarSamboer(sivilstand?: Sivilstand | null): boolean {
  if (!sivilstand) return false
  return ['SAMBOER', 'GIFT', 'REGISTRERT_PARTNER'].includes(sivilstand)
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
  const SIVILSTAND_PREFIX = 'sivilstand'
  const sivilstandMap: Record<Sivilstand, string> = {
    UNKNOWN: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.UGIFT` }),
    UOPPGITT: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.UGIFT` }),
    UGIFT: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.UGIFT` }),
    GIFT: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.GIFT` }),
    ENKE_ELLER_ENKEMANN: intl.formatMessage({
      id: `${SIVILSTAND_PREFIX}.ENKE_ELLER_ENKEMANN`,
    }),
    SKILT: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.SKILT` }),
    SEPARERT: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.SEPARERT` }),
    REGISTRERT_PARTNER: intl.formatMessage({
      id: `${SIVILSTAND_PREFIX}.REGISTRERT_PARTNER`,
    }),
    SEPARERT_PARTNER: intl.formatMessage({
      id: `${SIVILSTAND_PREFIX}.SEPARERT_PARTNER`,
    }),
    SKILT_PARTNER: intl.formatMessage({
      id: `${SIVILSTAND_PREFIX}.SKILT_PARTNER`,
    }),
    GJENLEVENDE_PARTNER: intl.formatMessage({
      id: `${SIVILSTAND_PREFIX}.GJENLEVENDE_PARTNER`,
    }),
    SAMBOER: intl.formatMessage({ id: `${SIVILSTAND_PREFIX}.SAMBOER` }),
  }

  return sivilstandMap[sivilstand]
}
