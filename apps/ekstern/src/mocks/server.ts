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
  noData?: boolean
}

export const mockResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const defaultResponseOptions: Required<MockResponseOptions> = {
    status: 200,
    json: { data: 'OK' },
    method: 'get',
    baseUrl: `${API_BASEURL}`,
    text: '',
    noData: false,
  }
  const options = { ...defaultResponseOptions, ...inputOptions }

  server.use(
    rest[options.method](`${options.baseUrl}${path}`, (_req, res, ctx) => {
      return res(
        ctx.status(options.status),
        !options.noData && options.text
          ? ctx.text(options.text)
          : ctx.json(options.json)
      )
    })
  )
}

export const mockErrorResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const defaultErrorResponseOptions: Required<MockResponseOptions> = {
    status: 500,
    json: { data: "Beep boop I'm an error!" },
    text: '',
    method: 'get',
    noData: false,
    baseUrl: `${API_BASEURL}`,
  }
  const options = {
    ...defaultErrorResponseOptions,
    ...inputOptions,
  }

  mockResponse(path, options)
}
