import { delay, http, HttpResponse } from 'msw'

import { API_PATH, HOST_BASEURL } from '@/paths'

import ekskludertStatusResponse from './data/ekskludert-status.json' assert { type: 'json' }
import inntektResponse from './data/inntekt.json' assert { type: 'json' }
import personResponse from './data/person.json' assert { type: 'json' }
import tidligstMuligGradertUttakResponse from './data/tidligstMuligGradertUttak.json' assert { type: 'json' }
import tidligstMuligHeltUttakResponse from './data/tidligstMuligHeltUttak.json' assert { type: 'json' }
import tpoMedlemskapResponse from './data/tpo-medlemskap.json' assert { type: 'json' }
import disableSpraakvelgerToggleResponse from './data/unleash-disable-spraakvelger.json' assert { type: 'json' }
import detaljertFaneToggleResponse from './data/unleash-enable-detaljert-fane.json' assert { type: 'json' }
import highchartsAccessibilityPluginToggleResponse from './data/unleash-enable-highcharts-accessibility-plugin.json' assert { type: 'json' }

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

  http.post(`${baseUrl}/v1/tidligste-hel-uttaksalder`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tidligstMuligHeltUttakResponse)
  }),

  http.post(`${baseUrl}/v1/tidligste-gradert-uttaksalder`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tidligstMuligGradertUttakResponse)
  }),

  http.get(`${baseUrl}/v1/ekskludert`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(ekskludertStatusResponse)
  }),

  http.post(`${baseUrl}/v2/pensjonsavtaler`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as PensjonsavtalerRequestBody).uttaksperioder[0]
      ?.startAlder.aar
    const data = await import(`./data/pensjonsavtaler/${aar}.json`)

    return HttpResponse.json(data)
  }),

  http.post(`${baseUrl}/v2/alderspensjon/simulering`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const data = await import(
      `./data/alderspensjon/${
        (body as AlderspensjonRequestBody).heltUttak.uttaksalder.aar
      }.json`
    )
    return HttpResponse.json(data)
  }),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.disable-spraakvelger`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(disableSpraakvelgerToggleResponse)
    }
  ),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(highchartsAccessibilityPluginToggleResponse)
    }
  ),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.enable-detaljert-fane`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(detaljertFaneToggleResponse)
    }
  ),

  http.post('http://localhost:12347/collect', async ({ request }) => {
    await request.json()
    return HttpResponse.json({ data: 'OK' })
  }),
]
