import { vi } from 'vitest'

const loggerUtils = await import('@/utils/logging')
export const loggerSpy = vi.spyOn(loggerUtils, 'logger')
export const loggerCustomSpy = vi.fn()
Object.assign(loggerSpy, { custom: loggerCustomSpy })
export const logOpenLinkSpy = vi.spyOn(loggerUtils, 'logOpenLink')
export const loggerTeardown = () => {
  loggerSpy.mockClear()
  loggerCustomSpy.mockClear()
  logOpenLinkSpy.mockClear()
}
