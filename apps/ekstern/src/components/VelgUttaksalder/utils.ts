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
  end: Uttaksalder = { aar: 75, maaned: 0, uttaksdato: '0000-00-00' }
): string[] => {
  if (end.aar < start.aar) {
    return []
  }

  const aldere: string[] = [formatUttaksalder(start, { compact: true })]

  for (let i = start.aar + 1; i <= end.aar; i++) {
    aldere.push(
      formatUttaksalder({ aar: i, maaned: 0, uttaksdato: '0000-00-00' })
    )
  }

  return aldere
}
