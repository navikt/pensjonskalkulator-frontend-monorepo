import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse } from './types'

type OmstillingsstoenadOgGjenlevendeMockOptions =
  Partial<BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse>

export const omstillingsstoenadOgGjenlevende = async (
  options: OmstillingsstoenadOgGjenlevendeMockOptions = {}
): Promise<RouteDefinition> => {
  const omstillingsstoenadOgGjenlevendeMock = (await loadJSONMock(
    'omstillingsstoenad-og-gjenlevende.json'
  )) as BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse

  return {
    url: /\/pensjon\/kalkulator\/api\/v1\/loepende-omstillingsstoenad-eller-gjenlevendeytelse/,
    jsonResponse: {
      ...omstillingsstoenadOgGjenlevendeMock,
      ...options,
    },
  }
}
