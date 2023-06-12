import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler.json' assert { type: 'json' }
import { groupPensjonsavtalerByType } from '@/components/Grunnlag/accordion-items/Pensjonsavtaler-utils'
import { PensjonsavtaleType } from '@/types/enums'

describe('groupPensjonsavtaler-utils', () => {
  describe('groupPensjonsavtalerByType', () => {
    it('returnerer tomt object når det ikke er noe pensjonsvtaler å grupperer', () => {
      expect(groupPensjonsavtalerByType([])).toEqual({})
    })

    it('returnerer riktig navn på grupper', () => {
      const grouped = groupPensjonsavtalerByType(pensjonsavtalerData)
      const keys = Object.keys(grouped)
      expect(keys).toHaveLength(6)
      expect(keys).toEqual(Object.values(PensjonsavtaleType))
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(pensjonsavtalerData)

      expect(grouped[PensjonsavtaleType.INNSKUDD]).toHaveLength(1)
      expect(grouped[PensjonsavtaleType.INNSKUDD_KOLL]).toHaveLength(1)
      expect(grouped[PensjonsavtaleType.PRIVAT_TP]).toHaveLength(2)
      expect(grouped[PensjonsavtaleType.OFFENTLIG_TP]).toHaveLength(1)
      expect(grouped[PensjonsavtaleType.FRIPOLISE]).toHaveLength(1)
      expect(grouped[PensjonsavtaleType.EGEN_SPARING]).toHaveLength(1)
    })
  })
})
