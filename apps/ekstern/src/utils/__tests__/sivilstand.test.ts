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
        ['UOPPGITT', 'sivilstand.ugift'],
        ['UGIFT', 'sivilstand.ugift'],
        ['GIFT', 'sivilstand.gift'],
        ['ENKE_ELLER_ENKEMANN', 'sivilstand.enke_enkemann'],
        ['SKILT', 'sivilstand.skilt'],
        ['SEPARERT', 'sivilstand.separert'],
        ['REGISTRERT_PARTNER', 'sivilstand.registrert_partner'],
        ['SEPARERT_PARTNER', 'sivilstand.separert_partner'],
        ['SKILT_PARTNER', 'sivilstand.skilt_partner'],
        ['GJENLEVENDE_PARTNER', 'sivilstand.gjenlevende_partner'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })
    })

    describe('returnerer riktig formatert sivilstand sivilstand.med_samboerskap', () => {
      test.each([
        ['UOPPGITT', 'sivilstand.ugift, sivilstand.med_samboer'],
        ['UGIFT', 'sivilstand.ugift, sivilstand.med_samboer'],
        ['GIFT', 'sivilstand.gift'],
        [
          'ENKE_ELLER_ENKEMANN',
          'sivilstand.enke_enkemann, sivilstand.med_samboer',
        ],
        ['SKILT', 'sivilstand.skilt, sivilstand.med_samboer'],
        ['SEPARERT', 'sivilstand.separert, sivilstand.med_samboer'],
        ['REGISTRERT_PARTNER', 'sivilstand.registrert_partner'],
        [
          'SEPARERT_PARTNER',
          'sivilstand.separert_partner, sivilstand.med_samboer',
        ],
        ['SKILT_PARTNER', 'sivilstand.skilt_partner, sivilstand.med_samboer'],
        [
          'GJENLEVENDE_PARTNER',
          'sivilstand.gjenlevende_partner, sivilstand.med_samboer',
        ],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand, {
          harSamboer: true,
        })
        expect(sivilstand).toEqual(expected)
      })

      test.each([
        ['UOPPGITT', 'sivilstand.ugift, sivilstand.uten_samboer'],
        ['UGIFT', 'sivilstand.ugift, sivilstand.uten_samboer'],
        ['GIFT', 'sivilstand.gift'],
        [
          'ENKE_ELLER_ENKEMANN',
          'sivilstand.enke_enkemann, sivilstand.uten_samboer',
        ],
        ['SKILT', 'sivilstand.skilt, sivilstand.uten_samboer'],
        ['SEPARERT', 'sivilstand.separert, sivilstand.uten_samboer'],
        ['REGISTRERT_PARTNER', 'sivilstand.registrert_partner'],
        [
          'SEPARERT_PARTNER',
          'sivilstand.separert_partner, sivilstand.uten_samboer',
        ],
        ['SKILT_PARTNER', 'sivilstand.skilt_partner, sivilstand.uten_samboer'],
        [
          'GJENLEVENDE_PARTNER',
          'sivilstand.gjenlevende_partner, sivilstand.uten_samboer',
        ],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(intlMock, a as Sivilstand, {
          harSamboer: false,
        })
        expect(sivilstand).toEqual(expected)
      })
    })
  })
})
