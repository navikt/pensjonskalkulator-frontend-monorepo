import { renderHook } from '@testing-library/react'

import { useIsMobile } from '../useIsMobile'

describe('useIsMobile', () => {
  it('is true with 500 px', () => {
    global.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('is false with 800 px', () => {
    global.innerWidth = 800
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })
})
