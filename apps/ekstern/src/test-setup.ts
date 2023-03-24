import '@testing-library/jest-dom'

import { fetch, Headers, Request, Response } from 'cross-fetch'

import { server } from './api/server'

global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
