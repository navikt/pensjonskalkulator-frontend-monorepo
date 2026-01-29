import { IntlShape } from 'react-intl'

import {
  checkHarSamboer,
  formatSivilstand,
  getSivilstandTekst,
  isSivilstandUkjent,
  sivilstandOptions,
} from '@/utils/sivilstand'

describe('sivilstand-utils', () => {
  describe('getSivilstandTekst', () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape
    describe('returnerer riktig sivilstand tekst', () => {
      test.each([
        ['GIFT', 'stegvisning.sivilstand.ektefellen'],
        ['REGISTRERT_PARTNER', 'stegvisning.sivilstand.partneren'],
        ['SAMBOER', 'stegvisning.sivilstand.samboeren'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = getSivilstandTekst(intlMock, a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })
    })
  })
  describe('formatSivilstand', () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape
    describe('returnerer riktig formatert sivilstand', () => {
      test.each([
        ['UOPPGITT', 'sivilstand.UGIFT'],
        ['UGIFT', 'sivilstand.UGIFT'],
        ['GIFT', 'sivilstand.GIFT'],
        ['ENKE_ELLER_ENKEMANN', 'sivilstand.ENKE_ELLER_ENKEMANN'],
        ['SKILT', 'sivilstand.SKILT'],
        ['SEPARERT', 'sivilstand.SEPARERT'],
        ['REGISTRERT_PARTNER', 'sivilstand.REGISTRERT_PARTNER'],
        ['SEPARERT_PARTNER', 'sivilstand.SEPARERT_PARTNER'],
        ['SKILT_PARTNER', 'sivilstand.SKILT_PARTNER'],
        ['GJENLEVENDE_PARTNER', 'sivilstand.GJENLEVENDE_PARTNER'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })
    })

    describe('returnerer riktig formatert sivilstand sivilstand.med_samboerskap', () => {
      test.each([
        ['UOPPGITT', 'sivilstand.UGIFT'],
        ['UGIFT', 'sivilstand.UGIFT'],
        ['GIFT', 'sivilstand.GIFT'],
        ['ENKE_ELLER_ENKEMANN', 'sivilstand.ENKE_ELLER_ENKEMANN'],
        ['SKILT', 'sivilstand.SKILT'],
        ['SEPARERT', 'sivilstand.SEPARERT'],
        ['REGISTRERT_PARTNER', 'sivilstand.REGISTRERT_PARTNER'],
        ['SEPARERT_PARTNER', 'sivilstand.SEPARERT_PARTNER'],
        ['SKILT_PARTNER', 'sivilstand.SKILT_PARTNER'],
        ['GJENLEVENDE_PARTNER', 'sivilstand.GJENLEVENDE_PARTNER'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })

      test.each([
        ['UOPPGITT', 'sivilstand.UGIFT'],
        ['UGIFT', 'sivilstand.UGIFT'],
        ['GIFT', 'sivilstand.GIFT'],
        ['ENKE_ELLER_ENKEMANN', 'sivilstand.ENKE_ELLER_ENKEMANN'],
        ['SKILT', 'sivilstand.SKILT'],
        ['SEPARERT', 'sivilstand.SEPARERT'],
        ['REGISTRERT_PARTNER', 'sivilstand.REGISTRERT_PARTNER'],
        ['SEPARERT_PARTNER', 'sivilstand.SEPARERT_PARTNER'],
        ['SKILT_PARTNER', 'sivilstand.SKILT_PARTNER'],
        ['GJENLEVENDE_PARTNER', 'sivilstand.GJENLEVENDE_PARTNER'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })
    })
  })

  describe('isSivilstandUkjent', () => {
    it('er ukjent sivilstand', () => {
      const actual = ['UNKNOWN', 'UOPPGITT'].map((it) =>
        isSivilstandUkjent(it as Sivilstand)
      )

      expect(actual.every((it) => it)).toBe(true)
    })

    it('er kjent sivilstand', () => {
      const actual = sivilstandOptions.map((it) =>
        isSivilstandUkjent(it as Sivilstand)
      )

      expect(actual.every((it) => !it)).toBe(true)
    })
  })

  describe('checkHarSamboer', () => {
    it('returnerer true når sivilstand er GIFT', () => {
      const actual = checkHarSamboer('GIFT')
      expect(actual).toBe(true)
    })

    it('returnerer false når sivilstand er UGIFT', () => {
      const actual = checkHarSamboer('UGIFT')
      expect(actual).toBe(false)
    })

    it('returnerer false når sivilstand er undefined', () => {
      const actual = checkHarSamboer(undefined)
      expect(actual).toBe(false)
    })
  })
})
