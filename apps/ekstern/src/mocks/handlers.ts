import { rest } from 'msw'

import { getHost, PATH } from '@/api/paths'

import pensjonsavtalerData from './data/pensjonsavtaler.json' assert { type: 'json' }
import personData from './data/person.json' assert { type: 'json' }
import tidligstemuligeuttaksalderData from './data/tidligsteUttaksalder.json' assert { type: 'json' }
import unleashDisableSpraakvelgerData from './data/unleash-disable-spraakvelger.json' assert { type: 'json' }

export const getHandlers = (baseUrl: string = PATH) => [
  rest.post(`${baseUrl}/tidligste-uttaksalder`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(tidligstemuligeuttaksalderData),
      ctx.delay(30)
    )
  }),
  rest.post(`${baseUrl}/alderspensjon/simulering`, async (req, res, ctx) => {
    const body = await req.json()
    const year = new Date(body.foersteUttaksdato).getFullYear()
    const data = await import(`./data/alderspensjon/${year}.json`)

    return res(ctx.status(200), ctx.json(data), ctx.delay(30))
  }),
  rest.get(`${baseUrl}/pensjonsavtaler`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(pensjonsavtalerData), ctx.delay(30))
  }),
  rest.get(`${baseUrl}/person`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(personData), ctx.delay(30))
  }),
  rest.get(
    `${baseUrl}/feature/pensjonskalkulator.disable-spraakvelger`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(unleashDisableSpraakvelgerData),
        ctx.delay(10)
      )
    }
  ),
  rest.post(`${getHost('test')}/client_error_trace`, async (req, res, ctx) => {
    return res(ctx.status(204), ctx.delay(30))
  }),
]
