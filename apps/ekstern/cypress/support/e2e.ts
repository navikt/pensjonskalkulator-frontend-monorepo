import 'cypress-axe'

import { userInputActions } from '../../src/state/userInput/userInputReducer'

beforeEach(() => {
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/person' },
    { fixture: 'person.json' }
  )

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/inntekt' },
    { fixture: 'inntekt.json' }
  )

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v1/tidligste-uttaksalder' },
    { fixture: 'tidligste-uttaksalder.json' }
  )

  cy.intercept(
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v1/alderspensjon/simulering',
    },
    { fixture: 'alderspensjon.json' }
  )
})

Cypress.Commands.add('fillOutStegvisning', (args) => {
  const { samtykke, afp = 'vet_ikke', samboer = true } = args
  cy.window()
    .its('store')
    .invoke('dispatch', userInputActions.setSamtykke(samtykke))
  cy.window().its('store').invoke('dispatch', userInputActions.setAfp(afp))
  cy.window()
    .its('store')
    .invoke('dispatch', userInputActions.setSamboer(samboer))
})
