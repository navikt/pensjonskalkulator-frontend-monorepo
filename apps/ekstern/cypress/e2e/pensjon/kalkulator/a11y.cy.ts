describe('Pensjonskalkulator', () => {
  it('rendrer stegsvisning og resultatsside a11y-feil', () => {
    cy.visit('/pensjon/kalkulator/start')
    cy.wait('@getDecoratorPersonAuth')
    cy.wait('@getDecoratorLoginAuth')
    cy.wait('@getAuthSession')

    // Sjekker Steg 1
    cy.contains('Hei Aprikos!')
    cy.injectAxe()
    cy.checkA11y()
    cy.contains('button', 'Kom i gang').click()

    // Sjekker Steg 1
    cy.contains('Utenlandsopphold')
    cy.checkA11y()
    cy.get('[type="radio"]').last().check()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 2
    cy.contains('Pensjonen din')
    cy.checkA11y()
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 3
    cy.contains(
      'Vi klarte ikke å sjekke om du har pensjonsavtaler fra offentlig sektor'
    )
    cy.checkA11y()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 4
    cy.contains('Avtalefestet pensjon')
    cy.contains('button', 'Om avtalefestet pensjon i privat sektor').click()
    cy.get('[type="radio"]').first().check()
    cy.checkA11y()
    cy.contains('button', 'Neste').click()

    // Sjekker Steg 5
    cy.contains('Din sivilstand')
    cy.checkA11y()
    cy.get('[type="radio"]').first().check()
    cy.contains('button', 'Beregn pensjon').click()

    // Sjekker Beregning
    cy.wait('@fetchTidligsteUttaksalder')
    cy.contains(
      'Din opptjening i folketrygden gjør at du tidligst kan ta ut alderspensjon når du er'
    )
    cy.contains('button', '63 år').click()
    cy.wait('@fetchAlderspensjon')
    cy.contains('button', 'Tidligst mulig uttak').click()
    cy.contains('button', 'Uttaksgrad').click()
    cy.contains('button', 'Inntekt').click()
    cy.contains('button', 'Sivilstand').click()
    cy.contains('button', 'Opphold i Norge').click()
    cy.contains('button', 'Alderspensjon').click()
    cy.contains('button', 'AFP').click()
    cy.contains('button', 'Pensjonsavtaler').click()
    cy.checkA11y()
  })

  it('rendrer henvisning stegene uten a11y-feil', () => {
    // Navigate til henvisning-1963
    cy.visit('/pensjon/kalkulator/henvisning-1963')
    cy.injectAxe()
    cy.checkA11y()

    // Navigate til henvisning-utland
    cy.visit('/pensjon/kalkulator/henvisning-utland')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('rendrer andre sider uten a11y-feil', () => {
    // Navigate til forbehold
    cy.visit('/pensjon/kalkulator/forbehold')
    cy.injectAxe()
    cy.checkA11y()

    // Navigate til personopplysninger
    cy.visit('/pensjon/kalkulator/personopplysninger')
    cy.injectAxe()
    cy.checkA11y()

    // Navigate til 404
    cy.visit('/pensjon/kalkulator/tulleside')
    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
