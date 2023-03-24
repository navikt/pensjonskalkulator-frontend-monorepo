import { rest } from 'msw'
import { PATH } from './paths'

import pensjonsberegningData from './__mocks__/pensjonsberegning.json' assert { type: 'json' }

export const getHandlers = (baseUrl: string = PATH) => [
  rest.get(`${baseUrl}/pensjonsberegning`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(pensjonsberegningData), ctx.delay(30))
  }),
]
