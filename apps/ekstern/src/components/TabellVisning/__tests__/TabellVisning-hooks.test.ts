import { describe, expect, it, vi } from 'vitest'

import { useTableData } from '../hooks'
import * as MyModule from '../utils'
import { renderHook } from '@/test-utils'

describe('TabellVisning-hooks', () => {
  describe('useTableData', () => {
    it('formaterer array', () => {
      const formatSeriesToTableDataMock = vi.spyOn(
        MyModule,
        'formatSeriesToTableData'
      )
      renderHook(() => useTableData([], ['62', '63', '64']))
      expect(formatSeriesToTableDataMock).toHaveBeenCalled()
    })
  })
})
