import { IntlShape } from 'react-intl'

import { DEFAULT_SENEST_UTTAKSALDER, formatUttaksalder } from '@/utils/alder'

export const getFormaterteAldere = (
  intl: IntlShape,
  start: Alder,
  end: Alder = {
    ...DEFAULT_SENEST_UTTAKSALDER,
  }
): string[] => {
  if (end.aar < start.aar) {
    return []
  }
  const aldere: string[] = [formatUttaksalder(intl, start, { compact: true })]
  for (let i = start.aar + 1; i <= end.aar; i++) {
    aldere.push(formatUttaksalder(intl, { aar: i, maaneder: 0 }))
  }
  return aldere
}
