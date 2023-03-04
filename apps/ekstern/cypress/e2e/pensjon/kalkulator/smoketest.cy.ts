describe('Pensjonskalkulator', () => {
  it('viser status', () => {
    cy.visit('/pensjon/kalkulator')
    cy.contains('Pensjonskalkulator is "OK"')

    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
