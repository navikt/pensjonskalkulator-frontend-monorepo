describe('AFP nei/vet ikke', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    describe('Når jeg navigerer videre fra /offentlig-tp til /afp og vet ikke om jeg har rett til AFP', () => {
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

      it('forventer jeg informasjon om at jeg bør sjekke med arbeidsgiver om jeg har rett til AFP.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(3).check()
        cy.contains(
          'Er du usikker på om du har rett til AFP, bør du sjekke med arbeidsgiveren din.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })
    })

    describe('Gitt at jeg som bruker har svart "nei" eller "vet ikke" på spørsmål om AFP,', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: true, afp: 'vet_ikke' })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og velger hvilken alder jeg ønsker beregning fra,', () => {
        it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', () => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (Avtalefestet pensjon)').should('not.exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (NAV)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('61').should('exist')
          cy.contains('87+').should('exist')

          cy.contains('Tilbake til start').click({ force: true })
          cy.fillOutStegvisning({ samtykke: true, afp: 'nei' })
          cy.contains('AFP (Avtalefestet pensjon)').should('not.exist')
        })

        it('forventer jeg å få informasjon i grunnlaget om at AFP kan påvirke min uttaksalder.', () => {
          cy.contains('button', '70').click()
          cy.contains('Grunnlaget for beregningen').should('exist')
          cy.contains('AFP:').click()
          cy.contains('Vet ikke').should('exist')
          cy.contains(
            'Hvis du er usikker på om du har rett til AFP bør du spørre din arbeidsgiver. AFP kan påvirke når du kan ta ut alderspensjon.'
          ).should('exist')

          cy.contains('Tilbake til start').click({ force: true })
          cy.fillOutStegvisning({ samtykke: true, afp: 'nei' })
          cy.contains('button', '70').click()
          cy.contains('AFP:').click()
          cy.contains('Nei').should('exist')
          cy.contains(
            'Hvis du starter i jobb hos en arbeidsgiver som har avtale om AFP, anbefaler vi at du gjør en ny beregning.'
          ).should('exist')
        })
      })
    })
  })
})

export {}
