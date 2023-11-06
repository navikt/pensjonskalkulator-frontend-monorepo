import { vi } from 'vitest'

import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler/67.json' assert { type: 'json' }
import { groupPensjonsavtalerByType, getMaanedString } from '../utils'

describe('GrunnlagPensjonsavtaler-utils', () => {
  const avtalerWithKeys = pensjonsavtalerData.avtaler.map(
    (avtale, index) =>
      ({
        ...avtale,
        key: index,
      }) as Pensjonsavtale
  )

  describe('groupPensjonsavtalerByType', () => {
    it('returnerer tomt object når det ikke er noe pensjonsvtaler å grupperer', () => {
      expect(groupPensjonsavtalerByType([])).toEqual({})
    })

    it('returnerer riktig navn på grupper', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)
      const keys = Object.keys(grouped)
      expect(keys).toHaveLength(4)
      expect(keys).toEqual([
        'andre avtaler',
        'privat tjenestepensjon',
        'offentlig tjenestepensjon',
        'individuell ordning',
      ])
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)

      expect(grouped.NONE).toHaveLength(1)
      expect(grouped.UNKNOWN).toHaveLength(1)
      expect(grouped.OFFENTLIG_TJENESTEPENSJON).toHaveLength(1)
      expect(grouped.PRIVAT_TJENESTEPENSJON).toHaveLength(2)
      expect(grouped.INDIVIDUELL_ORDNING).toHaveLength(2)
    })
  })

  describe('getMaanedString', () => {
    it('returnerer tom streng når måned er undefined eller lik 0', () => {
      const mockFn = vi.fn()
      expect(getMaanedString(mockFn)).toEqual('')
      expect(getMaanedString(mockFn, 0)).toEqual('')
      expect(mockFn).not.toHaveBeenCalled()
    })
    it('returnerer riktig streng når måned er større enn 0', () => {
      const mockFn = vi.fn().mockReturnValue('string')
      expect(getMaanedString(mockFn, 1)).toEqual(' string 1 string')
      expect(mockFn).toHaveBeenNthCalledWith(1, {
        id: 'grunnlag.pensjonsavtaler.og',
      })
      expect(mockFn).toHaveBeenNthCalledWith(2, {
        id: 'grunnlag.pensjonsavtaler.md',
      })
      expect(getMaanedString(mockFn, 5)).toEqual(' string 5 string')
    })
  })
})
