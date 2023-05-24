type PensjonsavtaleRecord = {
  [key in Pensjonsavtale['type']]?: Pensjonsavtale[]
}

export const groupPensjonsavtalerByType = (
  pensjonsavtaler: Pensjonsavtale[]
): PensjonsavtaleRecord => {
  const record: PensjonsavtaleRecord = {}

  for (const avtale of pensjonsavtaler) {
    if (!Array.isArray(record[avtale.type])) {
      record[avtale.type] = [avtale]
    } else {
      record[avtale.type]?.push(avtale)
    }
  }

  return record
}
