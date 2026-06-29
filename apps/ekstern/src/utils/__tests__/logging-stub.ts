import { vi } from 'vitest'

const loggerUtils = await import('@/utils/logging')
export const loggerSpy = vi.spyOn(loggerUtils, 'logger')
Object.assign(loggerSpy, { custom: loggerSpy })
export const logOpenLinkSpy = vi.spyOn(loggerUtils, 'logOpenLink')
export const loggerTeardown = () => {
  loggerSpy.mockClear()
}
