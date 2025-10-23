import type { components } from '../../../src/types/schema.js'
import { type RouteDefinition } from '../../base.js'
import { loadJSONMock } from '../mock.js'

type LoependeVedtakMockOptions = Partial<
  components['schemas']['LoependeVedtakV4']
> & {
  endring?: boolean
}

export const loependeVedtak = async (
  options: LoependeVedtakMockOptions = {}
): Promise<RouteDefinition> => {
  const { endring = false, ...overrides } = options

  const mockFile = endring
    ? 'loepende-vedtak-endring.json'
    : 'loepende-vedtak.json'

  const loependeVedtakMock = (await loadJSONMock(
    mockFile
  )) as components['schemas']['LoependeVedtakV4']

  return {
    url: /\/pensjon\/kalkulator\/api\/v4\/vedtak\/loepende-vedtak/,
    jsonResponse: {
      ...loependeVedtakMock,
      ...overrides,
    },
  }
}
