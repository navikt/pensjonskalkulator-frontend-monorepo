import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type InntektMockOptions = Partial<components['schemas']['InntektDto']>

export const inntekt = async (
  options: InntektMockOptions = {}
): Promise<RouteDefinition> => {
  const inntektMock = (await loadJSONMock(
    'inntekt.json'
  )) as components['schemas']['InntektDto']

  return {
    url: /\/pensjon\/kalkulator\/api\/inntekt/,
    jsonResponse: {
      ...inntektMock,
      ...options,
    },
  }
}
