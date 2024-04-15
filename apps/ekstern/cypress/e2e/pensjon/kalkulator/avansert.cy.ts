describe('Avansert', () => {
  describe('Gitt at jeg som bruker har gjort en enkel beregning,', () => {
    describe('Når jeg ønsker en avansert beregning', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: false })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('forventer jeg å kunne velge «Avansert fane» for å få flere valgmuligheter', () => {
        cy.contains('Avansert').click()
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
      })

      it('forventer også å kunne gå til Avansert fra «Uttaksgrad» og «Inntekt frem til uttak» i Grunnlaget', () => {
        cy.contains('button', '70').click()
        cy.contains('Uttaksgrad:').click({ force: true })
        cy.contains('Gå til avansert kalkulator').click({ force: true })
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
        cy.contains('Enkel').click()
        cy.contains('button', '70').click()
        cy.contains('Inntekt frem til uttak:').click({ force: true })
        cy.contains('Gå til avansert kalkulator').click({ force: true })
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
      })

      it('ønsker jeg å kunne starte ny beregning', () => {
        cy.contains('Avansert').click()
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
        cy.contains('button', 'Tilbake til start').click({ force: true })
        cy.location('href').should('include', '/pensjon/kalkulator/start')
      })
    })
  })
})
