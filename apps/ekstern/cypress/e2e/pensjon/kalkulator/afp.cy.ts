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
        cy.get('[data-testid="samtykke-offentlig-afp-title"]').should(
          'not.exist'
        )
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
        cy.contains('AFP (avtalefestet pensjon)').should('exist')
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
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('AFP: Vet ikke').should('exist')
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
        cy.get('[data-testid="samtykke-offentlig-afp-title"]').should(
          'not.exist'
        )
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
        cy.contains('AFP').should('exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('exist')
        cy.contains('61').should('exist')
        cy.contains('87+').should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at jeg ikke har rett til AFP og kan endre valgene mine for AFP', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()

        cy.contains('button', '70').click()
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('AFP: Nei').should('exist')
        cy.contains(
          'Du har svart at du ikke har rett til AFP. Derfor vises ikke AFP i beregningen. Du kan endre valgene dine for AFP ved å gå tilbake til AFP (avtalefestet pensjon).'
        ).should('exist')
        cy.contains('a', 'AFP (avtalefestet pensjon)').click()
        cy.location('href').should('include', '/pensjon/kalkulator/afp')
      })
    })

    describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(1).check()
      })

      it('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[data-testid="samtykke-offentlig-afp-title"]').should(
          'not.exist'
        )
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
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('AFP: Privat').should('exist')
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
        cy.get('[data-testid="samtykke-offentlig-afp-title"]').should('exist')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt.', () => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v9/alderspensjon/simulering',
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
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('AFP: Offentlig').should('exist')
        cy.get('[data-intl="grunnlag.afp.ingress.ja_offentlig"]').should(
          'exist'
        )
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP men samtykker ikke til beregning av AFP-offentlig', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').eq(0).check()
      })

      it('forventer jeg å bli spurt om samtykke før jeg kan gå videre til neste steg', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[data-testid="samtykke-offentlig-afp-title"]').should('exist')
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
        cy.contains('AFP').should('exist')
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
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('AFP: Offentlig').should('exist')
        cy.contains(
          'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den. Derfor vises ikke AFP i beregningen.'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født 1963 eller senere, og kall til /er-apoteker feiler', () => {
      beforeEach(() => {
        cy.setupPersonFoedtEtter1963()
        cy.setupApotekerError()

        cy.login()

        cy.setApotekerErrorState()

        cy.contains('button', 'Kom i gang').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click()

        // "Ja, offentlig"
        cy.get('[type="radio"]').eq(0).check()
      })

      it('forventer jeg apoteker-warning på AFP-steget', () => {
        cy.get('[data-testid="apotekere-warning"]').should('exist')
      })

      it('forventer jeg apoteker-warning på samtykke AFP offentlig steget', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[data-testid="apotekere-warning"]').should('exist')
      })

      it('forventer jeg apoteker-warning på pensjonsavtaler steget', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check() // Samtykke til AFP beregning
        cy.contains('button', 'Neste').click()
        cy.get('[data-testid="apotekere-warning"]').should('exist')
      })

      it('forventer jeg informasjon om at beregning med AFP kan bli feil hvis jeg er medlem av Pensjonsordningen for apotekvirksomhet og at jeg må prøve igjen senere', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check() // Samtykke til AFP beregning
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check() // Pensjonsavtaler
        cy.contains('button', 'Neste').click()
        cy.contains('button', '70').click()

        cy.location('pathname').should('include', '/beregning')

        cy.get('[data-testid="apotekere-warning"]').should('exist')
      })

      it('forventer jeg ingen informasjon om AFP på beregningssiden', () => {
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check() // Samtykke til AFP beregning
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check() // Pensjonsavtaler
        cy.contains('button', 'Neste').click()
        cy.contains('button', '70').click()

        cy.location('pathname').should('include', '/beregning')

        // Sjekk at AFP-delen er skjult når apoteker error oppstår
        cy.get('[data-testid="grunnlag-afp"]').should('not.exist')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født før 1963, og velger "AFP etterfulgt av alderspensjon fra 67 år"', () => {
      beforeEach(() => {
        cy.setupPersonFoedtFoer1963()

        cy.login()
        cy.contains('button', 'Kom i gang').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click()

        // "ja, offentlig"
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()

        // "AFP etterfulgt av alderspensjon fra 67 år"
        cy.get(
          '[type="radio"][value="AFP_ETTERFULGT_AV_ALDERSPENSJON"]'
        ).check()
        cy.contains('button', 'Neste').click()

        // Pensjonsavtaler
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()
      })

      it('forventer jeg å kunne gå videre til avansert skjema uten noe samtykke AFP infosteg imellom', () => {
        cy.location('pathname').should('include', '/beregning-detaljert')

        // Verifiserer at vi er på avansert skjema for brukere med kap.19 AFP
        cy.get(
          '[data-intl="beregning.avansert.rediger.afp_etterfulgt_av_ap.title"]'
        ).should('exist')
      })

      it('forventer jeg å få informasjon i grunnlaget om at Nav ikke har vurdert om jeg fyller alle vilkår for AFP', () => {
        cy.location('pathname').should('include', '/beregning-detaljert')

        // Velger år og måned
        cy.get('[data-testid="agepicker-helt-uttaksalder"] select[name*="aar"]')
          .should('exist')
          .select('64')

        cy.get(
          '[data-testid="agepicker-helt-uttaksalder"] select[name*="maaned"]'
        )
          .should('exist')
          .select('0')

        // "ja" til AFP inntekt måneden før uttak spørsmål
        cy.get('[data-testid="afp-inntekt-maaned-foer-uttak-radio-ja"]')
          .should('exist')
          .check()

        // "nei" til inntekt ved siden av AFP
        cy.get('[data-testid="inntekt-vsa-afp-radio-nei"]')
          .should('exist')
          .check()

        cy.get('[data-testid="beregn-pensjon"]').click()
        cy.contains('AFP: Offentlig').should('exist')

        cy.get('[data-intl="grunnlag.afp.ingress.ja_offentlig"]').should(
          'exist'
        )
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født før 1963, og velger "Kun alderspensjon"', () => {
      beforeEach(() => {
        cy.setupPersonFoedtFoer1963()

        cy.login()
        cy.contains('button', 'Kom i gang').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click()

        // "ja, offentlig"
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()

        // "AFP etterfulgt av alderspensjon fra 67 år"
        cy.get('[type="radio"][value="KUN_ALDERSPENSJON"]').check()
        cy.contains('button', 'Neste').click()

        // Pensjonsavtaler
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()
      })

      it('forventer jeg å kunne gå videre til enkel beregning uten noe infosteg imellom', () => {
        cy.location('pathname').should('include', '/beregning')
      })

      it('forventer jeg å få informasjon i grunnlaget om at jeg har svart at jeg ikke har rett til AFP og at AFP derfor ikke vises i beregningen', () => {
        cy.location('pathname').should('include', '/beregning')

        cy.contains('button', '70').click()

        cy.contains('AFP: Nei').should('exist')
        cy.contains('a', 'AFP (avtalefestet pensjon)').should('exist')
      })
    })
  })
})

export {}
