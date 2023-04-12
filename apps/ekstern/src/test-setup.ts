import '@testing-library/jest-dom'

import { fetch, Headers, Request, Response } from 'cross-fetch'

import { server } from './api/server'

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
})
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
