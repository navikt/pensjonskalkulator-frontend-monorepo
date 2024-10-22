describe('Henvisning', () => {
  describe('Når jeg som bruker født før 1963 logger inn,', () => {
    it('forventer jeg å bli redirigert til detaljert kalkulator.', () => {
      Cypress.on('uncaught:exception', (err) => {
        // prevents Cypress from failing when catching errors in uinnlogget kalkulator
        return false
      })
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v2/person' },
        {
          navn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1960-04-30',
        }
      ).as('getPerson')

      cy.visit('/pensjon/kalkulator/')
      cy.wait('@getAuthSession')

      cy.origin('https://login.idporten.no', () => {
        Cypress.on('uncaught:exception', (err) => {
          // prevents Cypress from failing when catching errors in uinnlogget kalkulator
          return false
        })
        cy.contains('Kom i gang').should('not.exist')
        cy.get('h1').contains('Velg elektronisk ID')
      })
    })
  })

  describe('Når jeg som bruker som er medlem av apotekerne logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v2/ekskludert' },
        {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        }
      ).as('getEkskludertStatus')
    })
    it('forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
      cy.login()
      cy.wait('@getAuthSession')
      cy.contains('Kom i gang').should('not.exist')
      cy.contains('Du kan dessverre ikke bruke enkel kalkulator').should(
        'exist'
      )
      cy.contains('button', 'Detaljert pensjonskalkulator').click()
      cy.origin('https://login.idporten.no', () => {
        cy.get('h1').contains('Velg elektronisk ID')
      })
      cy.visit('/pensjon/kalkulator/start')
      cy.contains('button', 'Avbryt').click()
      cy.location('href').should(
        'eq',
        'http://localhost:4173/pensjon/kalkulator/login'
      )
    })
  })
})

export {}
