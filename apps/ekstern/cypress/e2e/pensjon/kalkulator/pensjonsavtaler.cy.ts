describe('Pensjonsavtaler', () => {
  describe('Som bruker som har samtykket til innhenting av avtaler,', () => {
    beforeEach(() => {
      cy.login()
      cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
      cy.wait('@fetchTidligsteUttaksalder')
    })

    describe('Som bruker som har TPO forhold,', () => {
      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Du kan ha rett til offentlig tjenestepensjon. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler» om at det ikke er funnet private pensjonsavtaler.', () => {
            cy.contains('Pensjonsavtaler').should('exist')
            cy.contains('Vi fant ingen pensjonsavtaler.').should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon', () => {
        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg at pensjonsavtalene listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Du kan ha rett til offentlig tjenestepensjon. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon som svarer delvis', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
            },
            { fixture: 'pensjonsavtaler-delvis-svar.json' }
          ).as('fetchPensjonsavtaler')
        })

        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler, og at jeg kan ha rett til offentlig tjenestepensjon.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente alle dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at ikke alle avtaler er hentet.', () => {
            cy.contains(
              'Vi klarte ikke å hente alle dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg at pensjonsavtalene som er hentet listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon. NP svarer delvis, med 0 avtaler.', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
          })

          it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler, og at jeg kan ha rett til offentlig tjenestepensjon.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Når kall til Norsk pensjon feiler,', () => {
        beforeEach(() => {
          cy.intercept('POST', '/pensjon/kalkulator/api/v2/pensjonsavtaler', {
            statusCode: 503,
          }).as('fetchPensjonsavtaler')
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler, og at jeg kan ha rett til offentlig tjenestepensjon.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })
    })

    describe('Som bruker som ikke har TPO forhold,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v1/tpo-medlemskap',
          },
          {
            tpLeverandoerListe: [],
          }
        ).as('getTpoMedlemskap')
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler» om at det ikke er funnet private pensjonsavtaler.', () => {
            cy.contains('Pensjonsavtaler').should('exist')
            cy.contains('Vi fant ingen pensjonsavtaler.').should('exist')
          })

          it('forventer jeg ingen informasjon om «Offentlig tjenestepensjon».', () => {
            cy.contains('Offentlig tjenestepensjon').should('not.exist')
          })
        })
      })

      describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon,', () => {
        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg at pensjonsavtalene listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg ingen informasjon om «Offentlig tjenestepensjon».', () => {
            cy.contains('Offentlig tjenestepensjon').should('not.exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon som svarer delvis,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
            },
            { fixture: 'pensjonsavtaler-delvis-svar.json' }
          ).as('fetchPensjonsavtaler')
        })

        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente alle dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at ikke alle avtaler er hentet.', () => {
            cy.contains(
              'Vi klarte ikke å hente alle dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg at pensjonsavtalene som er hentet listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg ingen informasjon om «Offentlig tjenestepensjon».', () => {
            cy.contains('Offentlig tjenestepensjon').should('not.exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon. NP svarer delvis, med 0 avtaler.', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
          })

          it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg ingen informasjon om «Offentlig tjenestepensjon».', () => {
            cy.contains('Offentlig tjenestepensjon').should('not.exist')
          })
        })
      })

      describe('Når kall til Norsk pensjon feiler,', () => {
        beforeEach(() => {
          cy.intercept('POST', '/pensjon/kalkulator/api/v2/pensjonsavtaler', {
            statusCode: 503,
          }).as('fetchPensjonsavtaler')
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente mine private pensjonsavtaler.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg ingen informasjon om «Offentlig tjenestepensjon».', () => {
            cy.contains('Offentlig tjenestepensjon').should('not.exist')
          })
        })
      })
    })

    describe('Når kall til TPO feiler,', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          '/pensjon/kalkulator/api/v1/tpo-medlemskap',

          {
            statusCode: 503,
          }
        ).as('getTpoMedlemskap')
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt og at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler» om at det ikke er funnet private pensjonsavtaler.', () => {
            cy.contains('Pensjonsavtaler').should('exist')
            cy.contains('Vi fant ingen pensjonsavtaler.').should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon', () => {
        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt og at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor. Se hvorfor under pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg at pensjonsavtalene listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon som svarer delvis,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
            },
            { fixture: 'pensjonsavtaler-delvis-svar.json' }
          ).as('fetchPensjonsavtaler')
        })

        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente alle private pensjonsavtaler og ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente alle dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at ikke alle avtaler er hentet.', () => {
            cy.contains(
              'Vi klarte ikke å hente alle dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg at pensjonsavtalene som er hentet listes opp under «Pensjonsavtaler.', () => {
            cy.get('[data-testid="showmore-button"]').click()
            cy.contains('Andre avtaler').should('be.visible')
            cy.contains('Privat tjenestepensjon').should('be.visible')
            cy.contains('Individuelle ordninger').should('be.visible')
            cy.contains('Vis mindre').should('be.visible')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon. NP svarer delvis, med 0 avtaler.', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v2/pensjonsavtaler',
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
          })

          it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente mine private pensjonsavtaler og ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })

      describe('Når kall til Norsk pensjon feiler', () => {
        beforeEach(() => {
          cy.intercept('POST', '/pensjon/kalkulator/api/v2/pensjonsavtaler', {
            statusCode: 503,
          }).as('fetchPensjonsavtaler')
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
            cy.contains('Alderspensjon (NAV)').should('exist')
            cy.contains('Vis tabell av beregningen').click({ force: true })
            cy.get('.navds-table__toggle-expand-button')
              .first()
              .click({ force: true })
            cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
            cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
            cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
          })

          it('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt. Med informasjon om at NAV ikke har klart å hente mine private pensjonsavtaler og ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Denne beregningen viser kanskje ikke alt.').should(
              'exist'
            )
            cy.contains(
              'Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente dine private pensjonsavtaler.'
            ).should('exist')
          })

          it('forventer jeg informasjon i pensjonsavtaler om at NAV ikke klarte å hente mine private pensjonsavtaler.', () => {
            cy.contains(
              'Vi klarte ikke å hente dine private pensjonsavtaler. Prøv igjen senere.'
            ).should('exist')
          })

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at NAV ikke har klart å sjekke om jeg har avtaler i offentlig sektor.', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains(
              'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
            ).should('exist')
          })
        })
      })
    })

    describe('Som bruker som har en pensjonsavtale som begynner før valgt alder,', () => {
      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '70 år').click()
          cy.wait('@fetchPensjonsavtaler')
        })

        it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
          cy.contains('Alderspensjon (NAV)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'exist'
          )
          cy.contains('dt', 'Alderspensjon (NAV)').should('exist')
        })

        it('forventer jeg at pensjonsavtalene listes opp under «Pensjonsavtaler.', () => {
          cy.get('[data-testid="showmore-button"]').click()
          cy.contains('Andre avtaler').should('be.visible')
          cy.contains('Privat tjenestepensjon').should('be.visible')
          cy.contains('Individuelle ordninger').should('be.visible')
          cy.contains('Vis mindre').should('be.visible')
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
