import { vi } from 'vitest'
const loggerUtils = await import('@/utils/logging')
export const loggerSpy = vi.spyOn(loggerUtils, 'logger')
export const loggerTeardown = () => {
  loggerSpy.mockClear()
}
