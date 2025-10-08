/**
 * Custom Cypress commands for setting up person-related test scenarios
 */

/**
 * Sets up intercept for person born before 1963
 * This mocks the /person API to return a person with birth date before 1963
 */
Cypress.Commands.add('setupPersonFoedtFoer1963', () => {
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/v5/person' },
    {
      navn: 'Aprikos',
      sivilstand: 'UGIFT',
      foedselsdato: '1962-04-30',
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
})

/**
 * Sets up intercept for person born 1963 or later
 * This mocks the /person API to return a person with birth date after 1963
 */
Cypress.Commands.add('setupPersonFoedtEtter1963', () => {
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/v5/person' },
    {
      navn: 'Aprikos',
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
})
