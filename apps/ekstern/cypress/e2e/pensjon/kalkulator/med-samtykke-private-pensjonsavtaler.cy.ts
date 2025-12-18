describe('Med samtykke - Private pensjonsavtaler', () => {
  describe('Som bruker som har samtykket til innhenting av avtaler,', () => {
    beforeEach(() => {
      cy.login()
      cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
      cy.wait('@fetchTidligsteUttaksalder')
      cy.intercept(
        {
          method: 'POST',
          url: '/pensjon/kalkulator/api/v2/simuler-oftp/fra-1963',
        },
        {
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
        }
      ).as('fetchOffentligTp')
    })

    describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v3/pensjonsavtaler',
          },
          {
            avtaler: [],
            utilgjengeligeSelskap: [],
          }
        ).as('fetchPensjonsavtaler')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchPensjonsavtaler')
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Private pensjonsavtaler» om at det ikke er funnet private pensjonsavtaler.', () => {
          cy.contains('Pensjonsavtaler').should('exist')
          cy.contains('Vi fant ingen pensjonsavtaler.').should('exist')
        })
      })
    })

    describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon,', () => {
      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchPensjonsavtaler')
          cy.contains('Vis mer').click({ force: true })
        })

        it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg at pensjonsavtalene listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', () => {
          cy.get('[data-testid="showmore-button"]').click()
          cy.contains('Andre avtaler').should('be.visible')
          cy.contains('Privat tjenestepensjon').should('be.visible')
          cy.contains('Individuelle ordninger').should('be.visible')
        })
      })
    })

    describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon som svarer delvis,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v3/pensjonsavtaler',
          },
          { fixture: 'pensjonsavtaler-delvis-svar.json' }
        ).as('fetchPensjonsavtaler')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchPensjonsavtaler')
          cy.contains('Vis mer').click({ force: true })
        })

        it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at ikke alle avtaler er hentet.', () => {
          cy.contains(
            'Vi klarte ikke å hente alle dine private pensjonsavtaler. Prøv igjen senere.'
          ).should('exist')
        })

        it('forventer jeg at pensjonsavtalene som er hentet listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', () => {
          cy.get('[data-testid="showmore-button"]').click()
          cy.contains('Andre avtaler').should('be.visible')
          cy.contains('Privat tjenestepensjon').should('be.visible')
          cy.contains('Individuelle ordninger').should('be.visible')
        })
      })
    })

    describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon som svarer delvis, med 0 avtaler,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v3/pensjonsavtaler',
          },
          {
            avtaler: [],
            utilgjengeligeSelskap: ['Something'],
          }
        ).as('fetchPensjonsavtaler')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchPensjonsavtaler')
          cy.contains('Vis mer').click({ force: true })
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at Nav ikke har klart å hente alle private pensjonsavtaler.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Beregningen viser kanskje ikke alt.').should('exist')
          cy.contains(
            'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor.'
          ).should('exist')
        })

        it('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at Nav ikke klarte å hente mine private pensjonsavtaler.', () => {
          cy.contains(
            'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
          ).should('exist')
        })
      })
    })

    describe('Når kall til Norsk pensjon feiler,', () => {
      beforeEach(() => {
        cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
          statusCode: 503,
        }).as('fetchPensjonsavtaler')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
          cy.wait('@fetchPensjonsavtaler')
          cy.contains('Vis mer').click({ force: true })
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at Nav ikke har klart å hente alle private pensjonsavtaler.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Beregningen viser kanskje ikke alt.').should('exist')
          cy.contains(
            'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor.'
          ).should('exist')
        })

        it('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at Nav ikke klarte å hente mine private pensjonsavtaler.', () => {
          cy.contains(
            'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
          ).should('exist')
        })
      })
    })

    describe('Som bruker som har en pensjonsavtale som begynner før valgt alder,', () => {
      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '70 år').click()
          cy.wait('@fetchPensjonsavtaler')
          cy.contains('Vis mer').click({ force: true })
        })

        it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg at pensjonsavtalene listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', () => {
          cy.get('[data-testid="showmore-button"]').click()
          cy.contains('Andre avtaler').should('be.visible')
          cy.contains('Privat tjenestepensjon').should('be.visible')
          cy.contains('Individuelle ordninger').should('be.visible')
        })

        it('forventer jeg informasjon om at jeg har pensjonsavtaler som starter før valgt alder. ', () => {
          cy.contains('Beregning').should('exist')
          cy.contains(
            'Du har pensjonsavtaler som starter før valgt alder. Se perioder under Pensjonsavtaler.'
          ).should('exist')
        })
      })
    })
  })
})

export {}
