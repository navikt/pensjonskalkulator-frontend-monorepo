import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler.json' assert { type: 'json' }
import { groupPensjonsavtalerByType, getMaanedString } from '../utils'
import { PensjonsavtaleKategori } from '@/types/enums'

describe('GrunnlagPensjonsavtaler-utils', () => {
  const avtalerWithKeys = pensjonsavtalerData.avtaler.map((avtale, index) => ({
    ...avtale,
    key: index,
  }))

  describe('groupPensjonsavtalerByType', () => {
    it('returnerer tomt object når det ikke er noe pensjonsvtaler å grupperer', () => {
      expect(groupPensjonsavtalerByType([])).toEqual({})
    })

    it('returnerer riktig navn på grupper', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)
      const keys = Object.keys(grouped)
      expect(keys).toHaveLength(4)
      expect(keys).toEqual([
        'ukjent',
        'privat tjenestepensjon',
        'offentlig tjenestepensjon',
        'individuell ordning',
      ])
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)

      expect(grouped[PensjonsavtaleKategori.NONE]).toHaveLength(1)
      expect(grouped[PensjonsavtaleKategori.UNKNOWN]).toHaveLength(1)
      expect(
        grouped[PensjonsavtaleKategori.OFFENTLIG_TJENESTEPENSJON]
      ).toHaveLength(1)
      expect(
        grouped[PensjonsavtaleKategori.PRIVAT_TJENESTEPENSJON]
      ).toHaveLength(2)
      expect(grouped[PensjonsavtaleKategori.INDIVIDUELL_ORDNING]).toHaveLength(
        2
      )
    })
  })

  describe('getMaanedString', () => {
    it('returnerer tom streng når måned er undefined eller lik 0', () => {
      expect(getMaanedString()).toEqual('')
      expect(getMaanedString(0)).toEqual('')
    })
    it('returnerer riktig streng når måned er større enn 0', () => {
      expect(getMaanedString(1)).toEqual(' og 1 md.')
      expect(getMaanedString(5)).toEqual(' og 5 md.')
    })
  })
})
