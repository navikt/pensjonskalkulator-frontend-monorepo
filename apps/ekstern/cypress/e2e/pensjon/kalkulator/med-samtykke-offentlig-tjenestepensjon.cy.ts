describe('Med samtykke - Offentlig tjenestepensjon', () => {
  describe('Som bruker som har samtykket til innhenting av avtaler,', () => {
    beforeEach(() => {
      cy.login()
    })

    describe('Som bruker som har TPO forhold hos SPK,', () => {
      describe('Som bruker som har svart "ja" på Livsvarig AFP offentlig,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'POST',
              url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
            },
            { fixture: 'alderspensjon_med_afp_offentlig.json' }
          ).as('fetchAlderspensjon')
          cy.fillOutStegvisning({ afp: 'ja_offentlig', samtykke: true })
          cy.wait('@fetchTidligsteUttaksalder')
        })

        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', () => {
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

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains('Alderspensjon fra Statens pensjonskasse (SPK)').should(
              'exist'
            )
            cy.contains('Fra 67 år til 69 år').should('exist')
            cy.contains('Fra 70 år til 74 år').should('exist')
            cy.contains('Livsvarig fra 75 år').should('exist')
          })

          it('forventer jeg informasjon om at Livsvarig AFP ikke er inkludert. ', () => {
            cy.contains(
              'Livsvarig AFP er ikke inkludert i dette beløpet.'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som har svart "ja" på AFP privat,', () => {
        beforeEach(() => {
          cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
          cy.wait('@fetchTidligsteUttaksalder')
        })

        describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '62 år og 10 md.').click()
            cy.wait('@fetchPensjonsavtaler')
          })

          it('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', () => {
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

          it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
            cy.contains('Offentlig tjenestepensjon').should('exist')
            cy.contains('Alderspensjon fra Statens pensjonskasse (SPK)').should(
              'exist'
            )
            cy.contains('Fra 67 år til 69 år').should('exist')
            cy.contains('Fra 70 år til 74 år').should('exist')
            cy.contains('Livsvarig fra 75 år').should('exist')
          })

          it('forventer jeg informasjon om at Livsvarig AFP ikke er inkludert. ', () => {
            cy.contains(
              'Livsvarig AFP er ikke inkludert i dette beløpet.'
            ).should('exist')
          })
        })
      })

      describe('Som bruker som har svart "nei" på AFP privat,', () => {
        beforeEach(() => {
          cy.fillOutStegvisning({ afp: 'nei', samtykke: true })
          cy.wait('@fetchTidligsteUttaksalder')
        })

        describe('Som bruker som har rett til Betinget tjenestepensjon,', () => {
          describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.contains('button', '62 år og 10 md.').click()
              cy.wait('@fetchPensjonsavtaler')
            })

            it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
              cy.contains('Pensjonsgivende inntekt').should('exist')
              cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('Alderspensjon (Nav)').should('exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
              cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
            })

            it('forventer jeg at AFP ikke vises i graf og tabell.', () => {
              cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'AFP (avtalefestet pensjon)').should(
                'not.exist'
              )
            })

            it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
              cy.contains('Offentlig tjenestepensjon').should('exist')
              cy.contains(
                'Alderspensjon fra Statens pensjonskasse (SPK)'
              ).should('exist')
              cy.contains('Fra 67 år til 69 år').should('exist')
              cy.contains('Fra 70 år til 74 år').should('exist')
              cy.contains('Livsvarig fra 75 år').should('exist')
            })

            it('forventer jeg informasjon om at Betinget tjenestepensjon er inkludert. ', () => {
              cy.contains(
                'Du har oppgitt at du ikke har rett til livsvarig AFP. Betinget tjenestepensjon er derfor inkludert i beløpet.'
              ).should('exist')
            })
          })
        })

        describe('Som bruker som ikke har rett til Betinget tjenestepensjon,', () => {
          beforeEach(() => {
            cy.intercept(
              {
                method: 'POST',
                url: '/pensjon/kalkulator/api/v2/simuler-oftp',
              },
              {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: [
                  'Statens pensjonskasse',
                  'Kommunal Landspensjonskasse',
                  'Oslo Pensjonsforsikring',
                ],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'Statens pensjonskasse',
                  tpNummer: '3010',
                  simuleringsresultat: {
                    utbetalingsperioder: [
                      {
                        startAlder: { aar: 67, maaneder: 0 },
                        sluttAlder: { aar: 69, maaneder: 11 },
                        aarligUtbetaling: 64340,
                      },
                      {
                        startAlder: { aar: 70, maaneder: 0 },
                        sluttAlder: { aar: 74, maaneder: 11 },
                        aarligUtbetaling: 53670,
                      },
                      {
                        startAlder: { aar: 75, maaneder: 0 },
                        aarligUtbetaling: 48900,
                      },
                    ],
                    betingetTjenestepensjonErInkludert: false,
                  },
                },
              } satisfies OffentligTp
            ).as('fetchOffentligTp')
          })

          describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.contains('button', '62 år og 10 md.').click()
              cy.wait('@fetchPensjonsavtaler')
            })

            it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
              cy.contains('Pensjonsgivende inntekt').should('exist')
              cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('Alderspensjon (Nav)').should('exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
              cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
            })

            it('forventer jeg at AFP ikke vises i graf og tabell.', () => {
              cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'AFP (avtalefestet pensjon)').should(
                'not.exist'
              )
            })

            it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
              cy.contains('Offentlig tjenestepensjon').should('exist')
              cy.contains(
                'Alderspensjon fra Statens pensjonskasse (SPK)'
              ).should('exist')
              cy.contains('Fra 67 år til 69 år').should('exist')
              cy.contains('Fra 70 år til 74 år').should('exist')
              cy.contains('Livsvarig fra 75 år').should('exist')
            })

            it('forventer jeg informasjon om at jeg ikke har rett til livsvarig AFP. ', () => {
              cy.contains(
                'Du har oppgitt at du ikke har rett til livsvarig AFP.'
              ).should('exist')
            })
          })
        })
      })

      describe('Som bruker som har svart "vet_ikke" på AFP privat,', () => {
        beforeEach(() => {
          cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
          cy.wait('@fetchTidligsteUttaksalder')
        })

        describe('Som bruker som har rett til Betinget tjenestepensjon,', () => {
          describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.contains('button', '62 år og 10 md.').click()
              cy.wait('@fetchPensjonsavtaler')
            })

            it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
              cy.contains('Pensjonsgivende inntekt').should('exist')
              cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('Alderspensjon (Nav)').should('exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
              cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
            })

            it('forventer jeg at AFP ikke vises i graf og tabell.', () => {
              cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'AFP (avtalefestet pensjon)').should(
                'not.exist'
              )
            })

            it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
              cy.contains('Offentlig tjenestepensjon').should('exist')
              cy.contains(
                'Alderspensjon fra Statens pensjonskasse (SPK)'
              ).should('exist')
              cy.contains('Fra 67 år til 69 år').should('exist')
              cy.contains('Fra 70 år til 74 år').should('exist')
              cy.contains('Livsvarig fra 75 år').should('exist')
            })

            it('forventer jeg informasjon om at Betinget tjenestepensjon kan være inkludert. ', () => {
              cy.contains(
                'Du har oppgitt at du ikke vet om du har rett til livsvarig AFP. Beløpet kan derfor inkludere betinget tjenestepensjon'
              ).should('exist')
            })
          })
        })

        describe('Som bruker som ikke har rett til Betinget tjenestepensjon,', () => {
          beforeEach(() => {
            cy.intercept(
              {
                method: 'POST',
                url: '/pensjon/kalkulator/api/v2/simuler-oftp',
              },
              {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: [
                  'Statens pensjonskasse',
                  'Kommunal Landspensjonskasse',
                  'Oslo Pensjonsforsikring',
                ],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'Statens pensjonskasse',
                  tpNummer: '3010',
                  simuleringsresultat: {
                    utbetalingsperioder: [
                      {
                        startAlder: { aar: 67, maaneder: 0 },
                        sluttAlder: { aar: 69, maaneder: 11 },
                        aarligUtbetaling: 64340,
                      },
                      {
                        startAlder: { aar: 70, maaneder: 0 },
                        sluttAlder: { aar: 74, maaneder: 11 },
                        aarligUtbetaling: 53670,
                      },
                      {
                        startAlder: { aar: 75, maaneder: 0 },
                        aarligUtbetaling: 48900,
                      },
                    ],
                    betingetTjenestepensjonErInkludert: false,
                  },
                },
              } satisfies OffentligTp
            ).as('fetchOffentligTp')
          })

          describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.contains('button', '62 år og 10 md.').click()
              cy.wait('@fetchPensjonsavtaler')
            })

            it('forventer jeg at pensjonsavtaler vises i graf og tabell.', () => {
              cy.contains('Pensjonsgivende inntekt').should('exist')
              cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('Alderspensjon (Nav)').should('exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
              cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'exist'
              )
              cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
            })

            it('forventer jeg at AFP ikke vises i graf og tabell.', () => {
              cy.contains('AFP (avtalefestet pensjon)').should('not.exist')
              cy.contains('Vis tabell av beregningen').click({ force: true })
              cy.get('.navds-table__toggle-expand-button')
                .first()
                .click({ force: true })
              cy.contains('dt', 'AFP (avtalefestet pensjon)').should(
                'not.exist'
              )
            })

            it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse. ', () => {
              cy.contains('Offentlig tjenestepensjon').should('exist')
              cy.contains(
                'Alderspensjon fra Statens pensjonskasse (SPK)'
              ).should('exist')
              cy.contains('Fra 67 år til 69 år').should('exist')
              cy.contains('Fra 70 år til 74 år').should('exist')
              cy.contains('Livsvarig fra 75 år').should('exist')
            })

            it('forventer jeg informasjon om at jeg ikke har rett til livsvarig AFP. ', () => {
              cy.contains(
                'Du har oppgitt at du ikke vet om du har rett til livsvarig AFP. Beløpet kan derfor inkludere betinget tjenestepensjon.'
              ).should('exist')
            })
          })
        })
      })
    })

    describe('Som bruker som har TPO forhold hos annen ordning enn SPK', () => {
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
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp',
          },

          {
            simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
            muligeTpLeverandoerListe: ['Kommunal Landspensjonskasse'],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en informasjonsmelding om at beregningen kanskje ikke viser alt. ', () => {
          cy.contains(
            'Beregningen viser kanskje ikke alt. Du kan ha rett til offentlig tjenestepensjon'
          ).should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', () => {
          cy.contains('Offentlig tjenestepensjon').should('exist')
          cy.contains(
            'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Kommunal Landspensjonskasse).'
          ).should('exist')
        })
      })
    })

    describe('Som bruker som ikke har noe TPO forhold', () => {
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
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp',
          },
          {
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
            muligeTpLeverandoerListe: [],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at ingen pensjonsavtale ble funnet.', () => {
          cy.contains('Offentlig tjenestepensjon').should('exist')
          cy.contains('Vi fant ingen pensjonsavtaler.').should('exist')
        })
      })
    })

    describe('Når kall til TP-registret feiler', () => {
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
        cy.intercept('POST', '/pensjon/kalkulator/api/v2/simuler-oftp', {
          statusCode: 503,
        }).as('fetchOffentligTp')

        cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', () => {
          cy.contains(
            'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.'
          ).should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke klarte å hente min offentlige tjenestepensjon.', () => {
          cy.contains('Offentlig tjenestepensjon').should('exist')
          cy.contains(
            'Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler. Har du vært eller er ansatt i offentlig sektor, kan du sjekke tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (f.eks. Statens Pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
          ).should('exist')
        })
      })
    })

    describe('Som bruker som har TPO forhold hos SPK som svarer med teknisk feil', () => {
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
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp',
          },
          {
            simuleringsresultatStatus: 'TEKNISK_FEIL',
            muligeTpLeverandoerListe: [],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', () => {
          cy.contains(
            'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.'
          ).should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke klarte å hente min offentlige tjenestepensjon.', () => {
          cy.contains('Offentlig tjenestepensjon').should('exist')
          cy.contains(
            'Vi klarte ikke å hente din offentlige tjenestepensjon. Prøv igjen senere eller kontakt tjenestepensjonsordningen din'
          ).should('exist')
        })
      })
    })

    describe('Som bruker som har TPO forhold hos SPK som svarer med tom respons feil', () => {
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
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp',
          },
          {
            simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
            muligeTpLeverandoerListe: [],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ afp: 'vet_ikke', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        beforeEach(() => {
          cy.contains('button', '62 år og 10 md.').click()
        })

        it('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', () => {
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Vis tabell av beregningen').click({ force: true })
          cy.get('.navds-table__toggle-expand-button')
            .first()
            .click({ force: true })
          cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
          cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
        })

        it('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', () => {
          cy.contains(
            'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.'
          ).should('exist')
        })

        it('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke fikk svar fra min offentlige tjenestepensjonsordning.', () => {
          cy.contains('Offentlig tjenestepensjon').should('exist')
          cy.contains(
            'Vi fikk ikke svar fra din offentlige tjenestepensjonsordning.'
          ).should('exist')
        })
      })
    })
  })
})

export {}
