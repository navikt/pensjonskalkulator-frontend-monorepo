import { describe, expect, it } from 'vitest'

import {
  getTranslatedLand,
  getTranslatedLandFromLandkode,
  harKravOmArbeidFromLandkode,
} from '../land'

describe('translations-utils', () => {
  describe('getTranslatedLand', () => {
    const land = {
      landkode: 'NLD',
      kravOmArbeid: true,
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

  describe('getTranslatedLandFromLandkode', () => {
    it('returnerer landkode når landet ikke finnes', () => {
      const locale = getTranslatedLandFromLandkode('RANDOM', 'nb')
      expect(locale).toBe('RANDOM')
    })

    it('returnerer riktig streng med nb locale', () => {
      const locale = getTranslatedLandFromLandkode('NLD', 'nb')
      expect(locale).toBe('Nederland')
    })

    it('returnerer riktig streng med nn locale', () => {
      const locale = getTranslatedLandFromLandkode('NLD', 'nn')
      expect(locale).toBe('Nederland')
    })

    it('returnerer riktig streng med en locale', () => {
      const locale = getTranslatedLandFromLandkode('NLD', 'en')
      expect(locale).toBe('Netherlands')
    })
  })

  describe('harKravOmArbeidFromLandkode', () => {
    it('returnerer false når landet ikke finnes', () => {
      expect(harKravOmArbeidFromLandkode('RANDOM')).toBeFalsy()
    })

    it('returnerer true når landet er har krav om arbeid', () => {
      expect(harKravOmArbeidFromLandkode('FRA')).toBeTruthy()
    })

    it('returnerer false når landet ikke er avtaleland', () => {
      expect(harKravOmArbeidFromLandkode('NLD')).toBeFalsy()
      expect(harKravOmArbeidFromLandkode('NPL')).toBeFalsy()
    })
  })
})
