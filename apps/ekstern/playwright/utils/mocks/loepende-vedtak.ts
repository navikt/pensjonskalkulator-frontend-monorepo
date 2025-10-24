import { type RouteDefinition } from '../../base.js'
import { loadJSONMock } from '../mock.js'
import type { LoependeVedtakV4 } from './types'

type LoependeVedtakMockOptions = Partial<LoependeVedtakV4> & {
  endring?: boolean
}

export const loependeVedtak = async (
  options: LoependeVedtakMockOptions = {}
): Promise<RouteDefinition> => {
  const { endring = false, ...overrides } = options

  const mockFile = endring
    ? 'loepende-vedtak-endring.json'
    : 'loepende-vedtak.json'

  const loependeVedtakMock = (await loadJSONMock(mockFile)) as LoependeVedtakV4

  return {
    url: /\/pensjon\/kalkulator\/api\/v4\/vedtak\/loepende-vedtak/,
    jsonResponse: {
      ...loependeVedtakMock,
      ...overrides,
    },
  }
}
