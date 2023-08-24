import { describe, expect, it } from 'vitest'

import { formatUttaksalder, getFormaterteAldere } from '../utils'

describe('VelgUttaksalder-utils', () => {
  describe('getFormaterteAldere', () => {
    it('returnerer array med én verdi når start og slutt er like', () => {
      const start = { aar: 64, maaned: 3, uttaksdato: '2031-11-01' }
      const end = { ...start }

      const aldere = getFormaterteAldere(start, end)
      expect(aldere).toHaveLength(1)
      expect(aldere[0]).toEqual(formatUttaksalder(start, { compact: true }))
    })

    it('tar kun hensyn til måned når det er snakk om start-alder', () => {
      const start = { aar: 64, maaned: 3, uttaksdato: '2031-11-01' }
      const end = { aar: 66, maaned: 5, uttaksdato: '2031-11-01' }

      const aldere = getFormaterteAldere(start, end)
      expect(aldere).toHaveLength(3)
      expect(aldere[0]).toEqual(formatUttaksalder(start, { compact: true }))
      expect(aldere[2]).not.toEqual(formatUttaksalder(end))
      expect(aldere[2]).toEqual('66 år')
    })

    it('returnerer tomt array når sluttalder er lavere enn startalder', () => {
      const aldere = getFormaterteAldere(
        { aar: 67, maaned: 0, uttaksdato: '2031-11-01' },
        { aar: 66, maaned: 0, uttaksdato: '2031-11-01' }
      )
      expect(aldere).toHaveLength(0)
    })

    it('returnerer array med alle årene fra og med startalder til og med sluttalder', () => {
      const aldere = getFormaterteAldere(
        { aar: 62, maaned: 2, uttaksdato: '2031-11-01' },
        { aar: 75, maaned: 0, uttaksdato: '2031-11-01' }
      )
      expect(aldere).toHaveLength(14)
      expect(aldere).toEqual([
        '62 år og 2 md.',
        '63 år',
        '64 år',
        '65 år',
        '66 år',
        '67 år',
        '68 år',
        '69 år',
        '70 år',
        '71 år',
        '72 år',
        '73 år',
        '74 år',
        '75 år',
      ])
    })
  })

  describe('formatUttaksalder', () => {
    it('returnerer riktig streng med år og måned', () => {
      expect(
        formatUttaksalder({
          aar: 62,
          maaned: 3,
          uttaksdato: '2031-11-01',
        })
      ).toBe('62 år og 3 måneder')
    })
    it('returnerer riktig streng med år og uten måned', () => {
      expect(
        formatUttaksalder({
          aar: 62,
          maaned: 0,
          uttaksdato: '2031-11-01',
        })
      ).toBe('62 år')
      expect(
        formatUttaksalder({
          aar: 62,
          maaned: 1,
          uttaksdato: '2031-11-01',
        })
      ).toBe('62 år')
    })
    it('returnerer riktig streng med år og kompakt måned', () => {
      expect(
        formatUttaksalder(
          { aar: 62, maaned: 3, uttaksdato: '2031-11-01' },
          { compact: true }
        )
      ).toBe('62 år og 3 md.')
    })
  })
})
