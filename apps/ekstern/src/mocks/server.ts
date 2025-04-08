import { HttpResponse, http } from 'msw'
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

export const mockResponse = (
  path: string,
  inputOptions: MockResponseOptions = {}
) => {
  const method = inputOptions.method ?? 'get'
  const baseUrl = inputOptions.baseUrl ?? API_BASEURL
  const status = inputOptions.status ?? 200

  server.use(
    http[method](`${baseUrl}${path}`, async () => {
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

  server.use(
    http[method](`${baseUrl}${path}`, async () => {
      // Må sende tom streng slik at ikke rtk-query prøver å parse JSON
      return HttpResponse.text('', { status })
    })
  )
}
