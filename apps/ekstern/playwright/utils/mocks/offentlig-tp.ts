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
    method: 'POST',
    overrideJsonResponse: {
      ...offentligTpMock,
      ...options,
    },
  }
}

export const offentligTpTekniskFeil = (): RouteDefinition => ({
  url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
  method: 'POST',
  overrideJsonResponse: {
    simuleringsresultatStatus: 'TEKNISK_FEIL',
    muligeTpLeverandoerListe: [],
  },
})

export const offentligTpTomSimulering = (): RouteDefinition => ({
  url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
  method: 'POST',
  overrideJsonResponse: {
    simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
    muligeTpLeverandoerListe: [],
  },
})

export const offentligTpIkkeMedlem = (): RouteDefinition => ({
  url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
  method: 'POST',
  overrideJsonResponse: {
    simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
    muligeTpLeverandoerListe: [],
  },
})

export const offentligTpAnnenOrdning = (): RouteDefinition => ({
  url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
  method: 'POST',
  overrideJsonResponse: {
    simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
    muligeTpLeverandoerListe: ['KLP'],
  },
})
