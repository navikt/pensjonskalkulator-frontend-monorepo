import type { components } from '../../../src/types/schema.d.ts'
import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type OmstillingsstoenadOgGjenlevendeMockOptions = Partial<
  components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']
>

export const omstillingsstoenadOgGjenlevende = async (
  options: OmstillingsstoenadOgGjenlevendeMockOptions = {}
): Promise<RouteDefinition> => {
  const omstillingsstoenadOgGjenlevendeMock = (await loadJSONMock(
    'omstillingsstoenad-og-gjenlevende.json'
  )) as components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']

  return {
    url: /\/pensjon\/kalkulator\/api\/v1\/loepende-omstillingsstoenad-eller-gjenlevendeytelse/,
    jsonResponse: {
      ...omstillingsstoenadOgGjenlevendeMock,
      ...options,
    },
  }
}
