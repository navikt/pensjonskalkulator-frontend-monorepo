import 'cypress-axe'

import { userInputActions } from '../../src/state/userInput/userInputReducer'

beforeEach(() => {
  cy.intercept('GET', `/person/nav-dekoratoren-api/auth`, {
    statusCode: 200,
    body: {
      authenticated: true,
      name: 'Aprikos Nordmann',
      securityLevel: '4',
    },
  }).as('getDecoratorPersonAuth')

  cy.intercept('GET', `https://login.nav.no/oauth2/session`, {
    statusCode: 200,
  }).as('getDecoratorLoginAuth')

  cy.intercept(
    {
      method: 'GET',
      url: `/main-menu?*`,
    },
    { fixture: 'decorator-main-menu.html' }
  ).as('getDecoratorMainMenu')

  cy.intercept(
    {
      method: 'GET',
      url: `/user-menu?*`,
    },
    { fixture: 'decorator-user-menu.html' }
  ).as('getDecoratorUserMenu')

  cy.intercept(
    {
      method: 'GET',
      url: `/ops-messages`,
    },
    { fixture: 'decorator-ops-messages.html' }
  ).as('getDecoratorOpsMessages')

  cy.intercept(
    {
      method: 'GET',
      url: `${Cypress.env(
        'DECORATOR_URL'
      )}/env?chatbot=false&redirectToUrl=https://www.nav.no/pensjon/kalkulator/start`,
    },
    { fixture: 'decorator-env-features.json' }
  ).as('getDecoratorEnvFeatures')

  cy.intercept('POST', '/collect', {
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
    { fixture: 'toggle-disable-spraakvelger.json' }
  ).as('getFeatureToggleSpraakvelger')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin',
    },
    { fixture: 'toggle-enable-highcharts-accessibility-plugin.json' }
  ).as('getFeatureToggleHighcharts')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.enable-ufoere',
    },
    { fixture: 'toggle-enable-ufoere.json' }
  ).as('getFeatureToggleUfoere')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/ekskludert',
    },
    { fixture: 'ekskludert-status.json' }
  ).as('getEkskludertStatus')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/ufoeregrad',
    },
    { fixture: 'ufoeregrad.json' }
  ).as('getUfoeregrad')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/v2/person' },
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
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v1/tidligste-hel-uttaksalder',
    },
    { fixture: 'tidligste-uttaksalder.json' }
  ).as('fetchTidligsteUttaksalder')

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v2/pensjonsavtaler' },
    { fixture: 'pensjonsavtaler.json' }
  ).as('fetchPensjonsavtaler')

  cy.intercept(
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v6/alderspensjon/simulering',
    },
    { fixture: 'alderspensjon.json' }
  ).as('fetchAlderspensjon')
})

Cypress.Commands.add('login', () => {
  cy.visit('/pensjon/kalkulator/')
  cy.wait('@getAuthSession')
  cy.contains('button', 'Pensjonskalkulator').click()
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

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Amplitude')) {
    // prevents Amplitude errors to fail tests
    return false
  }
})
