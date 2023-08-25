import { formatSivilstand } from '@/utils/sivilstand'

describe('sivilstand-utils', () => {
  describe('formatSivilstand', () => {
    test.each([
      ['UOPPGITT', 'Ugift'],
      ['UGIFT', 'Ugift'],
      ['GIFT', 'Gift'],
      ['ENKE_ELLER_ENKEMANN', 'Enke/Enkemann'],
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
