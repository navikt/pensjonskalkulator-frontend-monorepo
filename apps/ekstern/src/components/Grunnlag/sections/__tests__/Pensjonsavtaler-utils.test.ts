import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler.json' assert { type: 'json' }
import {
  groupPensjonsavtalerByType,
  getPensjonsavtalerTittel,
  getMaanedString,
} from '../utils'
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

  describe('getPensjonsavtalerTittel', () => {
    it('returnerer riktig streng når samtykke er false', () => {
      expect(getPensjonsavtalerTittel(false, true, '12')).toEqual(
        'Ikke innhentet'
      )
      expect(getPensjonsavtalerTittel(false, false, '12')).toEqual(
        'Ikke innhentet'
      )
    })

    it('returnerer riktig streng når showError er true', () => {
      expect(getPensjonsavtalerTittel(true, true, '12')).toEqual(
        'Kan ikke hentes'
      )
    })

    it('returnerer riktig streng når samtykke er true og showError er false', () => {
      expect(getPensjonsavtalerTittel(true, false, '12')).toEqual('12')
    })
  })

  describe('getMaanedString', () => {
    it('returnerer tom streng når måned er undefined eller mindre eller lik 1', () => {
      expect(getMaanedString()).toEqual('')
      expect(getMaanedString(0)).toEqual('')
      expect(getMaanedString(1)).toEqual('')
    })
    it('returnerer riktig streng når måned større enn 1', () => {
      expect(getMaanedString(2)).toEqual('og 2 mnd.')
    })
  })
})
