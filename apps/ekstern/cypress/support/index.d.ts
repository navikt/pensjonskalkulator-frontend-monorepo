/// <reference types="../../src/types/types" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command for å fille ut verdier i storen for å simulere svarene i stegvisning.
       *
       * @example cy.fillOutStegvisning(true, 'ja_offentlig', false)
       */
      fillOutStegvisning(args: {
        samtykke?: boolean
        afp?: AfpRadio
        samtykkeAfpOffentlig?: boolean
        sivilstand?: Sivilstand
        epsHarPensjon?: boolean
        epsHarInntektOver2G?: boolean
      }): Chainable<void>
      /**
       * Custom command for å logge inn og navigere til /start
       *
       * @example cy.login()
       */
      login(): Chainable<void>
      /**
       * Custom command for å sette opp apoteker error scenario
       *
       * @example cy.setupApotekerError()
       */
      setupApotekerError(): Chainable<void>
      /**
       * Custom command for å sette Redux state for apoteker error (call after login)
       *
       * @example cy.setApotekerErrorState()
       */
      setApotekerErrorState(): Chainable<void>
      /**
       * Custom command for å sette opp apoteker success scenario
       *
       * @example cy.setupApotekerSuccess()
       */
      setupApotekerSuccess(): Chainable<void>
      /**
       * Custom command for å sette opp person født før 1963
       *
       * @example cy.setupPersonFoedtFoer1963()
       */
      setupPersonFoedtFoer1963(): Chainable<void>
      /**
       * Custom command for å sette opp person født etter 1963
       *
       * @example cy.setupPersonFoedtEtter1963()
       */
      setupPersonFoedtEtter1963(): Chainable<void>
      /**
       * Custom command for å sette opp løpende vedtak med pre-2025 offentlig AFP
       *
       * @example cy.setupLoependeVedtakWithPre2025OffentligAFP(80)
       */
      setupLoependeVedtakWithPre2025OffentligAFP(grad?: number): Chainable<void>
      /**
       * Custom command for å sette opp løpende vedtak med fremtidig alderspensjon
       *
       * @example cy.setupLoependeVedtakWithFremtidigAlderspensjon(100, '2099-01-01')
       */
      setupLoependeVedtakWithFremtidigAlderspensjon(
        grad: number,
        fom?: string
      ): Chainable<void>
    }
  }
}

export {}
