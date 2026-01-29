import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { ApotekerStatusV1 } from './types'

type ApotekerMockOptions = Partial<ApotekerStatusV1>

export const apoteker = async (
  options: ApotekerMockOptions = {}
): Promise<RouteDefinition> => {
  const { ...overrides } = options

  const apotekerMock = (await loadJSONMock(
    'er-apoteker.json'
  )) as ApotekerStatusV1

  return {
    url: /\/pensjon\/kalkulator\/api\/v1\/er-apoteker/,
    overrideJsonResponse: {
      ...apotekerMock,
      ...overrides,
    },
  }
}

export function apotekerError(): RouteDefinition {
  return {
    url: /\/pensjon\/kalkulator\/api\/v1\/er-apoteker/,
    status: 500,
    overrideJsonResponse: { message: 'Internal Server Error' },
  }
}
