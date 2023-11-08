import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

export const groupPensjonsavtalerByType = (
  pensjonsavtaler: Pensjonsavtale[]
): Record<string, Pensjonsavtale[]> => {
  const record: Record<string, Pensjonsavtale[]> = {}

  for (const avtale of pensjonsavtaler) {
    const avtaleString = pensjonsavtalerKategoriMapObj[avtale.kategori]

    if (!Array.isArray(record[avtaleString])) {
      record[avtaleString] = [avtale]
    } else {
      record[avtaleString]?.push(avtale)
    }
  }
  return record
}

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
