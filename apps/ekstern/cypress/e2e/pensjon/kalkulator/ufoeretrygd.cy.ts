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

  describe('Som bruker som har logget inn på kalkulatoren, som mottar uføretrygd og som ikke har rett til AFP', () => {
    describe('Når jeg har 100 % uføretrygd og er kommet til beregningssiden', () => {
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
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Beregn pensjon').click()
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains('Du har 100 % uføretrygd.').should('exist')
      })

      it('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd»', () => {
        cy.contains('Om pensjonsalder og uføretrygd').click()
        cy.contains(
          '100 % uføretrygd kan ikke kombineres med alderspensjon. Det er derfor ikke mulig å beregne alderspensjon før 67 år i kalkulatoren. Ved 67 år går 100 % uføretrygd automatisk over til 100 % alderspensjon.'
        ).should('exist')
      })

      it('forventer jeg å kunne velge alder fra 67 år til 75 år.', () => {
        cy.contains('Når vil du ta ut alderspensjon?').should('exist')
        const agesInRange = [67, 68, 69, 70, 71, 72, 73, 74, 75]
        agesInRange.forEach((age) => {
          cy.contains('button', `${age} år`).should('exist')
        })
        cy.contains('button', `66 år`).should('not.exist')
        cy.contains('button', `76 år`).should('not.exist')
      })
    })

    describe('Når jeg har gradert uføretrygd og er kommet til beregningssiden', () => {
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
            ufoeregrad: 75,
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
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Beregn pensjon').click()
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains(
          'Du har 75 % uføretrygd. Her kan du beregne 100 % alderspensjon fra 67 år.'
        ).should('exist')
      })

      it('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd»', () => {
        cy.contains('Om pensjonsalder og uføretrygd').click()
        cy.contains(
          'Det er mulig å kombinere gradert uføretrygd og gradert alderspensjon fra 62 år, så lenge du har høy nok opptjening til å ta ut alderspensjon. Graden av uføretrygd og alderspensjon kan ikke overstige 100 %.'
        ).should('exist')
      })

      it('forventer jeg å kunne velge alder fra 67 år til 75 år.', () => {
        cy.contains('Når vil du ta ut alderspensjon?').should('exist')
        const agesInRange = [67, 68, 69, 70, 71, 72, 73, 74, 75]
        agesInRange.forEach((age) => {
          cy.contains('button', `${age} år`).should('exist')
        })
        cy.contains('button', `66 år`).should('not.exist')
        cy.contains('button', `76 år`).should('not.exist')
      })
    })
  })
})

export {}
