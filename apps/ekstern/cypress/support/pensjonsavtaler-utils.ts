interface OffentligTp {
  simuleringsresultatStatus: string
  muligeTpLeverandoerListe: string[]
  simulertTjenestepensjon?: {
    tpLeverandoer: string
    tpNummer: string
    simuleringsresultat: {
      utbetalingsperioder: Array<{
        startAlder: { aar: number; maaneder: number }
        sluttAlder?: { aar: number; maaneder: number }
        aarligUtbetaling: number
      }>
      betingetTjenestepensjonErInkludert: boolean
    }
  }
}

interface PensjonsavtalerResponse {
  avtaler: unknown[]
  utilgjengeligeSelskap: unknown[]
}

/**
 * Utility functions for setting up common pension-related intercepts
 */
export class PensjonsavtalerIntercepts {
  /**
   * Set up intercept for offentlig tjenestepensjon with OK status and SPK provider
   */
  static offentligTpSpkOk(betingetTjenestepensjonErInkludert = true): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
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
            betingetTjenestepensjonErInkludert,
          },
        },
      } satisfies OffentligTp
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with OK status and KLP provider
   */
  static offentligTpKlpOk(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
        simuleringsresultatStatus: 'OK',
        muligeTpLeverandoerListe: ['Kommunal Landspensjonskasse'],
        simulertTjenestepensjon: {
          tpNummer: '4082',
          tpLeverandoer: 'Kommunal Landspensjonskasse',
          simuleringsresultat: {
            utbetalingsperioder: [
              {
                startAlder: {
                  aar: 67,
                  maaneder: 0,
                },
                sluttAlder: {
                  aar: 71,
                  maaneder: 11,
                },
                aarligUtbetaling: 60000,
              },
              {
                startAlder: {
                  aar: 72,
                  maaneder: 0,
                },
                aarligUtbetaling: 72000,
              },
            ],
            betingetTjenestepensjonErInkludert: false,
          },
        },
      } satisfies OffentligTp
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with unsupported provider status
   */
  static offentligTpUnsupported(
    providers: string[] = ['Oslo Pensjonsforsikring']
  ): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
        simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
        muligeTpLeverandoerListe: providers,
      }
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with no membership status
   */
  static offentligTpNoMembership(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
        simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
        muligeTpLeverandoerListe: [],
      }
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with technical error
   */
  static offentligTpTechnicalError(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
        simuleringsresultatStatus: 'TEKNISK_FEIL',
        muligeTpLeverandoerListe: [],
      }
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with empty response error
   */
  static offentligTpEmptyResponse(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v2/simuler-oftp',
      },
      {
        simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
        muligeTpLeverandoerListe: [],
      }
    ).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for offentlig tjenestepensjon with server error (503)
   */
  static offentligTpServerError(): void {
    cy.intercept('POST', '/pensjon/kalkulator/api/v2/simuler-oftp', {
      statusCode: 503,
    }).as('fetchOffentligTp')
  }

  /**
   * Set up intercept for pensjonsavtaler with empty response
   */
  static pensjonsavtalerEmpty(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v3/pensjonsavtaler',
      },
      {
        avtaler: [],
        utilgjengeligeSelskap: [],
      } satisfies PensjonsavtalerResponse
    ).as('fetchPensjonsavtaler')
  }

  /**
   * Set up intercept for alderspensjon simulering with AFP offentlig
   */
  static alderspensjonMedAfpOffentlig(): void {
    cy.intercept(
      {
        method: 'POST',
        url: '/pensjon/kalkulator/api/v9/alderspensjon/simulering',
      },
      { fixture: 'alderspensjon_med_afp_offentlig.json' }
    ).as('fetchAlderspensjon')
  }
}

// Register Cypress commands
Cypress.Commands.add(
  'setupOffentligTpSpkOk',
  (betingetTjenestepensjonErInkludert = true) => {
    PensjonsavtalerIntercepts.offentligTpSpkOk(
      betingetTjenestepensjonErInkludert
    )
  }
)

Cypress.Commands.add('setupOffentligTpKlpOk', () => {
  PensjonsavtalerIntercepts.offentligTpKlpOk()
})

Cypress.Commands.add(
  'setupOffentligTpUnsupported',
  (providers = ['Oslo Pensjonsforsikring']) => {
    PensjonsavtalerIntercepts.offentligTpUnsupported(providers)
  }
)

Cypress.Commands.add('setupOffentligTpNoMembership', () => {
  PensjonsavtalerIntercepts.offentligTpNoMembership()
})

Cypress.Commands.add('setupOffentligTpTechnicalError', () => {
  PensjonsavtalerIntercepts.offentligTpTechnicalError()
})

Cypress.Commands.add('setupOffentligTpEmptyResponse', () => {
  PensjonsavtalerIntercepts.offentligTpEmptyResponse()
})

Cypress.Commands.add('setupOffentligTpServerError', () => {
  PensjonsavtalerIntercepts.offentligTpServerError()
})

Cypress.Commands.add('setupPensjonsavtalerEmpty', () => {
  PensjonsavtalerIntercepts.pensjonsavtalerEmpty()
})

Cypress.Commands.add('setupAlderspensjonMedAfpOffentlig', () => {
  PensjonsavtalerIntercepts.alderspensjonMedAfpOffentlig()
})
