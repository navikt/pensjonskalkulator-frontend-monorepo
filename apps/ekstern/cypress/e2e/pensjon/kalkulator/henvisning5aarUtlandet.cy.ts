describe('Henvisning, 5år eller mer i utlandet', () => {
  describe('Når jeg som bruker som har bodd 5 år eller mer i utlandet ønsker å bruke enkel kalkulator,', () => {
    beforeEach(() => {
      cy.login()
    })
    it('Forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
      cy.contains('button', 'Kom i gang').click()
      cy.contains('h2', 'Utenlandsopphold').should('exist')
      cy.contains(
        'Har du bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år?'
      ).should('exist')
      cy.get('[type="radio"]').first().check()
      cy.contains('button', 'Neste').click()

      cy.contains('h2', 'Du kan dessverre ikke bruke enkel kalkulator').should(
        'exist'
      )

      cy.contains('button', 'Avbryt').click()
      cy.location('href').should(
        'eq',
        'http://localhost:4173/pensjon/kalkulator/login'
      )
      cy.contains('button', 'Enkel kalkulator').click()
      cy.contains('button', 'Kom i gang').click()
      cy.get('[type="radio"]').first().check()
      cy.contains('button', 'Neste').click()
      cy.contains('button', 'Detaljert kalkulator').click()
      cy.origin('https://login.idporten.no', () => {
        cy.get('h1').contains('Velg elektronisk ID')
      })
    })
  })
})

export {}
