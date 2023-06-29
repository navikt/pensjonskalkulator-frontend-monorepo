import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler.json' assert { type: 'json' }
import { groupPensjonsavtalerByType } from '../Pensjonsavtaler-utils'
import { PensjonsavtaleKategori } from '@/types/enums'

describe('groupPensjonsavtaler-utils', () => {
  describe('groupPensjonsavtalerByType', () => {
    it('returnerer tomt object når det ikke er noe pensjonsvtaler å grupperer', () => {
      expect(groupPensjonsavtalerByType([])).toEqual({})
    })

    it('returnerer riktig navn på grupper', () => {
      const grouped = groupPensjonsavtalerByType(pensjonsavtalerData.avtaler)
      const keys = Object.keys(grouped)
      expect(keys).toHaveLength(6)
      expect(keys).toEqual(Object.values(PensjonsavtaleKategori))
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(pensjonsavtalerData.avtaler)

      expect(grouped[PensjonsavtaleKategori.INNSKUDD]).toHaveLength(1)
      expect(grouped[PensjonsavtaleKategori.INNSKUDD_KOLL]).toHaveLength(1)
      expect(grouped[PensjonsavtaleKategori.PRIVAT_TP]).toHaveLength(2)
      expect(grouped[PensjonsavtaleKategori.OFFENTLIG_TP]).toHaveLength(1)
      expect(grouped[PensjonsavtaleKategori.FRIPOLISE]).toHaveLength(1)
      expect(grouped[PensjonsavtaleKategori.EGEN_SPARING]).toHaveLength(1)
    })
  })
})
