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
    describe('returnerer riktig formatert sivilstand', () => {
      test.each([
        ['UOPPGITT', 'Ugift'],
        ['UGIFT', 'Ugift'],
        ['GIFT', 'Gift'],
        ['ENKE_ELLER_ENKEMANN', 'Enke/enkemann'],
        ['SKILT', 'Skilt'],
        ['SEPARERT', 'Separert'],
        ['REGISTRERT_PARTNER', 'Registrert partner'],
        ['SEPARERT_PARTNER', 'Separert partner'],
        ['SKILT_PARTNER', 'Skilt partner'],
        ['GJENLEVENDE_PARTNER', 'Gjenlevende partner'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(a as Sivilstand)
        expect(sivilstand).toEqual(expected)
      })
    })

    describe('returnerer riktig formatert sivilstand med samboerskap', () => {
      test.each([
        ['UOPPGITT', 'Ugift, med samboer'],
        ['UGIFT', 'Ugift, med samboer'],
        ['GIFT', 'Gift'],
        ['ENKE_ELLER_ENKEMANN', 'Enke/enkemann, med samboer'],
        ['SKILT', 'Skilt, med samboer'],
        ['SEPARERT', 'Separert, med samboer'],
        ['REGISTRERT_PARTNER', 'Registrert partner'],
        ['SEPARERT_PARTNER', 'Separert partner, med samboer'],
        ['SKILT_PARTNER', 'Skilt partner, med samboer'],
        ['GJENLEVENDE_PARTNER', 'Gjenlevende partner, med samboer'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(a as Sivilstand, {
          harSamboer: true,
        })
        expect(sivilstand).toEqual(expected)
      })

      test.each([
        ['UOPPGITT', 'Ugift, uten samboer'],
        ['UGIFT', 'Ugift, uten samboer'],
        ['GIFT', 'Gift'],
        ['ENKE_ELLER_ENKEMANN', 'Enke/enkemann, uten samboer'],
        ['SKILT', 'Skilt, uten samboer'],
        ['SEPARERT', 'Separert, uten samboer'],
        ['REGISTRERT_PARTNER', 'Registrert partner'],
        ['SEPARERT_PARTNER', 'Separert partner, uten samboer'],
        ['SKILT_PARTNER', 'Skilt partner, uten samboer'],
        ['GJENLEVENDE_PARTNER', 'Gjenlevende partner, uten samboer'],
      ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
        const sivilstand = formatSivilstand(a as Sivilstand, {
          harSamboer: false,
        })
        expect(sivilstand).toEqual(expected)
      })
    })
  })
})
