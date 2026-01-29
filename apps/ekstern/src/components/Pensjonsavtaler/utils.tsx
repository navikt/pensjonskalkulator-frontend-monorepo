import { HeadingProps } from '@navikt/ds-react'

import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

export const groupPensjonsavtalerByType = (
  pensjonsavtaler: Pensjonsavtale[]
): Record<
  (typeof pensjonsavtalerKategoriMapObj)[keyof typeof pensjonsavtalerKategoriMapObj],
  Pensjonsavtale[]
> => {
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

export interface PrivatePensjonsavtalerProps {
  isPartialResponse: boolean
  isError?: boolean
  isSuccess: boolean
  headingLevel: HeadingProps['level']
  privatePensjonsavtaler?: Pensjonsavtale[]
}
