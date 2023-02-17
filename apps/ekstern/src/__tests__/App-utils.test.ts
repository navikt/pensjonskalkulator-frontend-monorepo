import { vi, expect, test } from 'vitest'

import { onButtonClick } from '../App-utils'

test('Når onButtonClick kalles, Så kalles nested funksjonen med riktig argument', () => {
  const mockFn = vi.fn()
  onButtonClick(123, mockFn)
  expect(mockFn).toHaveBeenCalledWith(124)
})
