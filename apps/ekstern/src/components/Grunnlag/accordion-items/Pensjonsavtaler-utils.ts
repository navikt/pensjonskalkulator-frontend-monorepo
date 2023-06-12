import { PensjonsavtaleType } from '@/types/enums'

type PensjonsavtaleRecord = {
  [key in PensjonsavtaleType]?: Pensjonsavtale[]
}

export const groupPensjonsavtalerByType = (
  pensjonsavtaler: Pensjonsavtale[]
): PensjonsavtaleRecord => {
  const record: PensjonsavtaleRecord = {}

  for (const avtale of pensjonsavtaler) {
    const avtaletype =
      PensjonsavtaleType[avtale.type as keyof typeof PensjonsavtaleType]

    if (!Array.isArray(record[avtaletype])) {
      record[avtaletype] = [avtale]
    } else {
      record[avtaletype]?.push(avtale)
    }
  }
  return record
}
