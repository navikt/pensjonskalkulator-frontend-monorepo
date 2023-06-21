describe('Pensjonskalkulator', () => {
  it('rendrer som den skal uten åpenbare a11y-feil', () => {
    cy.visit('/pensjon/kalkulator/')
    cy.fillOutStegvisning(true)
    cy.window().its('router').invoke('navigate', '/beregning')

    cy.contains('Når vil du ta ut alderspensjon?')
    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
