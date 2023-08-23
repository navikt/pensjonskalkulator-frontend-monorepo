import { checkHarSamboer } from '@/utils/sivilstand'

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
})
