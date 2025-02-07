import { setAvailableLanguages } from '@navikt/nav-dekoratoren-moduler'

describe('Språkvelger', () => {
  it('setter Norsk Bokmål som default språk i løsningen for innhold styrt av react-intl og Sanity, og henter innhold på nytt når man bytter språk', () => {
    cy.login()
    setAvailableLanguages([
      {
        locale: 'nb',
        handleInApp: true,
      },
      {
        locale: 'nn',
        handleInApp: true,
      },
      {
        locale: 'en',
        handleInApp: true,
      },
    ])

    // Går videre fra Start steget
    cy.contains('button', 'Kom i gang').click()

    // Går videre fra Sivilstand steg
    cy.contains('Sivilstand')
    cy.contains('button', 'Neste').click()

    // Sjekker default språk på utenlandsopphold steg
    cy.contains('Opphold utenfor Norge')
    cy.contains('Hva som er opphold utenfor Norge (Sanity)')

    cy.contains('button', 'Språk/Language').click()
    cy.contains('button', 'English').click()

    // Sjekker engelsk språk på utenlandsopphold steg for react-intl innhold
    cy.contains('Time abroad')
    // Sjekker engelsk språk på utenlandsopphold steg for Sanity innhold
    cy.contains('What Accounts as Time Spent Outside Norway')
  })
})

export {}
