describe('Pensjonskalkulator', () => {
  it('rendrer som den skal uten åpenbare a11y-feil', () => {
    cy.intercept(
      { method: 'GET', url: '/pensjon/kalkulator/api/tidligste-uttaksalder' },
      {
        fixture: 'tidligstemuligeuttaksalder.json',
      }
    )
    cy.visit('/pensjon/kalkulator')
    cy.contains('Når kan du ta ut alderspensjon?')
    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
