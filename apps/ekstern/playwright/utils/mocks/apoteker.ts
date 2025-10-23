import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type ApotekerMockOptions = Partial<components['schemas']['ApotekerStatusV1']>

export const apoteker = async (
  options: ApotekerMockOptions = {}
): Promise<RouteDefinition> => {
  const { ...overrides } = options

  const apotekerMock = (await loadJSONMock(
    'er-apoteker.json'
  )) as components['schemas']['ApotekerStatusV1']

  return {
    url: /\/pensjon\/kalkulator\/api\/v1\/er-apoteker/,
    jsonResponse: {
      ...apotekerMock,
      ...overrides,
    },
  }
}
