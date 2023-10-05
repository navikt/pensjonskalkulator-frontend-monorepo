import { PensjonsavtaleKategori } from '@/types/enums'

type PensjonsavtaleRecord = {
  [key in PensjonsavtaleKategori]?: Pensjonsavtale[]
}

export const groupPensjonsavtalerByType = (
  pensjonsavtaler: Pensjonsavtale[]
): PensjonsavtaleRecord => {
  const record: PensjonsavtaleRecord = {}

  for (const avtale of pensjonsavtaler) {
    const avtalekategori =
      PensjonsavtaleKategori[
        avtale.kategori as keyof typeof PensjonsavtaleKategori
      ]

    if (!Array.isArray(record[avtalekategori])) {
      record[avtalekategori] = [avtale]
    } else {
      record[avtalekategori]?.push(avtale)
    }
  }
  return record
}

export function getMaanedString(maaned?: number) {
  if (maaned !== undefined && maaned > 0) {
    return ` og ${maaned} md.`
  }
  return ''
}
