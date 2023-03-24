import { setupServer } from 'msw/node'
import { getHandlers } from './handlers.js'
import { rest } from 'msw'
import { API_BASEURL } from './paths'

const handlers = getHandlers(API_BASEURL)
export const server = setupServer(...handlers)

type MockResponseOptions = {
  status?: number
  json?: any
}

export const mockResponse = (
  path: string,
  options: MockResponseOptions = {
    status: 200,
    json: 'OK',
  }
) => {
  server.use(
    rest.get(`${API_BASEURL}${path}`, (req, res, ctx) => {
      return res(ctx.status(options.status ?? 200), ctx.json(options.json))
    })
  )
}

export const mockErrorResponse = (
  path: string,
  options: MockResponseOptions = {
    status: 500,
    json: "Beep boop I'm an error!",
  }
) => {
  mockResponse(path, {
    ...options,
    status: options.status ?? 500,
  })
}
