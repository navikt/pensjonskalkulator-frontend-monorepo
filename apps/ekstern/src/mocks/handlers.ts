import { delay, http, HttpResponse } from 'msw'

import { API_PATH, HOST_BASEURL } from '@/paths'

import ansattIdResponse from './data/ansatt-id.json' with { type: 'json' }
import ekskludertStatusResponse from './data/ekskludert-status.json' with { type: 'json' }
import inntektResponse from './data/inntekt.json' with { type: 'json' }
import loependeVedtakResponse from './data/loepende-vedtak.json' with { type: 'json' }
import offentligTpResponse from './data/offentlig-tp.json' with { type: 'json' }
import omstillingsstoenadOgGjenlevendeResponse from './data/omstillingsstoenad-og-gjenlevende.json' with { type: 'json' }
import personResponse from './data/person.json' with { type: 'json' }
import sanityForbeholdAvsnittDataResponse from './data/sanity-forbehold-avsnitt-data.json' with { type: 'json' }
import sanityReadMoreDataResponse from './data/sanity-readmore-data.json' with { type: 'json' }
import tidligstMuligHeltUttakResponse from './data/tidligstMuligHeltUttak.json' with { type: 'json' }
import disableSpraakvelgerToggleResponse from './data/unleash-disable-spraakvelger.json' with { type: 'json' }
import enableRedirect1963ToggleResponse from './data/unleash-enable-redirect-1963.json' with { type: 'json' }
import enableSanityToggleResponse from './data/unleash-enable-sanity.json' with { type: 'json' }
import enableOtpFraKlpToggleResponse from './data/unleash-otp-fra-klp.json' with { type: 'json' }
import enableUtvidetSimuleringsresultatPluginToggleResponse from './data/unleash-utvidet-simuleringsresultat.json' with { type: 'json' }

const TEST_DELAY = process.env.NODE_ENV === 'test' ? 0 : 30

const testHandlers =
  process.env.NODE_ENV === 'test'
    ? [
        http.get(
          'https://g2by7q6m.apicdn.sanity.io/v2023-05-03/data/query/development',
          async ({ request }) => {
            // 'https://g2by7q6m.apicdn.sanity.io/v2023-05-03/data/query/development?query=*%5B_type+%3D%3D+%22readmore%22+%26%26'
            // 'https://g2by7q6m.apicdn.sanity.io/v2023-05-03/data/query/development?query=*%5B_type+%3D%3D+%22forbeholdAvsnitt%22+%26%26',
            const url = new URL(request.url)
            const type = url.searchParams.get('_type')
            if (type === 'readmore') {
              return HttpResponse.json(sanityReadMoreDataResponse)
            } else if (type === 'forbeholdAvsnitt') {
              return HttpResponse.json(sanityForbeholdAvsnittDataResponse)
            }
          }
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

  http.get(`${baseUrl}/v4/person`, async ({ request }) => {
    await delay(TEST_DELAY)
    if (request.headers.get('fnr') === '40100000000') {
      return HttpResponse.json({}, { status: 401 })
    } else if (request.headers.get('fnr') === '40400000000') {
      return HttpResponse.json({}, { status: 404 })
    } else if (request.headers.get('fnr') === '40300000000') {
      return HttpResponse.json({}, { status: 403 })
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
    return HttpResponse.json(data)
  }),

  http.post(`${baseUrl}/v8/alderspensjon/simulering`, async ({ request }) => {
    await delay(TEST_DELAY)
    const body = await request.json()
    const aar = (body as AlderspensjonRequestBody).heltUttak.uttaksalder.aar
    const data = await import(`./data/alderspensjon/${aar}.json`)
    const mergedData = JSON.parse(JSON.stringify(data.default))
    let afpPrivat: AfpPrivatPensjonsberegning[] = []
    let afpOffentlig: AfpPrivatPensjonsberegning[] = []
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

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.enable-redirect-1963`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(enableRedirect1963ToggleResponse)
    }
  ),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.hent-tekster-fra-sanity`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(enableSanityToggleResponse)
    }
  ),

  http.get(`${baseUrl}/feature/utvidet-simuleringsresultat`, async () => {
    await delay(TEST_DELAY)
    return HttpResponse.json(
      enableUtvidetSimuleringsresultatPluginToggleResponse
    )
  }),

  http.get(
    `${baseUrl}/feature/pensjonskalkulator.vis-otp-fra-klp`,
    async () => {
      await delay(TEST_DELAY)
      return HttpResponse.json(enableOtpFraKlpToggleResponse)
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
    async () => HttpResponse.json({ value: false })
  ),
]
