describe('Pensjonskalkulator', () => {
  it('rendrer som den skal uten åpenbare a11y-feil', () => {
    cy.intercept(
      { method: 'GET', url: '/pensjon/kalkulator/api/pensjonsberegning' },
      {
        fixture: 'pensjonsberegning.json',
      }
    )
    cy.visit('/pensjon/kalkulator')
    // Venter på at fade-in animasjonen er ferdig
    cy.wait(250)

    cy.contains('Alternativer for når du kan ta ut')
    cy.contains('678 000')
    cy.contains('300 000')
    cy.contains('350 000')
    cy.contains('400 000')

    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
