import { rest } from 'msw'

import { PATH } from '@/api/paths'

import pensjonsberegningData from './data/pensjonsberegning.json' assert { type: 'json' }
import tidligstemuligeuttaksalderData from './data/tidligstemuligeuttaksalder.json' assert { type: 'json' }

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
]
