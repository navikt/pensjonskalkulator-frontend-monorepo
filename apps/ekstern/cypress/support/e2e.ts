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
  ).as('getDecoratorDriftsmeldinger')

  cy.intercept(
    'GET',
    'https://www.ekstern.dev.nav.no/person/nav-dekoratoren-api/auth',
    {
      statusCode: 200,
    }
  ).as('getDecoratorPersonAuth')

  cy.intercept('GET', 'https://login.ekstern.dev.nav.no/oauth2/session', {
    statusCode: 200,
  }).as('getDecoratorLoginAuth')

  cy.intercept('GET', 'https://dekoratoren.ekstern.dev.nav.no/api/meny', {
    statusCode: 200,
  }).as('getDecoratorMeny')

  cy.intercept(
    {
      method: 'GET',
      url: 'https://dekoratoren.ekstern.dev.nav.no/api/ta',
    },
    { fixture: 'decorator-ta.json' }
  ).as('getDecoratorTa')

  cy.intercept(
    {
      method: 'GET',
      url: 'https://dekoratoren.ekstern.dev.nav.no/api/features?feature=dekoratoren.skjermdeling&feature=dekoratoren.chatbotscript',
    },
    { fixture: 'decorator-features.json' }
  ).as('getDecoratorFeatures')

  cy.intercept(
    {
      method: 'GET',
      url: 'https://dekoratoren.ekstern.dev.nav.no/env?chatbot=false&redirectToUrl=https://www.ekstern.dev.nav.no/pensjon/kalkulator/start',
    },
    { fixture: 'decorator-features.json' }
  ).as('getDecoratorEnvFeatures')

  cy.intercept('POST', 'https://amplitude.nav.no/collect-auto', {
    statusCode: 200,
  }).as('amplitudeCollect')

  cy.intercept('GET', '/pensjon/kalkulator/oauth2/session', {
    statusCode: 200,
  }).as('getAuthSession')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.disable-spraakvelger',
    },
    { fixture: 'disable-spraakvelger.json' }
  ).as('getFeatureToggleSpraakvelger')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/sak-status',
    },
    { fixture: 'sak-status.json' }
  ).as('getSakStatus')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/person' },
    { fixture: 'person.json' }
  ).as('getPerson')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/inntekt' },
    { fixture: 'inntekt.json' }
  ).as('getInntekt')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/tpo-medlemskap' },
    { fixture: 'tpo-medlemskap.json' }
  ).as('getTpoMedlemskap')

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v1/tidligste-uttaksalder' },
    { fixture: 'tidligste-uttaksalder.json' }
  ).as('fetchTidligsteUttaksalder')

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v1/pensjonsavtaler' },
    { fixture: 'pensjonsavtaler.json' }
  ).as('fetchPensjonsavtaler')

  cy.intercept(
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v1/alderspensjon/simulering',
    },
    { fixture: 'alderspensjon.json' }
  ).as('fetchAlderspensjon')
})

Cypress.Commands.add('login', () => {
  cy.visit('/pensjon/kalkulator/')
  cy.wait('@getDecoratorPersonAuth')
  cy.wait('@getDecoratorLoginAuth')
  cy.wait('@getAuthSession')
  cy.contains('button', 'Enkel kalkulator').click()
  cy.wait('@getPerson')
  cy.wait('@getInntekt')
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
  cy.window().its('router').invoke('navigate', '/beregning')
})
