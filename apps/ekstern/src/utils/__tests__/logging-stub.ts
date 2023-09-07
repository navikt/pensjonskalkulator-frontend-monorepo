import { vi } from 'vitest'
const logger = await import('@/utils/logging')
export const loggerSpy = vi.spyOn(logger, 'default')
export const loggerTeardown = () => {
  loggerSpy.mockClear()
}
