export const DEFAULT_TIDLIGST_UTTAKSALDER: Alder = {
  aar: 62,
  maaneder: 0,
}
export const DEFAULT_SENEST_UTTAKSALDER: Alder = {
  aar: 75,
  maaneder: 0,
}

export const formatUttaksalder = (
  { aar, maaneder }: Alder,
  options: { compact: boolean } = { compact: false }
): string => {
  if (maaneder === 0) {
    return `${aar} år`
  }
  return options.compact
    ? `${aar} år og ${maaneder} md.`
    : `${aar} år og ${maaneder} ${maaneder > 1 ? 'måneder' : 'måned'}`
}

export const getFormaterteAldere = (
  start: Alder,
  end: Alder = {
    ...DEFAULT_SENEST_UTTAKSALDER,
  }
): string[] => {
  if (end.aar < start.aar) {
    return []
  }
  const aldere: string[] = [formatUttaksalder(start, { compact: true })]
  for (let i = start.aar + 1; i <= end.aar; i++) {
    aldere.push(formatUttaksalder({ aar: i, maaneder: 0 }))
  }
  return aldere
}
