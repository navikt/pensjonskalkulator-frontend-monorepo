import { IntlShape } from 'react-intl'

import { describe, expect, it } from 'vitest'

import { formatUttaksalder, getFormaterteAldere } from '../utils'

describe('VelgUttaksalder-utils', () => {
  const intlMock = {
    formatMessage: (s: { id: string }) => s.id,
  } as unknown as IntlShape
  describe('getFormaterteAldere', () => {
    it('returnerer array med én verdi når start og slutt er like', () => {
      const start = { aar: 64, maaneder: 3 }
      const end = { ...start }

      const aldere = getFormaterteAldere(intlMock, start, end)
      expect(aldere).toHaveLength(1)
      expect(aldere[0]).toEqual(
        formatUttaksalder(intlMock, start, { compact: true })
      )
    })

    it('tar kun hensyn til måned når det er snakk om start-alder', () => {
      const start = { aar: 64, maaneder: 3 }
      const end = { aar: 66, maaneder: 5 }

      const aldere = getFormaterteAldere(intlMock, start, end)
      expect(aldere).toHaveLength(3)
      expect(aldere[0]).toEqual(
        formatUttaksalder(intlMock, start, { compact: true })
      )
      expect(aldere[2]).not.toEqual(formatUttaksalder(intlMock, end))
      expect(aldere[2]).toEqual('66 alder.aar')
    })

    it('returnerer tomt array når sluttalder er lavere enn startalder', () => {
      const aldere = getFormaterteAldere(
        intlMock,
        { aar: 67, maaneder: 0 },
        { aar: 66, maaneder: 0 }
      )
      expect(aldere).toHaveLength(0)
    })

    it('returnerer array med alle årene fra og med startalder til og med sluttalder', () => {
      const aldere = getFormaterteAldere(
        intlMock,
        { aar: 62, maaneder: 2 },
        { aar: 75, maaneder: 0 }
      )
      expect(aldere).toHaveLength(14)
      expect(aldere).toEqual([
        '62 alder.aar string.og 2 alder.md',
        '63 alder.aar',
        '64 alder.aar',
        '65 alder.aar',
        '66 alder.aar',
        '67 alder.aar',
        '68 alder.aar',
        '69 alder.aar',
        '70 alder.aar',
        '71 alder.aar',
        '72 alder.aar',
        '73 alder.aar',
        '74 alder.aar',
        '75 alder.aar',
      ])
    })
  })

  describe('formatUttaksalder', () => {
    it('returnerer riktig streng med år og måned', () => {
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 3,
        })
      ).toBe('62 alder.aar string.og 3 alder.maaneder')
    })
    it('returnerer riktig streng med år og uten måned', () => {
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 0,
        })
      ).toBe('62 alder.aar')
      expect(
        formatUttaksalder(intlMock, {
          aar: 62,
          maaneder: 1,
        })
      ).toBe('62 alder.aar string.og 1 alder.maaned')
    })
    it('returnerer riktig streng med år og kompakt måned', () => {
      expect(
        formatUttaksalder(intlMock, { aar: 62, maaneder: 3 }, { compact: true })
      ).toBe('62 alder.aar string.og 3 alder.md')
    })
  })
})
