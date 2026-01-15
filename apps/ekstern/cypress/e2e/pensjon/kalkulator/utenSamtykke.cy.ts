describe('Uten samtykke', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    describe('Gitt at jeg ikke samtykker til innhenting av avtaler,', () => {
      describe('Når jeg er kommet til beregningssiden og velger hvilken alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.login()
          cy.fillOutStegvisning({ afp: 'ja_privat' })
          cy.wait('@fetchTidligsteUttaksalder')
        })

        it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, alderspensjon) fra uttaksalderen jeg har valgt. Jeg forventer at resultatet ikke viser tjenestepensjon og pensjonsavtaler siden jeg ikke har gitt samtykke til innhenting av opplysninger fra Norsk pensjon og offentlige tjenestepensjonsordninger.', () => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchAlderspensjon')
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('61').should('exist')
          cy.contains('77+').should('exist')
          cy.contains('button', '70 år').click({ force: true })
          cy.wait('@fetchAlderspensjon')
          cy.contains('69').should('exist')
          cy.contains('77+').should('exist')

          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.contains('Lukk tabell av beregningen').should('exist')
          cy.contains('Alder').should('exist')
          cy.contains('Sum (kr)').should('exist')
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('0').should('exist')
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg å få informasjon om inntekten og pensjonen min for beregningen. Jeg må kunne trykke på de ulike faktorene for å få opp mer informasjon.', () => {
          cy.contains('button', '70').click()
          cy.contains('Om inntekten og pensjonen din').should('exist')
          cy.contains('Årlig inntekt frem til uttak:').should('exist')
          cy.contains('AFP:').should('exist')
          cy.contains('Sivilstand:').click({ force: true })
          cy.contains('Opphold utenfor Norge:').click({ force: true })
        })

        it('forventer informasjon om at pensjonsavtaler ikke er hentet. Jeg må kunne trykke på  "start en ny beregning" hvis jeg ønsker ny beregning med samtykke til pensjonsavtaler.', () => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.contains('Pensjonsavtaler').should('exist')
          cy.contains(
            'Du har ikke samtykket til å hente inn pensjonsavtaler.'
          ).should('exist')

          cy.contains('button', 'Tilbake til start').click({ force: true })
          cy.contains('button', 'Gå tilbake til start').click({ force: true })
          cy.location('href').should('include', '/pensjon/kalkulator/start')
        })
      })
    })
  })
})

export {}
