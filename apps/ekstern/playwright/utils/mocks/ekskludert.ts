import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type EkskludertMockOptions = Partial<
  components['schemas']['EkskluderingStatusV2']
>

export const ekskludert = async (
  options: EkskludertMockOptions = {}
): Promise<RouteDefinition> => {
  const { ...overrides } = options

  const ekskludertMock = (await loadJSONMock(
    'ekskludert-status.json'
  )) as components['schemas']['EkskluderingStatusV2']

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/ekskludert/,
    jsonResponse: {
      ...ekskludertMock,
      ...overrides,
    },
  }
}
