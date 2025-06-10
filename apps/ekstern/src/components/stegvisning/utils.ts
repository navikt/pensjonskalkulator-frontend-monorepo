import {
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
  stegvisningOrderKap19,
} from '@/router/constants'

export const getStepArrays = (
  isEndring: boolean | undefined,
  isKap19: string | boolean | undefined
): (typeof paths)[keyof typeof paths][] => {
  return [
    ...(isKap19
      ? stegvisningOrderKap19
      : isEndring
        ? stegvisningOrderEndring
        : stegvisningOrder),
  ]
}

export const STEGVISNING_FORM_NAMES = {
  afp: 'stegvisning-afp',
  samtykkeOffentligAFP: 'stegvisning-samtykke-offentlig-afp',
  samtykkePensjonsavtaler: 'stegvisning-samtykke-pensjonsavtaler',
  sivilstand: 'stegvisning-sivilstand',
  utenlandsopphold: 'stegvisning-utenlandsopphold',
}
