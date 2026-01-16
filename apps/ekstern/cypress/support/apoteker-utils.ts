/**
 * Custom Cypress commands for setting up apoteker-related scenarios
 */

/**
 * Sets up intercepts and Redux state for apoteker error scenarios
 * This mocks the /er-apoteker API to fail and sets the appropriate Redux state
 */
Cypress.Commands.add('setupApotekerError', () => {
  // Mock person API with birth date 1964 (born 1963 or later)
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/v6/person' },
    {
      fornavn: 'Aprikos',
      sivilstand: 'UGIFT',
      foedselsdato: '1964-04-30',
      pensjoneringAldre: {
        normertPensjoneringsalder: {
          aar: 67,
          maaneder: 0,
        },
        nedreAldersgrense: {
          aar: 62,
          maaneder: 0,
        },
        oevreAldersgrense: {
          aar: 75,
          maaneder: 0,
        },
      },
    }
  ).as('getPerson')

  // Mock er-apoteker API to fail with 500 error
  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/er-apoteker',
    },
    {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }
  ).as('getErApoteker')
})

/**
 * Sets Redux state for apoteker error (call after login when store is available)
 */
Cypress.Commands.add('setApotekerErrorState', () => {
  // Set Redux state to indicate apoteker error
  cy.window().its('store').invoke('dispatch', {
    type: 'sessionSlice/setErApotekerError',
    payload: true,
  })
})

/**
 * Sets up intercept for successful apoteker response (user is apoteker)
 * This mocks the /er-apoteker API to return that the user is an apoteker
 */
Cypress.Commands.add('setupApotekerSuccess', () => {
  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v1/er-apoteker',
    },
    { apoteker: true, aarsak: 'ER_APOTEKER' }
  ).as('getErApoteker')
})
