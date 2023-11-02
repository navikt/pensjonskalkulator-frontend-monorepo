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
        samtykke: boolean
        afp?: AfpRadio
        samboer?: boolean
      }): Chainable<void>
      /**
       * Custom command for å fille ut verdier i storen for å simulere svarene i stegvisning.
       *
       * @example cy.login()
       */
      login(): Chainable<void>
    }
  }
}

export {}
