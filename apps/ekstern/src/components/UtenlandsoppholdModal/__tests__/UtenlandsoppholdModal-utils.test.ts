import { getTranslatedLand } from '../utils'

describe('UtenlandsoppholdModal-utils', () => {
  describe('getTranslatedLand', () => {
    const land = {
      landkode: 'NLD',
      erAvtaleland: true,
      bokmaalNavn: 'Nederland',
      nynorskNavn: 'Noe på nynorsk',
      engelskNavn: 'Netherlands',
    }

    it('returnerer riktig streng med nb locale', () => {
      const locale = getTranslatedLand(land, 'nb')
      expect(locale).toBe('Nederland')
    })

    it('returnerer riktig streng med nn locale', () => {
      const locale = getTranslatedLand(land, 'nn')
      expect(locale).toBe('Noe på nynorsk')
    })

    it('returnerer riktig streng med en locale', () => {
      const locale = getTranslatedLand(land, 'en')
      expect(locale).toBe('Netherlands')
    })
  })
})
