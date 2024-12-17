import pensjonsavtalerData from '../../../mocks/data/pensjonsavtaler/67.json' with { type: 'json' }
import { groupPensjonsavtalerByType } from '../utils'

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
      expect(keys).toHaveLength(3)
      expect(keys).toEqual([
        'andre avtaler',
        'privat tjenestepensjon',
        'individuelle ordninger',
      ])
    })

    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(avtalerWithKeys)
      expect(grouped['andre avtaler']).toHaveLength(1)
      expect(grouped['individuelle ordninger']).toHaveLength(2)
      expect(grouped['privat tjenestepensjon']).toHaveLength(3)
    })
  })
})
