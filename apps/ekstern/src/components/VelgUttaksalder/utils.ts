export const DEFAULT_TIDLIGST_UTTAKSALDER: Omit<Uttaksalder, 'uttaksdato'> = {
  aar: 62,
  maaned: 0,
}
export const DEFAULT_SENEST_UTTAKSALDER: Omit<Uttaksalder, 'uttaksdato'> = {
  aar: 75,
  maaned: 0,
}

export const formatUttaksalder = (
  { aar, maaned }: UttaksalderForenklet,
  options: { compact: boolean } = { compact: false }
): string => {
  if (maaned === 0) {
    return `${aar} år`
  }
  return options.compact
    ? `${aar} år og ${maaned} md.`
    : `${aar} år og ${maaned} ${maaned > 1 ? 'måneder' : 'måned'}`
}

export const getFormaterteAldere = (
  start: UttaksalderForenklet,
  end: UttaksalderForenklet = {
    ...DEFAULT_SENEST_UTTAKSALDER,
  }
): string[] => {
  if (end.aar < start.aar) {
    return []
  }
  const aldere: string[] = [formatUttaksalder(start, { compact: true })]
  for (let i = start.aar + 1; i <= end.aar; i++) {
    aldere.push(formatUttaksalder({ aar: i, maaned: 0 }))
  }
  return aldere
}
