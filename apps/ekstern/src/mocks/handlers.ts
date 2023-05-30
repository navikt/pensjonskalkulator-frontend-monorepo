import { rest } from 'msw'

import { getHost, PATH } from '@/api/paths'

import pensjonsberegningData from './data/pensjonsberegning.json' assert { type: 'json' }
import personData from './data/person.json' assert { type: 'json' }
import tidligstemuligeuttaksalderData from './data/tidligstemuligeuttaksalder.json' assert { type: 'json' }
import unleashDisableSpraakvelgerData from './data/unleash-disable-spraakvelger.json' assert { type: 'json' }

export const getHandlers = (baseUrl: string = PATH) => [
  rest.get(`${baseUrl}/tidligste-uttaksalder`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(tidligstemuligeuttaksalderData),
      ctx.delay(30)
    )
  }),
  rest.get(`${baseUrl}/pensjonsberegning`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(pensjonsberegningData), ctx.delay(30))
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
