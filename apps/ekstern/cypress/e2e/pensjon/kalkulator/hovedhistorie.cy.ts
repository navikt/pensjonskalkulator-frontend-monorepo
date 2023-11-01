describe('Hovedhistorie', () => {
  describe('Når jeg som bruker navigerer på nav.no/din pensjon og velger å prøve den nye kalkulatoren,', () => {
    it('ønsker jeg å få informasjon om ny kalkulator og om jeg er i målgruppen for å bruke den.', () => {
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
      it('ønsker jeg å få informasjon om ny kalkulator og om jeg er i målgruppen for å bruke den.', () => {
        cy.contains('a', 'Personopplysninger som brukes i enkel kalkulator')
          .should('have.attr', 'href')
          .and('include', '/pensjon/kalkulator/personopplysninger')
      })

      it('forventer jeg å kunne logge inn med ID-porten', () => {
        cy.contains('button', 'Logg inn i enkel kalkulator').click()
        cy.location('href').should(
          'eq',
          'http://localhost:4173/pensjon/kalkulator/oauth2/login?redirect=%2Fpensjon%2Fkalkulator%2Fstart'
        )
      })
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren, ', () => {
    beforeEach(() => {
      cy.visit('/pensjon/kalkulator/')
      cy.wait('@getDecoratorPersonAuth')
      cy.wait('@getDecoratorLoginAuth')
      cy.wait('@getAuthSession')
    })
    it('forventer jeg å kunne navigere til en startside som ønsker meg velkommen.', () => {
      cy.contains('button', 'Detaljert kalkulator').should('exist')
      cy.contains('button', 'Enkel kalkulator').click()
      cy.contains('Hei Aprikos!')
    })
    describe('Når jeg navigerer til /start, ', () => {
      beforeEach(() => {
        cy.visit('/pensjon/kalkulator/start')
      })
      it('ønsker jeg informasjon om hvilke personopplysninger som brukes i kalkulatoren.', () => {
        cy.contains('a', 'Personopplysninger som brukes i enkel kalkulator')
          .should('have.attr', 'href')
          .and('include', '/pensjon/kalkulator/personopplysninger')
      })
      it('ønsker jeg å kunne starte kalkulatoren eller avbryte beregningen.', () => {
        cy.contains('button', 'Kom i gang').click()
        cy.location('href').should(
          'include',
          '/pensjon/kalkulator/utenlandsopphold'
        )
        cy.go('back')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })
    describe('Når jeg navigerer til /utenlandsopphold, ', () => {
      beforeEach(() => {
        cy.visit('/pensjon/kalkulator/start')
        cy.wait('@getPerson')
        cy.contains('button', 'Kom i gang').click()
      })
      it('forventer jeg å bli spurt om jeg har bodd/jobbet mer enn 5 år utenfor Norge ', () => {
        cy.contains('h2', 'Utenlandsopphold').should('exist')
        cy.contains(
          'Har du bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år?'
        ).should('exist')
      })
      it('forventer å måtte svare ja/nei på spørsmål om tid utenfor Norge.', () => {
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Du må svare på om du har bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år.'
        ).should('exist')
      })
      it('ønsker jeg å kunne gå tilbake til forrige steg, eller avrbyte beregningen', () => {
        cy.contains('button', 'Tilbake').click()
        cy.location('href').should('include', '/pensjon/kalkulator/start')
        cy.go('back')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
      it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen', () => {
        cy.contains('button', 'Tilbake').click()
        cy.location('href').should('include', '/pensjon/kalkulator/start')
        cy.go('back')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })
  })
})

export {}
