describe('Henvisning', () => {
  describe('Når jeg som bruker født før 1963 logger inn,', () => {
    it('Forventer jeg å bli redirigert til detaljert kalkulator.', () => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v1/person' },
        {
          fornavn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1960-04-30',
        }
      ).as('getPerson')

      cy.visit('/pensjon/kalkulator/')
      cy.wait('@getAuthSession')

      cy.origin('https://login.idporten.no', () => {
        cy.contains('Kom i gang').should('not.exist')
        cy.get('h1').contains('Velg elektronisk ID')
      })
    })
  })

  describe('Når jeg som bruker som får uføretrygd logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v1/ekskludert' },
        {
          ekskludert: true,
          aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
        }
      ).as('getEkskludertStatus')
    })
    it('Forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
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

  describe('Når jeg som bruker som får gjenlevendepensjon logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v1/ekskludert' },
        {
          ekskludert: true,
          aarsak: 'HAR_GJENLEVENDEYTELSE',
        }
      ).as('getEkskludertStatus')
    })
    it('Forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
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

  describe('Når jeg som bruker som er medlem av apotekerne logger inn,', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v1/ekskludert' },
        {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        }
      ).as('getEkskludertStatus')
    })
    it('Forventer jeg informasjon om at jeg ikke kan bruke enkel kalkulator. Jeg ønsker å kunne gå til detaljert kalkulator eller avbryte.', () => {
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
      cy.contains('button', 'Detaljert pensjonskalkulator').click()
      cy.origin('https://login.idporten.no', () => {
        cy.get('h1').contains('Velg elektronisk ID')
      })
    })
  })
})

export {}
