import { vi } from 'vitest'

import pensjonsavtalerData from '../../../mocks/data/pensjonsavtaler/67.json' assert { type: 'json' }
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
        'individuelle ordninger',
      ])
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)
      expect(grouped['andre avtaler']).toHaveLength(1)
      expect(grouped['individuelle ordninger']).toHaveLength(2)
      expect(grouped['offentlig tjenestepensjon']).toHaveLength(1)
      expect(grouped['privat tjenestepensjon']).toHaveLength(2)
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
        id: 'string.og',
      })
      expect(mockFn).toHaveBeenNthCalledWith(2, {
        id: 'alder.md',
      })
      expect(getMaanedString(mockFn, 5)).toEqual(' string 5 string')
    })
  })
})
