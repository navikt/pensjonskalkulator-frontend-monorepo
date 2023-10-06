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

// TODO PEK-163 ta høyde for oversettelser
export function getMaanedString(
  formatFn: (a: { id: string }) => string,
  maaned?: number
) {
  if (maaned !== undefined && maaned > 0) {
    return ` ${formatFn({
      id: 'grunnlag.pensjonsavtaler.og',
    })} ${maaned} ${formatFn({
      id: 'grunnlag.pensjonsavtaler.md',
    })}`
  }
  return ''
}
