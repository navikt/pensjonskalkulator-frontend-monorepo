import { describe, expect } from 'vitest'

import { formatAfp } from '../afp'

describe('afp-utils', () => {
  describe('formatAfp', () => {
    test.each([
      ['ja_offentlig', 'Offentlig'],
      ['ja_privat', 'Privat'],
      ['nei', 'Nei'],
      ['vet_ikke', 'Vet ikke'],
      ['tullball', 'Vet ikke'],
    ])(
      'viser riktig tekst når brukeren har valgt afp: %s',
      async (a, expected) => {
        expect(formatAfp(a as AfpRadio)).toEqual(expected)
      }
    )
  })
})
