import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'
import type { OffentligTjenestepensjonSimuleringResultV2 } from './types'

type OffentligTpPreset =
  | 'spk'
  | 'spk_uten_betinget'
  | 'klp'
  | 'unsupported'
  | 'no_membership'
  | 'technical_error'
  | 'empty_response'
  | 'server_error'

type OffentligTpMockOptions =
  Partial<OffentligTjenestepensjonSimuleringResultV2> & {
    preset?: OffentligTpPreset
    unsupportedProviders?: string[]
  }

const presetConfigs: Record<
  OffentligTpPreset,
  () => Partial<OffentligTjenestepensjonSimuleringResultV2>
> = {
  spk: () => ({
    simuleringsresultatStatus: 'OK',
    muligeTpLeverandoerListe: [
      'Statens pensjonskasse',
      'Kommunal Landspensjonskasse',
      'Oslo Pensjonsforsikring',
    ],
    simulertTjenestepensjon: {
      tpLeverandoer: 'Statens pensjonskasse',
      tpNummer: '3010',
      simuleringsresultat: {
        utbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            sluttAlder: { aar: 69, maaneder: 11 },
            aarligUtbetaling: 64340,
          },
          {
            startAlder: { aar: 70, maaneder: 0 },
            sluttAlder: { aar: 74, maaneder: 11 },
            aarligUtbetaling: 53670,
          },
          {
            startAlder: { aar: 75, maaneder: 0 },
            aarligUtbetaling: 48900,
          },
        ],
        betingetTjenestepensjonErInkludert: true,
      },
    },
  }),
  spk_uten_betinget: () => ({
    simuleringsresultatStatus: 'OK',
    muligeTpLeverandoerListe: [
      'Statens pensjonskasse',
      'Kommunal Landspensjonskasse',
      'Oslo Pensjonsforsikring',
    ],
    simulertTjenestepensjon: {
      tpLeverandoer: 'Statens pensjonskasse',
      tpNummer: '3010',
      simuleringsresultat: {
        utbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            sluttAlder: { aar: 69, maaneder: 11 },
            aarligUtbetaling: 64340,
          },
          {
            startAlder: { aar: 70, maaneder: 0 },
            sluttAlder: { aar: 74, maaneder: 11 },
            aarligUtbetaling: 53670,
          },
          {
            startAlder: { aar: 75, maaneder: 0 },
            aarligUtbetaling: 48900,
          },
        ],
        betingetTjenestepensjonErInkludert: false,
      },
    },
  }),
  klp: () => ({
    simuleringsresultatStatus: 'OK',
    muligeTpLeverandoerListe: ['Kommunal Landspensjonskasse'],
    simulertTjenestepensjon: {
      tpNummer: '4082',
      tpLeverandoer: 'Kommunal Landspensjonskasse',
      simuleringsresultat: {
        utbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            sluttAlder: { aar: 71, maaneder: 11 },
            aarligUtbetaling: 60000,
          },
          {
            startAlder: { aar: 72, maaneder: 0 },
            aarligUtbetaling: 72000,
          },
        ],
        betingetTjenestepensjonErInkludert: false,
      },
    },
  }),
  unsupported: () => ({
    simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
    muligeTpLeverandoerListe: ['Oslo Pensjonsforsikring'],
  }),
  no_membership: () => ({
    simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
    muligeTpLeverandoerListe: [],
  }),
  technical_error: () => ({
    simuleringsresultatStatus: 'TEKNISK_FEIL',
    muligeTpLeverandoerListe: [],
  }),
  empty_response: () => ({
    simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
    muligeTpLeverandoerListe: [],
  }),
  server_error: () => ({
    simuleringsresultatStatus: 'TEKNISK_FEIL',
    muligeTpLeverandoerListe: [],
  }),
}

export const offentligTp = async (
  options: OffentligTpMockOptions = {}
): Promise<RouteDefinition> => {
  const { preset, unsupportedProviders, ...overrides } = options

  if (preset === 'server_error') {
    return {
      url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
      method: 'POST',
      status: 503,
      overrideJsonResponse: {},
    }
  }

  let baseResponse: Partial<OffentligTjenestepensjonSimuleringResultV2>

  if (preset) {
    baseResponse = presetConfigs[preset]()
    if (preset === 'unsupported' && unsupportedProviders) {
      baseResponse.muligeTpLeverandoerListe = unsupportedProviders
    }
  } else {
    baseResponse = (await loadJSONMock(
      'offentlig-tp.json'
    )) as OffentligTjenestepensjonSimuleringResultV2
  }

  return {
    url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
    method: 'POST',
    overrideJsonResponse: {
      ...baseResponse,
      ...overrides,
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
