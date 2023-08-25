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
})
