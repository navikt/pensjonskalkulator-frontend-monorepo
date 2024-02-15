describe('AFP offentlig', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    describe('Når jeg navigerer videre fra /offentlig-tp til /afp og velger AFP-offentlig,', () => {
      beforeEach(() => {
        cy.login()
        cy.contains('button', 'Kom i gang').click()
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()
        cy.wait('@getTpoMedlemskap')
        cy.contains('button', 'Neste').click()
      })

      it('forventer jeg informasjon om at NAV ikke kan beregne AFP Offentlig. Og jeg kan gå videre.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains(
          'NAV kan ikke beregne AFP i offentlig sektor, men du kan likevel fortsette og beregne alderspensjon fra NAV.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })

      it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
        cy.contains('button', 'Tilbake').click()
        cy.location('href').should(
          'include',
          '/pensjon/kalkulator/offentlig-tp'
        )
        cy.go('back')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })

    describe('Gitt at jeg som bruker har valgt AFP offentlig,', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: true, afp: 'ja_offentlig' })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og får senere enn 62 år på tidligst mulig uttak,', () => {
        it('ønsker jeg tilleggsinformasjon om at rett til AFP gjør at tidligst mulig uttak er tidligere.', () => {
          cy.contains(
            'Din opptjening gjør at du tidligst kan ta ut 100 % alderspensjon når du er'
          ).should('exist')
          cy.contains('62 år og 10 måneder').should('exist')
          cy.contains(
            'Har du AFP i offentlig sektor, kan du trolig ta ut alderspensjon tidligere enn hvis du ikke har AFP.'
          ).should('exist')
        })
      })
      describe('Når jeg er kommet til beregningssiden og velger hvilken alder jeg ønsker beregning fra,', () => {
        it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP offentlig vises ikke.', () => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (Avtalefestet pensjon)').should('not.exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (NAV)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('61').should('exist')
          cy.contains('87+').should('exist')
          cy.contains('button', '70 år').click({ force: true })
          cy.contains('61').should('not.exist')
          cy.contains('69').should('exist')
          cy.contains('87+').should('exist')
        })

        it('forventer jeg å få informasjon i grunnlaget om at regelverk for AFP offentlig ikke er klart.', () => {
          cy.contains('button', '70').click()
          cy.contains('Øvrig grunnlag for beregningen').should('exist')
          cy.contains('AFP:').click()
          cy.contains('Offentlig').should('exist')
          cy.contains('Vi kan ikke vise din AFP').should('exist')
        })
      })
    })
  })
})

export {}
