import {
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
} from '@/router/constants'

export const STEGVISNING_FORM_NAMES = {
  afp: 'stegvisning-afp',
  samtykkeOffentligAFP: 'stegvisning-samtykke-offentlig-afp',
  samtykkePensjonsavtaler: 'stegvisning-samtykke-pensjonsavtaler',
  sivilstand: 'stegvisning-sivilstand',
  utenlandsopphold: 'stegvisning-utenlandsopphold',
}

export const getStepArrays = (
  isEndring: boolean | undefined
): Array<(typeof paths)[keyof typeof paths]> => {
  return isEndring ? [...stegvisningOrderEndring] : [...stegvisningOrder]
}
