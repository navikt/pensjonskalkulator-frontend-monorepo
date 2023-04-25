export const generateAlderArray = (
  startAlder: number,
  endAlder: number,
  formatertTidligsteMuligeUttaksalder: string
) => {
  const alderArray: string[] = []
  for (let i = startAlder; i <= endAlder; i++) {
    if (i === startAlder) {
      alderArray.push(formatertTidligsteMuligeUttaksalder)
    } else {
      alderArray.push(`${i.toString()} år`)
    }
  }
  return alderArray
}

export const formatUttaksalder = (
  { aar, maaned }: Uttaksalder,
  options: { compact: boolean } = { compact: false }
): string => {
  return maaned !== 0
    ? `${aar} år og ${maaned} ${options.compact ? 'md.' : 'måneder'}`
    : `${aar} år`
}
