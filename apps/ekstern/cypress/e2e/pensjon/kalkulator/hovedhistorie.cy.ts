describe('Hovedhistorie', () => {
  describe('Når jeg som bruker navigerer på nav.no/din pensjon og velger å prøve den nye kalkulatoren,', () => {
    it('ønsker jeg på landingssiden å få informasjon om hvilke personopplysninger som brukes i kalkulatoren slik at jeg kan ta et valg om jeg ønsker å logge inn.', () => {
      cy.visit('https://www.nav.no/planlegger-pensjon')
      cy.contains('a', 'Prøv pensjonskalkulatoren')
        .should('have.attr', 'href')
        .and(
          'include',
          'https://tjenester.nav.no/pselv/publisering/dinpensjon.jsf'
        )
    })
  })

  describe('Gitt at brukeren ikke er pålogget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/pensjon/kalkulator/oauth2/session', {
        statusCode: 401,
      }).as('getAuthSession')
      cy.visit('/pensjon/kalkulator/')
      cy.wait('@getDecoratorPersonAuth')
      cy.wait('@getDecoratorLoginAuth')
      cy.wait('@getAuthSession')
    })

    describe('Hvis jeg som bruker ikke er i målgruppen for ny kalkulator eller ikke bør bruke kalkulatoren,', () => {
      it('forventer jeg tilgang til detaljert kalkulator og uinnlogget kalkulator. ', () => {
        Cypress.on('uncaught:exception', (err) => {
          // prevents Cypress from failing when catching errors in uinnlogget kalkulator
          return false
        })
        cy.contains('button', 'Logg inn i enkel kalkulator').should('exist')
        cy.contains('button', 'Logg inn i detaljert kalkulator').click()

        cy.origin('https://idporten.difi.no', () => {
          cy.get('h1').contains('Velg elektronisk ID')
        })
        cy.visit('/pensjon/kalkulator/')
        cy.contains('button', 'Uinnlogget kalkulator').click()
        cy.origin('https://www.nav.no/pselv', () => {
          cy.get('h1').contains('Forenklet pensjonsberegning')
        })
      })
    })
    describe('Når jeg vil logge inn for å teste kalkulatoren,', () => {
      it('forventer jeg å kunne logge inn med ID-porten', () => {
        cy.contains('button', 'Logg inn i enkel kalkulator').click()
        cy.location('href').should(
          'eq',
          'http://localhost:4173/pensjon/kalkulator/oauth2/login?redirect=%2Fpensjon%2Fkalkulator%2Fstart'
        )
      })
    })
  })
  // describe('Gitt at brukeren er pålogget', () => {})
})

export {}
