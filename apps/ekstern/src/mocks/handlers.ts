import { delay, http, HttpResponse } from 'msw'

import { API_PATH, HOST_BASEURL } from '@/paths'

import inntektResponse from './data/inntekt.json' assert { type: 'json' }
import personResponse from './data/person.json' assert { type: 'json' }
import sakStatusReponse from './data/sak-status.json' assert { type: 'json' }
import tidligstemuligeuttaksalderResponse from './data/tidligsteUttaksalder.json' assert { type: 'json' }
import tpoMedlemskapResponse from './data/tpo-medlemskap.json' assert { type: 'json' }
import unleashDisableSpraakvelgerResponse from './data/unleash-disable-spraakvelger.json' assert { type: 'json' }

const TEST_DELAY = process.env.NODE_ENV === 'test' ? 0 : 30

export const getHandlers = (baseUrl: string = API_PATH) => [
  http.get(`${HOST_BASEURL}/oauth2/session`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json({ data: 'OK' })
  }),

  http.get(`${baseUrl}/inntekt`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(inntektResponse)
  }),

  http.get(`${baseUrl}/v1/person`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(personResponse)
  }),

  http.get(`${baseUrl}/tpo-medlemskap`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tpoMedlemskapResponse)
  }),

  http.post(`${baseUrl}/v1/tidligste-uttaksalder`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tidligstemuligeuttaksalderResponse)
  }),

  http.get(`${baseUrl}/sak-status`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(sakStatusReponse)
  }),

  http.post(`${baseUrl}/v1/pensjonsavtaler`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as PensjonsavtalerRequestBody).uttaksperioder[0]
      ?.startAlder.aar
    const data = await import(`./data/pensjonsavtaler/${aar}.json`)

    return HttpResponse.json(data)
  }),

  http.post(`${baseUrl}/v1/alderspensjon/simulering`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const data = await import(
      `./data/alderspensjon/${
        (body as AlderspensjonRequestBody).foersteUttaksalder.aar
      }.json`
    )
    return HttpResponse.json(data)
  }),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.disable-spraakvelger`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(unleashDisableSpraakvelgerResponse)
    }
  ),

  http.post('http://localhost:12347/collect', async ({ request }) => {
    await request.json()
    return HttpResponse.json({ data: 'OK' })
  }),
]
