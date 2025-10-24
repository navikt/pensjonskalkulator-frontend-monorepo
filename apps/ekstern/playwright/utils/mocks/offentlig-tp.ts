import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type OffentligTpMockOptions = Partial<
  components['schemas']['OffentligTjenestepensjonSimuleringResultV2']
>

export const offentligTp = async (
  options: OffentligTpMockOptions = {}
): Promise<RouteDefinition> => {
  const offentligTpMock = (await loadJSONMock(
    'offentlig-tp.json'
  )) as components['schemas']['OffentligTjenestepensjonSimuleringResultV2']

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
    jsonResponse: {
      ...offentligTpMock,
      ...options,
    },
  }
}
