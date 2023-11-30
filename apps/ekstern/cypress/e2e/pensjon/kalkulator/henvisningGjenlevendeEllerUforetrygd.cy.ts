describe('Henvisning, gjenlevendepensjon/uføretrygd', () => {
  describe('Når jeg som bruker som får gjenlevendepensjon eller uføretrygd logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/sak-status' },
        {
          harUfoeretrygdEllerGjenlevendeytelse: true,
        }
      ).as('getSakStatus')
    })
    it('Forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
      cy.login()
      cy.wait('@getDecoratorPersonAuth')
      cy.wait('@getDecoratorLoginAuth')
      cy.wait('@getAuthSession')
      cy.contains('Kom i gang').should('not.exist')
      cy.contains('Du kan dessverre ikke bruke enkel kalkulator').should(
        'exist'
      )
      cy.contains('button', 'Detaljert kalkulator').click()
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
