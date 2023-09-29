import { rest } from 'msw'

import { API_PATH } from '@/paths'

import inntektResponse from './data/inntekt.json' assert { type: 'json' }
import pensjonsavtalerResponse from './data/pensjonsavtaler.json' assert { type: 'json' }
import personResponse from './data/person.json' assert { type: 'json' }
import sakStatusReponse from './data/sak-status.json' assert { type: 'json' }
import tidligstemuligeuttaksalderResponse from './data/tidligsteUttaksalder.json' assert { type: 'json' }
import tpoMedlemskapResponse from './data/tpo-medlemskap.json' assert { type: 'json' }
import unleashDisableSpraakvelgerResponse from './data/unleash-disable-spraakvelger.json' assert { type: 'json' }

const TEST_DELAY = process.env.NODE_ENV === 'test' ? 0 : 30

export const getHandlers = (baseUrl: string = API_PATH) => [
  rest.get(`${baseUrl}/inntekt`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(inntektResponse),
      ctx.delay(TEST_DELAY)
    )
  }),

  rest.get(`${baseUrl}/person`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(personResponse), ctx.delay(TEST_DELAY))
  }),

  rest.get(`${baseUrl}/tpo-medlemskap`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(tpoMedlemskapResponse),
      ctx.delay(TEST_DELAY)
    )
  }),

  rest.post(`${baseUrl}/v1/tidligste-uttaksalder`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(tidligstemuligeuttaksalderResponse),
      ctx.delay(TEST_DELAY)
    )
  }),

  rest.get(`${baseUrl}/sak-status`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(sakStatusReponse),
      ctx.delay(TEST_DELAY)
    )
  }),

  rest.post(`${baseUrl}/v1/pensjonsavtaler`, async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(pensjonsavtalerResponse),
      ctx.delay(TEST_DELAY)
    )
  }),

  rest.post(`${baseUrl}/v1/alderspensjon/simulering`, async (req, res, ctx) => {
    const body = await req.json()
    const data = await import(
      `./data/alderspensjon/${body.foersteUttaksalder.aar}.json`
    )
    return res(ctx.status(200), ctx.json(data), ctx.delay(TEST_DELAY))
  }),

  rest.get(
    `${baseUrl}/feature/pensjonskalkulator.disable-spraakvelger`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(unleashDisableSpraakvelgerResponse),
        ctx.delay(TEST_DELAY)
      )
    }
  ),

  rest.post('http://localhost:12347/collect', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
]
