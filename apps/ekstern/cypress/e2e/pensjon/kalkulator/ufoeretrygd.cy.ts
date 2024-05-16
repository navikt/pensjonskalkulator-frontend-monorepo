describe('Ufoeretrygd', () => {
  describe('Som bruker som har logget inn på kalkulatoren og som mottar uføretrygd,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.enable-ufoere',
        },
        {
          enabled: true,
        }
      ).as('getFeatureToggleUfoere')
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v1/ufoeregrad' },
        {
          ufoeregrad: 100,
        }
      ).as('getUfoeregrad')

      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.get('[type="radio"]').last().check()
      cy.contains('button', 'Neste').click()
      cy.get('[type="radio"]').first().check()
      cy.contains('button', 'Neste').click()
      cy.wait('@getTpoMedlemskap')
      cy.contains('button', 'Neste').click()
    })

    describe('Når jeg svarer "nei" på spørsmål om AFP,', () => {
      it('forventer jeg å kunne gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(2).check()
        cy.contains('button', 'Neste').click()

        cy.contains('Din sivilstand').should('exist')
      })
    })

    describe('Når jeg svarer "vet ikke" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(3).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og avtalefestet pensjon').should('exist')
        cy.contains(
          'Du kan ikke beregne AFP i kalkulatoren. Gå videre for å se alderspensjon fra NAV og pensjonsavtaler i privat sektor.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains('Din sivilstand').should('exist')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og avtalefestet pensjon').should('exist')
        cy.contains(
          'Du kan ikke beregne AFP i kalkulatoren. Gå videre for å se alderspensjon fra NAV og pensjonsavtaler i privat sektor.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains('Din sivilstand').should('exist')
      })
    })

    describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og avtalefestet pensjon').should('exist')
        cy.contains(
          'Du kan ikke beregne AFP i kalkulatoren. Gå videre for å se alderspensjon fra NAV og pensjonsavtaler i privat sektor.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
        cy.contains('Din sivilstand').should('exist')
      })
    })
  })

  describe.skip('Som bruker som har logget inn på kalkulatoren, som mottar uføretrygd og som ikke har rett til AFP', () => {
    describe('Når jeg er kommet til beregningssiden', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/feature/pensjonskalkulator.enable-ufoere',
          },
          {
            enabled: true,
          }
        ).as('getFeatureToggleUfoere')
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v1/ufoeregrad' },
          {
            ufoeregrad: 100,
          }
        ).as('getUfoeregrad')

        cy.login()
        cy.contains('button', 'Kom i gang').click()
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').first().check()
        cy.contains('button', 'Neste').click()
        cy.wait('@getTpoMedlemskap')
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(2).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()

        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
      })
    })
  })
})

export {}
