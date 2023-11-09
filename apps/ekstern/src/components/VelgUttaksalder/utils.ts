import { IntlShape } from 'react-intl'

export const DEFAULT_TIDLIGST_UTTAKSALDER: Alder = {
  aar: 62,
  maaneder: 0,
}
export const DEFAULT_SENEST_UTTAKSALDER: Alder = {
  aar: 75,
  maaneder: 0,
}

export const formatUttaksalder = (
  intl: IntlShape,
  { aar, maaneder }: Alder,
  options: { compact: boolean } = { compact: false }
): string => {
  const alderOg = intl.formatMessage({ id: 'string.og' })
  const alderAar = intl.formatMessage({ id: 'alder.aar' })
  const alderMd = intl.formatMessage({ id: 'alder.md' })
  const alderMaaned = intl.formatMessage({ id: 'alder.maaned' })
  const alderMaaneder = intl.formatMessage({ id: 'alder.maaneder' })

  if (maaneder === 0) {
    return `${aar} ${alderAar}`
  }

  return options.compact
    ? `${aar} ${alderAar} ${alderOg} ${maaneder} ${alderMd}`
    : `${aar} ${alderAar} ${alderOg} ${maaneder} ${
        maaneder > 1 ? alderMaaneder : alderMaaned
      }`
}

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
