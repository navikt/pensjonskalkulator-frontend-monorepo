import 'cypress-axe'

beforeEach(() => {
  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/tidligste-uttaksalder' },
    { fixture: 'tidligste-uttaksalder.json' }
  )
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/person' },
    { fixture: 'person.json' }
  )
  cy.intercept(
    { method: 'POST', url: '/pensjon/kalkulator/api/alderspensjon/simulering' },
    { fixture: 'alderspensjon.json' }
  )
})
