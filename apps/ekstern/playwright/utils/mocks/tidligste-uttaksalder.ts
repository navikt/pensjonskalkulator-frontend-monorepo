import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { UttaksalderResultV2 } from './types'

type TidligsteUttaksalderMockOptions = Partial<UttaksalderResultV2>

export const tidligsteUttaksalder = async (
  options: TidligsteUttaksalderMockOptions = {}
): Promise<RouteDefinition> => {
  const tidligsteUttaksalderMock = (await loadJSONMock(
    'tidligste-uttaksalder.json'
  )) as UttaksalderResultV2

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/tidligste-hel-uttaksalder/,
    jsonResponse: {
      ...tidligsteUttaksalderMock,
      ...options,
    },
  }
}
