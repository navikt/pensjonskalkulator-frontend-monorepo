describe('Pensjonskalkulator', () => {
  it('rendrer stegsvisning', () => {
    cy.login()
    cy.injectAxe()

    // Sjekker Steg 1
    cy.contains('Hei Aprikos!')
    cy.checkA11y('main')
    cy.contains('button', 'Kom i gang').click()

    // Sjekker Steg 1
    cy.contains('Utenlandsopphold')
    cy.checkA11y('main')
    cy.get('[type="radio"]').last().check()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 2
    cy.contains('Pensjonsavtaler')
    cy.checkA11y('main')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 3
    cy.contains('Du kan ha rett til offentlig tjenestepensjon')
    cy.checkA11y('main')
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 4
    cy.contains('Avtalefestet pensjon')
    cy.contains('button', 'Om avtalefestet pensjon i privat sektor').click()
    cy.get('[type="radio"]').first().check()
    cy.checkA11y('main')
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 5
    cy.contains('Din sivilstand')
    cy.checkA11y('main')
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Beregn pensjon').click()
  })

  it('rendrer resultatsside a11y-feil', () => {
    cy.login()

    cy.contains('button', 'Kom i gang').click()

    cy.get('[type="radio"]').last().check()
    cy.contains('button', 'Neste').click()

    cy.get('[type="radio"]').last().check()
    cy.contains('button', 'Neste').click()

    cy.get('[type="radio"]').last().check()
    cy.contains('button', 'Neste').click()

    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Beregn pensjon').click()

    // Sjekker Beregning
    cy.wait('@fetchTidligsteUttaksalder')
    cy.contains(
      'Din opptjening gjør at du tidligst kan ta ut 100 % alderspensjon når du er'
    )
    cy.contains('button', '70 år').click()
    cy.injectAxe()
    cy.wait('@fetchAlderspensjon')
    cy.contains('button', 'Uttaksgrad').click({ force: true })
    cy.contains('button', 'Inntekt frem til uttak').click({ force: true })
    cy.contains('button', 'Sivilstand').click({ force: true })
    cy.contains('button', 'Opphold i Norge').click({ force: true })
    cy.contains('button', 'Alderspensjon').click({ force: true })
    cy.contains('button', 'AFP').click({ force: true })
    cy.checkA11y('main')
  })

  it('rendrer henvisning stegene uten a11y-feil', () => {
    // Navigate til henvisning-1963
    cy.visit('/pensjon/kalkulator/henvisning-1963')
    cy.injectAxe()
    cy.checkA11y('main')

    // Navigate til henvisning-utland
    cy.visit('/pensjon/kalkulator/henvisning-utland')
    cy.injectAxe()
    cy.checkA11y('main')
  })

  it('rendrer andre sider uten a11y-feil', () => {
    // Navigate til forbehold
    cy.visit('/pensjon/kalkulator/forbehold')
    cy.injectAxe()
    cy.checkA11y('main')

    // Navigate til personopplysninger
    cy.visit('/pensjon/kalkulator/personopplysninger')
    cy.injectAxe()
    cy.checkA11y('main')

    //  Navigate til 404
    cy.visit('/pensjon/kalkulator/tulleside')
    cy.injectAxe()
    cy.checkA11y('main')
  })
})

export {}
