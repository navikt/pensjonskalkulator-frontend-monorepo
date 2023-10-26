import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { API_BASEURL } from '@/paths'

import { getHandlers } from './handlers'

const handlers = getHandlers(API_BASEURL)
export const server = setupServer(...handlers)

// server.events.on('request:start', ({ request }) => {
//   console.log('MSW intercepted:', request.method, request.url)
//   // http://localhost:8088/pensjon/kalkulator/api/v1/pensjonsavtaler
//   // http://localhost:8088/pensjon/kalkulator/api/v1/pensjonsavtaler
// })

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
    http[options.method](`${options.baseUrl}${path}`, async ({ request }) => {
      await request.json()
      return HttpResponse.json(options.json)
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

  server.use(
    http[options.method](`${options.baseUrl}${path}`, async () => {
      return new HttpResponse(
        !options.noData && options.text
          ? options.text
          : JSON.stringify(options.json),
        {
          status: options.status,
        }
      )
    })
  )
}
