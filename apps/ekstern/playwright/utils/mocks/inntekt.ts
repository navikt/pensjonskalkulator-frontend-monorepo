import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { InntektDto } from './types'

type InntektMockOptions = Partial<InntektDto>

export const inntekt = async (
  options: InntektMockOptions = {}
): Promise<RouteDefinition> => {
  const inntektMock = (await loadJSONMock('inntekt.json')) as InntektDto

  return {
    url: /\/pensjon\/kalkulator\/api\/inntekt/,
    jsonResponse: {
      ...inntektMock,
      ...options,
    },
  }
}
