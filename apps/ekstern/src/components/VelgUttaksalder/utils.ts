export const DEFAULT_ANTALL_VISIBLE_ALDERCHIPS = 9
export const VIS_FLERE__ALDERE_LABEL_CLOSE = 'Vis flere aldere'
export const VIS_FLERE__ALDERE_LABEL_OPEN = 'Vis færre aldere'

export const formatUttaksalder = (
  { aar, maaned }: Uttaksalder,
  options: { compact: boolean } = { compact: false }
): string => {
  return maaned !== 0
    ? `${aar} år og ${maaned} ${options.compact ? 'md.' : 'måneder'}`
    : `${aar} år`
}

export const getFormaterteAldere = (
  start: Uttaksalder,
  end: Uttaksalder = { aar: 75, maaned: 0 }
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
