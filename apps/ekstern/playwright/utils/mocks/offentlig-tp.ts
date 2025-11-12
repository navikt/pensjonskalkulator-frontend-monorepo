import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { OffentligTjenestepensjonSimuleringResultV2 } from './types'

type OffentligTpMockOptions =
  Partial<OffentligTjenestepensjonSimuleringResultV2>

export const offentligTp = async (
  options: OffentligTpMockOptions = {}
): Promise<RouteDefinition> => {
  const offentligTpMock = (await loadJSONMock(
    'offentlig-tp.json'
  )) as OffentligTjenestepensjonSimuleringResultV2

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
    jsonResponse: {
      ...offentligTpMock,
      ...options,
    },
  }
}
