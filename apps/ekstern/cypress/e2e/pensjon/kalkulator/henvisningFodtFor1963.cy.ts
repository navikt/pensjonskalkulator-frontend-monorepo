describe('Henvisning, født før 1963', () => {
  describe('Når jeg som bruker født før 1963 logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/person' },
        {
          fornavn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1960-04-30',
        }
      ).as('getPerson')
    })
    it('Forventer jeg å få informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
      cy.login()
      cy.wait('@getDecoratorPersonAuth')
      cy.wait('@getDecoratorLoginAuth')
      cy.wait('@getAuthSession')
      cy.contains('Kom i gang').should('not.exist')
      cy.contains('Du kan dessverre ikke bruke enkel kalkulator').should(
        'exist'
      )
      cy.contains('button', 'Detaljert kalkulator').click()
      cy.origin('https://idporten.difi.no', () => {
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
