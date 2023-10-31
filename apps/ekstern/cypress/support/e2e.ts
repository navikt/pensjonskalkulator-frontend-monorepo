import 'cypress-axe'

import { userInputActions } from '../../src/state/userInput/userInputReducer'

beforeEach(() => {
  cy.intercept(
    'GET',
    'https://dekoratoren.ekstern.dev.nav.no/api/driftsmeldinger',
    {
      statusCode: 200,
      body: [],
    }
  )
  cy.intercept(
    'GET',
    'https://www.ekstern.dev.nav.no/person/nav-dekoratoren-api/auth',
    {
      statusCode: 200,
    }
  )
  cy.intercept('GET', 'https://login.ekstern.dev.nav.no/oauth2/session', {
    statusCode: 200,
  })
  cy.intercept('GET', 'https://dekoratoren.ekstern.dev.nav.no/api/meny', {
    statusCode: 200,
  })
  cy.intercept('GET', 'https://dekoratoren.ekstern.dev.nav.no/api/ta', {
    statusCode: 200,
  })
  cy.intercept('POST', 'https://amplitude.nav.no/collect-auto', {
    statusCode: 200,
  })

  cy.intercept('GET', '/pensjon/kalkulator/oauth2/session', {
    statusCode: 200,
  })

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.disable-spraakvelger',
    },
    { fixture: 'disable-spraakvelger.json' }
  )

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
    { method: 'POST', url: '/pensjon/kalkulator/api/v1/pensjonsavtaler' },
    { fixture: 'pensjonsavtaler.json' }
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
