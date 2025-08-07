/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpResponse, delay, http } from 'msw'

import { API_PATH, HOST_BASEURL } from '@/paths'

import ansattIdResponse from './data/ansatt-id.json' with { type: 'json' }
import ekskludertStatusResponse from './data/ekskludert-status.json' with { type: 'json' }
import inntektResponse from './data/inntekt.json' with { type: 'json' }
import loependeVedtakResponse from './data/loepende-vedtak.json' with { type: 'json' }
import offentligTpResponse from './data/offentlig-tp.json' with { type: 'json' }
import omstillingsstoenadOgGjenlevendeResponse from './data/omstillingsstoenad-og-gjenlevende.json' with { type: 'json' }
import personResponse from './data/person.json' with { type: 'json' }
import tidligstMuligHeltUttakResponse from './data/tidligstMuligHeltUttak.json' with { type: 'json' }
import disableSpraakvelgerToggleResponse from './data/unleash-disable-spraakvelger.json' with { type: 'json' }
import enableUtvidetSimuleringsresultatPluginToggleResponse from './data/unleash-utvidet-simuleringsresultat.json' with { type: 'json' }
import enableVedlikeholdsmodusToggleResponse from './data/unleash-vedlikeholdmodus.json' with { type: 'json' }

const TEST_DELAY = process.env.NODE_ENV === 'test' ? 0 : 30

const testHandlers =
  process.env.NODE_ENV === 'test'
    ? [
        http.get('https://api.uxsignals.com/v2/study/id/*/active', () =>
          HttpResponse.json({ active: false })
        ),
      ]
    : []

export const getHandlers = (baseUrl: string = API_PATH) => [
  ...testHandlers,
  http.get(`${HOST_BASEURL}/oauth2/session`, async () => {
    await delay(500)
    return HttpResponse.json({
      session: { active: true, created_at: 'lorem', ends_in_seconds: 21592 },
      tokens: { expire_at: 'lorem', expire_in_seconds: 3592 },
    })
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

  http.get(`${baseUrl}/v5/person`, async ({ request }) => {
    await delay(TEST_DELAY)
    if (request.headers.get('fnr') === '40100000000') {
      return HttpResponse.json({}, { status: 401 })
    } else if (request.headers.get('fnr') === '40300000001') {
      return HttpResponse.json(
        {
          reason: 'INVALID_REPRESENTASJON',
        },
        { status: 403 }
      )
    } else if (request.headers.get('fnr') === '40300000002') {
      return HttpResponse.json(
        {
          reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE',
        },
        { status: 403 }
      )
    } else if (request.headers.get('fnr') === '40400000000') {
      return HttpResponse.json({}, { status: 404 })
    }
    return HttpResponse.json(personResponse)
  }),

  http.get(`${baseUrl}/v1/ansatt-id`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(ansattIdResponse)
  }),

  http.post(`${baseUrl}/v2/simuler-oftp`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(offentligTpResponse)
  }),

  http.get(`${baseUrl}/v4/vedtak/loepende-vedtak`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(loependeVedtakResponse)
  }),

  http.post(`${baseUrl}/v2/tidligste-hel-uttaksalder`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(tidligstMuligHeltUttakResponse)
  }),

  http.post(`${baseUrl}/v3/pensjonsavtaler`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as PensjonsavtalerRequestBody).uttaksperioder[0]
      ?.startAlder.aar
    const data = await import(`./data/pensjonsavtaler/${aar}.json`)
    return HttpResponse.json(data.default as object)
  }),

  http.post(`${baseUrl}/v8/alderspensjon/simulering`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as AlderspensjonRequestBody).heltUttak.uttaksalder.aar
    const data = await import(`./data/alderspensjon/${aar}.json`)
    const mergedData = JSON.parse(JSON.stringify(data.default)) as object
    let afpPrivat: AfpPensjonsberegning[] = []
    let afpOffentlig: AfpPensjonsberegning[] = []

    if (
      (body as AlderspensjonRequestBody).simuleringstype ===
      'PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON'
    ) {
      const afpPre2025Response = JSON.parse(
        JSON.stringify(await import(`./data/afp-etterfulgt-alderspensjon.json`))
      ) as AlderspensjonPensjonsberegning
      return HttpResponse.json(afpPre2025Response)
    }
    if (
      (body as AlderspensjonRequestBody).simuleringstype ===
        'ALDERSPENSJON_MED_AFP_PRIVAT' ||
      (body as AlderspensjonRequestBody).simuleringstype ===
        'ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT'
    ) {
      const afpPrivatData = JSON.parse(
        JSON.stringify(await import(`./data/afp-privat/${aar}.json`))
      )
      afpPrivat = [...afpPrivatData.default.afpPrivat]
    }
    if (
      (body as AlderspensjonRequestBody).simuleringstype ===
        'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG' ||
      (body as AlderspensjonRequestBody).simuleringstype ===
        'ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
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

  http.get(`${baseUrl}/feature/utvidet-simuleringsresultat`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(
      enableUtvidetSimuleringsresultatPluginToggleResponse
    )
  }),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.vedlikeholdsmodus`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(enableVedlikeholdsmodusToggleResponse)
    }
  ),

  http.post('http://localhost:12347/collect', async ({ request }) => {
    await request.json()
    return HttpResponse.json({ data: 'OK' })
  }),

  http.get('https://g.nav.no/api/v1/grunnbel%C3%B8p', async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json({
      dato: '2024-05-01',
      grunnbeløp: 100000,
      grunnbeløpPerMåned: 10000,
      gjennomsnittPerÅr: 120000,
      omregningsfaktor: 1,
      virkningstidspunktForMinsteinntekt: '2024-06-03',
    })
  }),

  http.get(
    `${import.meta.env.VITE_REPRESENTASJON_BANNER}/api/representasjon/harRepresentasjonsforhold`,
    () => HttpResponse.json({ value: false })
  ),
]
