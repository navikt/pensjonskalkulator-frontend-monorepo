import { describe, expect, it, vi } from 'vitest'

import { render } from '@/test-utils'

import { useTableData } from '../hooks'
import * as MyModule from '../utils'

function TestComponent() {
  useTableData([], ['62', '63', '64'])

  return <button>Klikk</button>
}

describe('TabellVisning-hooks', () => {
  describe('useTableData', () => {
    it('formaterer array', async () => {
      const formatSeriesToTableDataMock = vi.spyOn(
        MyModule,
        'formatSeriesToTableData'
      )
      render(<TestComponent />)

      expect(formatSeriesToTableDataMock).toHaveBeenCalled()
    })
  })
})
