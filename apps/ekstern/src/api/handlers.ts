import { rest } from 'msw'
import { PATH } from './paths'

import tidligstemuligeuttaksalderData from './__mocks__/tidligstemuligeuttaksalder.json' assert { type: 'json' }
import pensjonsberegningData from './__mocks__/pensjonsberegning.json' assert { type: 'json' }

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
