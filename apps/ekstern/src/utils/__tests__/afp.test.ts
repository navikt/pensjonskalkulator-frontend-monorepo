import { IntlShape } from 'react-intl'
import { describe, expect } from 'vitest'

import { formatAfp } from '../afp'

describe('afp-utils', () => {
  describe('formatAfp', () => {
    test.each([
      ['ja_offentlig', 'afp.offentlig'],
      ['ja_privat', 'afp.privat'],
      ['nei', 'afp.nei'],
      ['vet_ikke', 'afp.vet_ikke'],
      ['tullball', 'afp.vet_ikke'],
    ])(
      'viser riktig tekst når brukeren har valgt afp: %s',
      async (a, expected) => {
        expect(
          formatAfp(
            {
              formatMessage: (s: { id: string }) => s.id,
            } as unknown as IntlShape,
            a as AfpRadio
          )
        ).toEqual(expected)
      }
    )
  })
})
