import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type AlderspensjonMockOptions = Partial<
  components['schemas']['PersonligSimuleringResultV8']
> & {
  preset?: 'endring' | 'for_lite_trygdetid' | 'med_afp_offentlig'
}

export const alderspensjon = async (
  options: AlderspensjonMockOptions = {}
): Promise<RouteDefinition> => {
  const { preset, ...overrides } = options

  const getMockFileName = (): string => {
    switch (preset) {
      case 'endring':
        return 'alderspensjon_endring.json'
      case 'for_lite_trygdetid':
        return 'alderspensjon_for_lite_trygdetid.json'
      case 'med_afp_offentlig':
        return 'alderspensjon_med_afp_offentlig.json'
      default:
        return 'alderspensjon.json'
    }
  }

  const mockFileName = getMockFileName()

  const alderspensjonMock = (await loadJSONMock(
    mockFileName
  )) as components['schemas']['PersonligSimuleringResultV8']

  return {
    url: /\/pensjon\/kalkulator\/api\/v8\/alderspensjon\/simulering/,
    jsonResponse: {
      ...alderspensjonMock,
      ...overrides,
    },
  }
}
