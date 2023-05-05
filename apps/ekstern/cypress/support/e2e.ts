import 'cypress-axe'

before(() => {
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/tidligste-uttaksalder' },
    { fixture: 'tidligstemuligeuttaksalder.json' }
  )
  cy.intercept(
    { method: 'GET', url: '/pensjon/kalkulator/api/person' },
    { fixture: 'person.json' }
  )
})
