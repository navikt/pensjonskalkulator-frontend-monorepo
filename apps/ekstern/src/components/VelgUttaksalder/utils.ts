export const DEFAULT_TIDLIGST_UTTAKSALDER: Omit<Uttaksalder, 'uttaksdato'> = {
  aar: 62,
  maaned: 1,
}
export const DEFAULT_SENEST_UTTAKSALDER: Omit<Uttaksalder, 'uttaksdato'> = {
  aar: 75,
  maaned: 1,
}

export const formatUttaksalder = (
  { aar, maaned }: UttaksalderForenklet,
  options: { compact: boolean } = { compact: false }
): string => {
  return maaned > 1
    ? `${aar} år og ${maaned} ${options.compact ? 'md.' : 'måneder'}`
    : `${aar} år`
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
    aldere.push(formatUttaksalder({ aar: i, maaned: 1 }))
  }
  return aldere
}
