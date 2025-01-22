import { IntlShape } from 'react-intl'

import { checkHarSamboer, formatSivilstand } from '@/utils/sivilstand'

describe('sivilstand-utils', () => {
  describe('checkHarSamboer', () => {
    test.each([
      ['UOPPGITT', false],
      ['UGIFT', false],
      ['GIFT', true],
      ['ENKE_ELLER_ENKEMANN', false],
      ['SKILT', false],
      ['SEPARERT', false],
      ['REGISTRERT_PARTNER', true],
      ['SEPARERT_PARTNER', false],
      ['SKILT_PARTNER', false],
      ['GJENLEVENDE_PARTNER', false],
    ])('Viser riktig samboerskap når sivilstand er: %s', (a, expected) => {
      expect(checkHarSamboer(a as Sivilstand)).toEqual(expected)
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
})
