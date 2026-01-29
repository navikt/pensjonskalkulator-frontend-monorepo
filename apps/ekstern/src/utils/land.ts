import landListeData from '../assets/land-liste.json' with { type: 'json' }

export const getTranslatedLand = (land: Land, locale: Locales) => {
  switch (locale) {
    case 'en':
      return land.engelskNavn
    case 'nn':
      return land.nynorskNavn
    default:
      return land.bokmaalNavn
  }
}

export const getTranslatedLandFromLandkode = (
  landkode: string,
  locale: Locales
) => {
  const selectedLand = landListeData.find(
    (land: Land) => land.landkode === landkode
  )
  if (!selectedLand) {
    return landkode
  }
  return getTranslatedLand(selectedLand as Land, locale)
}

export const harKravOmArbeidFromLandkode = (landkode: string) => {
  const selectedLand = landListeData.find(
    (land: Land) => land.landkode === landkode
  )
  if (!selectedLand) {
    return false
  }
  return !!selectedLand.kravOmArbeid
}
