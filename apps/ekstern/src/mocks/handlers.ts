import { delay, http, HttpResponse } from 'msw'

import { API_PATH, HOST_BASEURL } from '@/paths'

import ansattIdResponse from './data/ansatt-id.json' with { type: 'json' }
import ekskludertStatusResponse from './data/ekskludert-status.json' with { type: 'json' }
import inntektResponse from './data/inntekt.json' with { type: 'json' }
import omstillingsstoenadOgGjenlevendeResponse from './data/omstillingsstoenad-og-gjenlevende.json' with { type: 'json' }
import personResponse from './data/person.json' with { type: 'json' }
import tidligstMuligHeltUttakResponse from './data/tidligstMuligHeltUttak.json' with { type: 'json' }
import tpoMedlemskapResponse from './data/tpo-medlemskap.json' with { type: 'json' }
import ufoeregradResponse from './data/ufoeregrad.json' with { type: 'json' }
import disableSpraakvelgerToggleResponse from './data/unleash-disable-spraakvelger.json' with { type: 'json' }
import highchartsAccessibilityPluginToggleResponse from './data/unleash-enable-highcharts-accessibility-plugin.json' with { type: 'json' }
import enableUtlandPluginToggleResponse from './data/unleash-enable-utland.json' with { type: 'json' }
import enableUtvidetSimuleringsresultatPluginToggleResponse from './data/unleash-utvidet-simuleringsresultat.json' with { type: 'json' }

const TEST_DELAY = process.env.NODE_ENV === 'test' ? 0 : 30

export const getHandlers = (baseUrl: string = API_PATH) => [
  http.get(`${HOST_BASEURL}/oauth2/session`, async () => {
    await delay(1500)
    return HttpResponse.json({ data: 'OK' })
  }),

  http.get(`${baseUrl}/inntekt`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(inntektResponse)
  }),

  http.get(`${baseUrl}/v2/ekskludert`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(ekskludertStatusResponse)
  }),

  http.get(
    `${baseUrl}/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(omstillingsstoenadOgGjenlevendeResponse)
    }
  ),

  http.get(`${baseUrl}/v1/ufoeregrad`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(ufoeregradResponse)
  }),

  http.get(`${baseUrl}/v2/person`, async ({ request }) => {
    await delay(TEST_DELAY)
    if (request.headers.get('fnr') === '40100000000') {
      return HttpResponse.json({}, { status: 401 })
    }
    if (request.headers.get('fnr') === '40400000000') {
      return HttpResponse.json({}, { status: 404 })
    }

    return HttpResponse.json(personResponse)
  }),

  http.get(`${baseUrl}/v1/ansatt-id`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(ansattIdResponse)
  }),

  http.get(`${baseUrl}/v1/tpo-medlemskap`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tpoMedlemskapResponse)
  }),

  http.post(`${baseUrl}/v1/tidligste-hel-uttaksalder`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tidligstMuligHeltUttakResponse)
  }),

  http.post(`${baseUrl}/v2/pensjonsavtaler`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as PensjonsavtalerRequestBody).uttaksperioder[0]
      ?.startAlder.aar
    const data = await import(`./data/pensjonsavtaler/${aar}.json`)
    return HttpResponse.json(data)
  }),

  http.post(`${baseUrl}/v6/alderspensjon/simulering`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as AlderspensjonRequestBody).heltUttak.uttaksalder.aar
    const data = await import(`./data/alderspensjon/${aar}.json`)
    const mergedData = JSON.parse(JSON.stringify(data.default))
    let afpPrivat: Pensjonsberegning[] = []
    let afpOffentlig: Pensjonsberegning[] = []
    if (
      (body as AlderspensjonRequestBody).simuleringstype ===
      'ALDERSPENSJON_MED_AFP_PRIVAT'
    ) {
      const afpPrivatData = JSON.parse(
        JSON.stringify(await import(`./data/afp-privat/${aar}.json`))
      )
      afpPrivat = [...afpPrivatData.default.afpPrivat]
    }
    if (
      (body as AlderspensjonRequestBody).simuleringstype ===
      'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
    ) {
      const afpOffentligData = JSON.parse(
        JSON.stringify(await import(`./data/afp-offentlig.json`))
      )
      if (afpOffentligData.default.afpOffentlig) {
        afpOffentlig = [
          {
            ...afpOffentligData.default.afpOffentlig[0],
            alder: aar,
          },
        ]
      }
    }

    return HttpResponse.json({
      ...mergedData,
      afpPrivat: afpPrivat,
      afpOffentlig: afpOffentlig,
    })
  }),

  http.post(`${baseUrl}/v1/encrypt`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.text('this-is-just-jibbrish-encrypted-fnr')
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

  http.get(`${baseUrl}/feature/pensjonskalkulator.enable-utland`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(enableUtlandPluginToggleResponse)
  }),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.utvidet-simuleringsresultat`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(
        enableUtvidetSimuleringsresultatPluginToggleResponse
      )
    }
  ),

  http.post('http://localhost:12347/collect', async ({ request }) => {
    await request.json()
    return HttpResponse.json({ data: 'OK' })
  }),
]
