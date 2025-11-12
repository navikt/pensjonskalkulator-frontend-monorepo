import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { EkskluderingStatusV2 } from './types'

type EkskludertMockOptions = Partial<EkskluderingStatusV2>

export const ekskludert = async (
  options: EkskludertMockOptions = {}
): Promise<RouteDefinition> => {
  const { ...overrides } = options

  const ekskludertMock = (await loadJSONMock(
    'ekskludert-status.json'
  )) as EkskluderingStatusV2

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/ekskludert/,
    jsonResponse: {
      ...ekskludertMock,
      ...overrides,
    },
  }
}
