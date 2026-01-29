import { fireEvent, renderHook } from '@testing-library/react'

import { useIsMobile } from '../useIsMobile'

describe('useIsMobile', () => {
  it('is true with 500 px', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('is false with 800 px', () => {
    window.innerWidth = 800
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('change on resize', async () => {
    window.innerWidth = 800
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    window.innerWidth = 500
    fireEvent(window, new Event('resize'))

    expect(result.current).toBe(true)
  })
})
