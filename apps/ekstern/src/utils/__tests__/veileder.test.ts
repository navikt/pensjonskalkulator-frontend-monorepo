import { RouteObject } from 'react-router'

import { describe, expect, it } from 'vitest'

import { findRoutesWithoutLoaders } from '../veileder'

describe('veilder-utils', () => {
  describe('findRoutesWithoutLoaders', () => {
    it('should return an array of paths without loaders', () => {
      const routes: RouteObject[] = [
        {
          loader: vi.fn(),
          children: [
            {
              loader: vi.fn(),
              path: '/withLoader1',
            },
            {
              path: '/rute1',
            },
          ],
        },
        {
          path: '/rute3',
        },
        {
          loader: vi.fn(),
          path: '/withLoader2',
        },
        {
          loader: vi.fn(),
          children: [
            {
              path: '/rute4',
            },
          ],
        },
      ]

      const expected = ['/rute1', '/rute3', '/rute4']
      const actual = findRoutesWithoutLoaders(routes)

      expect(actual).toEqual(expected)
    })
  })
})
