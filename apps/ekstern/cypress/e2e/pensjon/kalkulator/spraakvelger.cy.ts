import { setAvailableLanguages } from '@navikt/nav-dekoratoren-moduler'

describe('Språkvelger', () => {
  it('setter Norsk Bokmål som default språk i løsningen for innhold styrt av react-intl og Sanity', () => {
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
    cy.contains('Hva som er opphold utenfor Norge')
  })
})

export {}
