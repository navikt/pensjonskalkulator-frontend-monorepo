describe('Velg uttaksalder', () => {
  context('når bruker velger 68 år', () => {
    it('vises grafen med start året før, fra 67 år', () => {
      cy.visit('/pensjon/kalkulator/start')
      cy.fillOutStegvisning({ samtykke: false })
      cy.window().its('router').invoke('navigate', '/beregning')

      cy.contains('button', '68 år').click()
      cy.contains('text', '67')
      cy.contains('text', '77+')
      cy.contains('text', '66').should('not.exist')
    })
  })
})

export {}
