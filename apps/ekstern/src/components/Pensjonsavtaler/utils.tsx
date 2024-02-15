import { IntlShape } from 'react-intl'

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

export const formaterSluttAlderString =
  (intl: IntlShape) => (startAlder: Alder, sluttAlder: Alder) => {
    return `${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.fra',
    })} ${startAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${getMaanedString(
      intl.formatMessage,
      startAlder.maaneder
    )} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.til',
    })} ${sluttAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${
      sluttAlder.maaneder && sluttAlder.maaneder < 11
        ? getMaanedString(intl.formatMessage, sluttAlder.maaneder)
        : ''
    }`
  }

export const formaterLivsvarigString =
  (intl: IntlShape) => (startAlder: Alder) => {
    return `${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.livsvarig',
    })} ${startAlder.aar} ${intl.formatMessage({
      id: 'grunnlag.pensjonsavtaler.aar',
    })}${
      startAlder.maaneder
        ? getMaanedString(intl.formatMessage, startAlder.maaneder)
        : ''
    }`
  }
