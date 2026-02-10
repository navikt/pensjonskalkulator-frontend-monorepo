import '@testing-library/jest-dom'

import { vi } from 'vitest'

import { mockResponse, server } from '@/mocks'

import { HOST_BASEURL } from './paths'

global.scrollTo = () => vi.fn()

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      addEventListener: function () {},
      removeListener: function () {},
      removeEventListener: function () {},
    }
  }

window.ResizeObserver =
  window.ResizeObserver ||
  vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }))

Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: 'decorator-language=nb',
})

window.HTMLElement.prototype.scrollIntoView = vi.fn()

if (!('supports' in window.CSS)) {
  window.CSS.supports = () => false
}

vi.mock(
  '@navikt/nav-dekoratoren-moduler',
  async (): Promise<typeof import('@navikt/nav-dekoratoren-moduler')> => {
    const mod = await vi.importActual<{
      default: typeof import('@navikt/nav-dekoratoren-moduler')
    }>('@navikt/nav-dekoratoren-moduler')

    return {
      ...mod.default,
      getAnalyticsInstance: () => vi.fn(),
      onLanguageSelect: vi.fn(() => vi.fn()),
      setAvailableLanguages: vi.fn(),
    }
  }
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
beforeEach(() => {
  mockResponse('/oauth2/session', {
    baseUrl: `${HOST_BASEURL}`,
  })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
