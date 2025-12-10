import 'cypress-axe'
import './apoteker-utils'
import './person-utils'
import './loepende-vedtak-utils'
import './pensjonsavtaler-utils'

import { userInputActions } from '../../src/state/userInput/userInputSlice'

beforeEach(() => {
  cy.setCookie(
    'navno-consent',
    '{%22consent%22:{%22analytics%22:false%2C%22surveys%22:false}%2C%22userActionTaken%22:true%2C%22meta%22:{%22createdAt%22:%222025-02-17T09:17:38.688Z%22%2C%22updatedAt%22:%222025-02-17T09:17:38.688Z%22%2C%22version%22:1}}'
  ) // Skjuler cookiebanner (har ingenting å si for testene, er kun for å slippe å se det når tester lokalt)

  cy.intercept(
    {
      method: 'GET',
      url: `/auth?`,
    },
    { fixture: 'decorator-auth.json' }
  ).as('getDecoratorPersonAuth')

  cy.intercept('GET', `https://login.ekstern.dev.nav.no/oauth2/session`, {
    statusCode: 200,
  }).as('getDecoratorLoginAuth')

  cy.intercept('GET', `https://login.nav.no/oauth2/session`, {
    statusCode: 200,
  }).as('getDecoratorLoginAuthProd')

  cy.intercept(
    {
      method: 'GET',
      url: `https://representasjon-banner-frontend-borger-q2.ekstern.dev.nav.no/pensjon/selvbetjening/representasjon/api/representasjon/harRepresentasjonsforhold`,
    },
    { fixture: 'representasjon-banner.json' }
  ).as('getRepresentasjonBanner')

  cy.intercept(
    {
      method: 'GET',
      url: `https://www.nav.no/pensjon/selvbetjening/representasjon/api/representasjon/harRepresentasjonsforhold`,
    },
    { fixture: 'representasjon-banner.json' }
  ).as('getRepresentasjonBannerProd')

  cy.intercept('GET', `/collect`, {
    statusCode: 200,
  }).as('getDecoratoCollect')

  cy.intercept(
    {
      method: 'GET',
      url: `/api/ta`,
    },
    { fixture: 'decorator-ta.json' }
  ).as('getDecoratorTa')

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
      url: `https://dekoratoren.ekstern.dev.nav.no/main-menu?`,
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
    { fixture: 'decorator-ops.json' }
  ).as('getDecoratorOpsMessages')

  // /env?chatbot=false&logoutWarning=true&redirectToUrl=https://www.nav.no/pensjon/kalkulator/start
  // https://dekoratoren.ekstern.dev.nav.no/env?chatbot=false&logoutWarning=true&redirectToUrl=https://www.nav.no/pensjon/kalkulator/start
  cy.intercept(
    {
      method: 'GET',
      url: `${Cypress.env(
        'DEV_DECORATOR_URL'
      )}/env?chatbot=false&logoutWarning=true&redirectToUrl=https://www.nav.no/pensjon/kalkulator/start`,
    },
    { fixture: 'decorator-env-features.json' }
  ).as('getDecoratorEnvFeatures')

  cy.intercept('POST', 'https://umami.nav.no/api/send', {
    statusCode: 200,
  }).as('umamiCollect')

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
      url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.vedlikeholdsmodus',
    },
    { enabled: false }
  ).as('getVedlikeholdsmodusFeatureToggle')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/feature/utvidet-simuleringsresultat',
    },
    { enabled: false }
  ).as('getFeatureToggleUtvidetSimuleringsresult')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/er-apoteker',
    },
    { fixture: 'er-apoteker.json' }
  ).as('getErApoteker')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v2/tpo-livsvarig-offentlig-afp',
    },
    { fixture: 'afp-offentlig-livsvarig.json' }
  ).as('getTpoAfpOffentligLivsvarig')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v2/ekskludert',
    },
    { fixture: 'ekskludert-status.json' }
  ).as('getEkskludertStatus')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
    },
    { fixture: 'omstillingsstoenad-og-gjenlevende.json' }
  ).as('getOmstillingsstoenadOgGjenlevende')

  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
    },
    { fixture: 'loepende-vedtak.json' }
  ).as('getLoependeVedtak')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/v6/person' },
    { fixture: 'person.json' }
  ).as('getPerson')

  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/inntekt' },
    { fixture: 'inntekt.json' }
  ).as('getInntekt')

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v2/simuler-oftp' },
    { fixture: 'offentlig-tp.json' }
  ).as('fetchOffentligTp')

  cy.intercept(
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v3/tidligste-hel-uttaksalder',
    },
    { fixture: 'tidligste-uttaksalder.json' }
  ).as('fetchTidligsteUttaksalder')

  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/v3/pensjonsavtaler' },
    { fixture: 'pensjonsavtaler.json' }
  ).as('fetchPensjonsavtaler')

  cy.intercept(
    {
      method: 'POST',
      url: '/pensjon/kalkulator/api/v9/alderspensjon/simulering',
    },
    { fixture: 'alderspensjon.json' }
  ).as('fetchAlderspensjon')

  cy.intercept(
    { url: 'https://g.nav.no/api/v1/grunnbel%C3%B8p' },
    {
      dato: '2024-05-01',
      grunnbeløp: 100000,
      grunnbeløpPerMåned: 10000,
      gjennomsnittPerÅr: 120000,
      omregningsfaktor: 1,
      virkningstidspunktForMinsteinntekt: '2024-06-03',
    }
  ).as('getGrunnbeløp')

  cy.intercept(
    { url: 'https://api.uxsignals.com/v2/study/id/*/active' },
    { active: false }
  ).as('getUxSignalsActive')
})

Cypress.Commands.add('login', () => {
  cy.visit('/pensjon/kalkulator/')
  cy.wait('@getAuthSession')
  // TODO reaktivere når dekoratøren er i produksjon
  // cy.wait('@getDecoratorMainMenu')
  cy.contains('button', 'Pensjonskalkulator').click()
  // På start steget kjøres automatisk kall til  /person, /apoteker, /inntekt, /loepende-omstillingsstoenad-eller-gjenlevendeytelse
  cy.wait('@getPerson')
  cy.wait('@getErApoteker')
  cy.wait('@getInntekt')
  cy.wait('@getOmstillingsstoenadOgGjenlevende')
  cy.wait('@getLoependeVedtak')
})

Cypress.Commands.add('fillOutStegvisning', (args) => {
  const {
    samtykke = false,
    afp = 'vet_ikke',
    samtykkeAfpOffentlig = true,
    sivilstand = 'UGIFT',
    epsHarPensjon = null,
    epsHarInntektOver2G = null,
  } = args

  cy.window()
    .its('store')
    .invoke('dispatch', userInputActions.setSamtykke(samtykke))

  if (afp === 'ja_offentlig') {
    // Setter samtykke til beregning av AFP-offentlig når brukeren har valgt AFP-offentlig
    cy.window()
      .its('store')
      .invoke(
        'dispatch',
        userInputActions.setSamtykkeOffentligAFP(samtykkeAfpOffentlig)
      )
  }

  cy.window().its('store').invoke('dispatch', userInputActions.setAfp(afp))

  cy.window().its('store').invoke(
    'dispatch',
    userInputActions.setSivilstand({
      sivilstand,
      epsHarPensjon,
      epsHarInntektOver2G,
    })
  )
  cy.window().its('router').invoke('navigate', '/beregning')
})

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Analytics')) {
    // prevents Analytics errors to fail tests
    return false
  } else if (
    err.stack?.includes(
      'https://representasjon-banner-frontend-borger-q2.ekstern.dev.nav.no'
    )
  ) {
    // prevents Representasjon banner errors to fail tests
    return false
  }
  return true
})
