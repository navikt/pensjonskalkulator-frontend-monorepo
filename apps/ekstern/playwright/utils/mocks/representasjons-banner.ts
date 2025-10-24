import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type RepresentasjonBannerMockOptions = {
  value?: boolean
}

export const representasjonBanner = async (
  options: RepresentasjonBannerMockOptions = {}
): Promise<RouteDefinition> => {
  const representasjonBannerMock = (await loadJSONMock(
    'representasjon-banner.json'
  )) as { value: boolean }

  return {
    url: /\/representasjon\/api\/representasjon\/harRepresentasjonsforhold/,
    jsonResponse: {
      ...representasjonBannerMock,
      ...options,
    },
  }
}
