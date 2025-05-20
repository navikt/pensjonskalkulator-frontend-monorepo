import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import { API_BASEURL } from '@/paths'

import { getHandlers } from './handlers'

const handlers = getHandlers(API_BASEURL)
export const server = setupServer(...handlers)

type MockResponseOptions = {
  status?: number
  json?: Record<string, unknown>
  text?: string
  method?: 'post' | 'get'
  baseUrl?: string
}

export const mockResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const method = inputOptions.method ?? 'get'
  const baseUrl = inputOptions.baseUrl ?? API_BASEURL
  const status = inputOptions.status ?? 200

  server.use(
    http[method](`${baseUrl}${path}`, () => {
      if (inputOptions.text) {
        return HttpResponse.text(inputOptions.text, { status })
      } else {
        const json = inputOptions.json ?? { data: 'ok' }
        return HttpResponse.json(json, { status })
      }
    })
  )
}

export const mockErrorResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const method = inputOptions.method ?? 'get'
  const baseUrl = inputOptions.baseUrl ?? API_BASEURL
  const status = inputOptions.status ?? 500
  const json = inputOptions.json ?? ''

  server.use(
    http[method](`${baseUrl}${path}`, () => {
      return HttpResponse.json(json, { status })
    })
  )
}
