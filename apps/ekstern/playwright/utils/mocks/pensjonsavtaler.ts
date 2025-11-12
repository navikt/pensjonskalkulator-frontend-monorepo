import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { PensjonsavtaleResultV3 } from './types'

type PensjonsavtalerMockOptions = Partial<PensjonsavtaleResultV3> & {
  delvisSvar?: false
}

export const pensjonsavtaler = async (
  options: PensjonsavtalerMockOptions = {}
): Promise<RouteDefinition> => {
  const { delvisSvar, ...overrides } = options

  const mockFileName =
    delvisSvar === false
      ? 'pensjonsavtaler-delvis-svar.json'
      : 'pensjonsavtaler.json'

  const pensjonsavtalerMock = (await loadJSONMock(
    mockFileName
  )) as PensjonsavtaleResultV3

  return {
    url: /\/pensjon\/kalkulator\/api\/v3\/pensjonsavtaler/,
    jsonResponse: {
      ...pensjonsavtalerMock,
      ...overrides,
    },
  }
}
