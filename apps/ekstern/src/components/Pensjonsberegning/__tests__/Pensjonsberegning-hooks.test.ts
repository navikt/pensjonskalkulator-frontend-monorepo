import { describe, expect, it, vi } from 'vitest'

import { useAlderChips } from '../hooks'
import * as MyModule from '../utils'
import { renderHook } from '@/test-utils'

describe('Pensjonsberegning-hooks', () => {
  describe('useAlderChips', () => {
    it('returnerer tomt array når data er undefined', () => {
      const { result } = renderHook(() => useAlderChips())
      expect(result.current).toHaveLength(0)
    })
    it('returnerer et generert array når data ikke er tom', () => {
      const generateAlderArrayMock = vi.spyOn(MyModule, 'generateAlderArray')
      const { result } = renderHook(() =>
        useAlderChips({
          aar: 65,
          maaned: 10,
        })
      )
      expect(generateAlderArrayMock).toHaveBeenCalled()
      expect(result.current).not.toHaveLength(0)
    })
  })
})
