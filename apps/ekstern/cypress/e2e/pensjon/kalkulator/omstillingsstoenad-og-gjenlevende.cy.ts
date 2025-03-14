describe('med omstillingsstønad og gjenlevende', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    describe('Som bruker som mottar omstillingsstønad eller gjenlevendepensjon,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
          },
          {
            harLoependeSak: true,
          }
        ).as('getOmstillingsstoenadOgGjenlevende')
        cy.login()
        cy.fillOutStegvisning({})
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('ønsker jeg informasjon om når jeg tidligst kan starte uttak av pensjon.', () => {
        cy.contains(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        )
      })

      it('forventer jeg å få informasjon om at alderspensjon ikke kan kombineres med omstillingsstønad eller gjenlevendepensjon.', () => {
        cy.contains(
          'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
        )
      })

      it('må jeg kunne trykke på Readmore for informasjon om tidspunktet for tidligst uttak.', () => {
        cy.get('[data-testid="om_TMU"]').should('exist')
      })
    })

    describe('Som bruker som mottar uføretrygd, og omstillingsstønad eller gjenlevendepensjon,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
          },
          {
            harLoependeSak: true,
          }
        ).as('getOmstillingsstoenadOgGjenlevende')
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          {
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak
        ).as('getLoependeVedtak')

        cy.login()
        cy.fillOutStegvisning({})
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains('Du har 75 % uføretrygd.')
      })

      it('forventer jeg å få informasjon om at alderspensjon ikke kan kombineres med omstillingsstønad eller gjenlevendepensjon.', () => {
        cy.contains(
          'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
        )
      })

      it('forventer jeg tilpasset informasjon i Readmore til gradert alderspensjon.', () => {
        cy.get('[data-testid="om_pensjonsalder_UT_gradert_enkel"]').should(
          'exist'
        )
      })
    })
  })
})

export {}
