describe('AFP', () => {
  describe('Som bruker som har logget inn på kalkulatoren og som har samtykket til innhenting av avtaler,', () => {
    beforeEach(() => {
      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.contains('button', 'Neste').click()
      cy.get('[type="radio"]').last().check()
      cy.contains('button', 'Neste').click()
    })

    describe('Når jeg svarer "vet ikke" på spørsmål om AFP,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(3).check()
      })

      it('forventer jeg informasjon om at jeg bør sjekke med arbeidsgiver om jeg har rett til AFP.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains(
          'Er du usikker, bør du sjekke med arbeidsgiveren din.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })

      it('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', () => {
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
        ).should('not.exist')
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should(
          'not.exist'
        )
        cy.contains('Pensjonsavtaler').should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at AFP kan påvirke min uttaksalder.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Øvrig grunnlag for beregningen').should('exist')
        cy.contains('AFP:').click()
        cy.contains('Vet ikke').should('exist')
        cy.contains(
          'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din. AFP kan påvirke når du kan ta ut alderspensjon.'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "nei" på spørsmål om AFP,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(2).check()
      })

      it('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
        ).should('not.exist')
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should(
          'not.exist'
        )
        cy.contains('Pensjonsavtaler').should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at jeg bør gjøre ny beregning hvis jeg starter i jobb hos arbeidsgiver med AFP.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Øvrig grunnlag for beregningen').should('exist')
        cy.contains('AFP:').click()
        cy.contains('Nei').should('exist')
        cy.contains(
          'Hvis du starter i jobb hos en arbeidsgiver som har avtale om AFP, anbefaler vi at du gjør en ny beregning.'
        ).should('exist')
        cy.contains('a', 'ny beregning').click()
        cy.location('href').should('include', '/pensjon/kalkulator/start')
      })
    })

    describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(1).check()
      })

      it('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
        ).should('not.exist')
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should(
          'not.exist'
        )
        cy.contains('Pensjonsavtaler').should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at vilkårene for AFP ikke vurderes av Nav, men av Fellesordningen.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Øvrig grunnlag for beregningen').should('exist')
        cy.contains('AFP:').click()
        cy.contains('Privat').should('exist')
        cy.contains(
          'Du har oppgitt AFP i privat sektor. Nav har ikke vurdert om du fyller vilkårene for AFP, men forutsetter at du gjør det.'
        ).should('exist')
        cy.contains('a', 'Fellesordningen for AFP')
          .should('have.attr', 'href')
          .and('include', 'https://www.afp.no')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP og samtykker til beregning av AFP-offentlig,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(0).check()
      })

      it('forventer jeg å bli spurt om samtykke før jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
        ).should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt.', () => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_med_afp_offentlig.json' }
        ).as('fetchAlderspensjon')

        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at vilkårene for AFP ikke vurderes av Nav, og at det må sjekkes hos tjenestepensjonsordningen min.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Øvrig grunnlag for beregningen').should('exist')
        cy.contains('AFP:').click()
        cy.contains('Offentlig').should('exist')
        cy.contains(
          'Du har oppgitt AFP i offentlig sektor. Nav har ikke vurdert om du fyller vilkårene for AFP, men forutsetter at du gjør det. For mer informasjon om vilkårene, sjekk tjenestepensjonsordningen din.'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP men samtykker ikke til beregning av AFP-offentlig', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(0).check()
      })

      it('forventer jeg å bli spurt om samtykke før jeg kan gå videre til neste steg', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
        ).should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at beregningen min ikke inkluderer AFP-offentlig pga. at jeg ikke samtykket til det.', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Øvrig grunnlag for beregningen').should('exist')
        cy.contains('AFP:').click()
        cy.contains('Offentlig').should('exist')
        cy.contains(
          'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den. Derfor vises ikke AFP i beregningen.'
        ).should('exist')
      })
    })
  })
})

export {}
