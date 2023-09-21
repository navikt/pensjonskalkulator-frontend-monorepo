import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { API_BASEURL } from '@/paths'

import { getHandlers } from './handlers'

const handlers = getHandlers(API_BASEURL)
export const server = setupServer(...handlers)

type MockResponseOptions = {
  status?: number
  json?: ReturnType<typeof JSON.parse>
  text?: string
  method?: 'post' | 'get'
  baseUrl?: string
}

const defaultResponseOptions: Required<MockResponseOptions> = {
  status: 200,
  json: { data: 'OK' },
  method: 'get',
  baseUrl: `${API_BASEURL}`,
  text: '',
}

export const mockResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const options = { ...defaultResponseOptions, ...inputOptions }
  const parsedPath = `${options.baseUrl}${path}`

  server.use(
    rest[options.method](parsedPath, (_req, res, ctx) => {
      return res(
        ctx.status(options.status),
        options.text ? ctx.text(options.text) : ctx.json(options.json)
      )
    })
  )
}

const defaultErrorResponseOptions: Required<MockResponseOptions> = {
  status: 500,
  json: { data: "Beep boop I'm an error!" },
  text: '',
  method: 'get',
  baseUrl: `${API_BASEURL}`,
}

export const mockErrorResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const options = {
    ...defaultErrorResponseOptions,
    ...inputOptions,
  }
  mockResponse(path, options)
}
