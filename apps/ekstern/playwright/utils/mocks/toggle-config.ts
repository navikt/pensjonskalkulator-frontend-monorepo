import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type ToggleConfig = Record<string, { enabled: boolean }>

type ToggleConfigMockOptions = Partial<ToggleConfig>

export const toggleConfig = async (
  options: ToggleConfigMockOptions = {}
): Promise<RouteDefinition> => {
  const toggleConfigMock = (await loadJSONMock(
    'toggle-config.json'
  )) as ToggleConfig

  return {
    url: /\/pensjon\/kalkulator\/api\/feature\//,
    jsonResponse: {
      ...toggleConfigMock,
      ...options,
    },
  }
}
