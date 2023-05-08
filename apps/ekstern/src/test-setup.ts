import '@testing-library/jest-dom'
import { fetch, Headers, Request, Response } from 'cross-fetch'
import { useSerialIds } from 'highcharts'

import { server } from '@/mocks/server'

global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    }
  }

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  if (process.env.NODE_ENV === 'test') {
    useSerialIds(true)
  }
})
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
