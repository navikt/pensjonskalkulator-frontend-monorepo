import { IntlShape } from 'react-intl'

import {
  checkHarSamboer,
  isSivilstandUkjent,
  formatSivilstand,
  getSivilstandTekst,
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

  describe('checkHarSamboer', () => {
    const HAR_SAMBOER_STATES = ['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER']
    it('har samboer', () => {
      const actual = HAR_SAMBOER_STATES.map((s) =>
        checkHarSamboer(s as Sivilstand)
      )

      expect(actual.every((it) => it)).toBe(true)
    })

    it('har ikke samboer', () => {
      const HAR_IKKE_SAMBOER_STATES = sivilstandOptions.filter(
        (s) => HAR_SAMBOER_STATES.indexOf(s) === -1
      ) as UtvidetSivilstand[]

      const actual = HAR_IKKE_SAMBOER_STATES.map((it) => checkHarSamboer(it))

      expect(actual.every((it) => !it)).toBe(true)
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
        isSivilstandUkjent(it as UtvidetSivilstand)
      )

      expect(actual.every((it) => !it)).toBe(true)
    })
  })
})
