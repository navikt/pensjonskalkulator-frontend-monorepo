export type UtenlandsoppholdFormNames =
  (typeof UTENLANDSOPPHOLD_FORM_NAMES)[keyof typeof UTENLANDSOPPHOLD_FORM_NAMES]

export const UTENLANDSOPPHOLD_FORM_NAMES = {
  form: 'oppholdet-ditt',
  land: 'land',
  arbeidetUtenlands: 'arbeidet-utenlands',
  startdato: 'startdato',
  sluttdato: 'sluttdato',
}

export const UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS: Record<
  UtenlandsoppholdFormNames,
  string
> = {
  [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
  [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
}

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
