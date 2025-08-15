// https://jira.adeo.no/secure/Tests.jspa#/testCase/PEK-T14

describe('Endring av alderspensjon', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    describe('Som bruker som har gjeldende vedtak på alderspensjon,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          { fixture: 'loepende-vedtak-endring.json' }
        ).as('getLoependeVedtak')
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_endring.json' }
        ).as('fetchAlderspensjon')
        cy.clock(new Date(2029, 7, 1, 12, 0, 0), ['Date'])
        cy.login()
      })

      // 1
      it('forventer jeg informasjon på startsiden om at jeg har alderspensjon og hvilken uttaksgrad.', () => {
        cy.contains('Hei Aprikos!')
        cy.contains('Du har nå 100 % alderspensjon.')
      })
      it('forventer jeg å kunne gå videre ved å trykke kom i gang ', () => {
        cy.contains('button', 'Kom i gang').click()
      })

      // 2
      describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              harLoependeVedtak: true,
              alderspensjon: {
                grad: 80,
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              ufoeretrygd: { grad: 0 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })

        it('forventer jeg informasjon om at jeg har 80 % alderspensjon, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', () => {
          cy.contains(
            'Du har nå 80 % alderspensjon. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
        it('forventer jeg å kunne avbryte kalkulatoren.', () => {
          cy.contains('button', 'Avbryt').should('exist')
          cy.contains('button', 'Kom i gang').should('not.exist')
        })
      })

      // 3
      describe('Når jeg har trykt kom i gang,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
        })
        it('forventer jeg at neste steg er AFP.', () => {
          cy.contains('AFP')
        })
      })

      // 4
      describe('Som bruker som har svart "ja, offentlig" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get('[type="radio"]').eq(0).check()
          cy.contains('button', 'Neste').click()
          // Huker av "ja" på samtykke steget
          cy.get('[type="radio"]').eq(0).check()
          cy.contains('button', 'Neste').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').check()
          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })

        it('forventer jeg å se resultatet for alderspensjon i graf og tabell med Livsvarig AFP (offentlig).', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          // TODO denne er ikke tilgjengelig enda
          // cy.contains('AFP (avtalefestet pensjon)').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('65').should('exist')
          cy.contains('77+').should('exist')
        })

        it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at Livsvarig AFP (offentlig) er med.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Om pensjonen din').should('exist')
          cy.contains('Sivilstand:').click({ force: true })
          cy.contains('Opphold utenfor Norge:').click({ force: true })
          cy.contains('Fra vedtak').should('exist')
          cy.contains(
            'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
          ).should('exist')
          cy.contains('AFP: Offentlig').should('exist')
        })
      })

      // 5
      describe('Som bruker som har svart "ja, privat" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get('[type="radio"]').eq(1).check()
          cy.contains('button', 'Neste').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').check()
          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })

        it('forventer jeg å se resultatet for alderspensjon i graf og tabell med AFP privat.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('65').should('exist')
          cy.contains('77+').should('exist')
        })

        it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Privat er med.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Om pensjonen din').should('exist')
          cy.contains('Sivilstand:').click({ force: true })
          cy.contains('Opphold utenfor Norge:').click({ force: true })
          cy.contains('Fra vedtak').should('exist')
          cy.contains(
            'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
          ).should('exist')
          cy.contains('AFP: Privat').should('exist')
        })
      })

      // 6
      describe('Som bruker som har svart "vet ikke" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get('[type="radio"]').eq(3).check()
          cy.contains('button', 'Neste').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').check()
          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })

        it('forventer jeg å se resultatet for alderspensjon i graf og tabell uten AFP.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Pensjonsgivende inntekt').should('exist')
          cy.contains('AFP').should('exist')
          cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
            'not.exist'
          )
          cy.contains('Alderspensjon (Nav)').should('exist')
          cy.contains('Tusen kroner').should('exist')
          cy.contains('65').should('exist')
          cy.contains('77+').should('exist')
        })

        it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP vises iht. mitt valg.', () => {
          cy.contains('Beregning').should('exist')
          cy.contains('Om pensjonen din').should('exist')
          cy.contains('Sivilstand:').click({ force: true })
          cy.contains('Opphold utenfor Norge:').click({ force: true })
          cy.contains('Fra vedtak').should('exist')
          cy.contains(
            'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
          ).should('exist')
          cy.contains('AFP: Vet ikke').should('exist')
        })
      })

      describe('Som bruker som har svart "nei" på spørsmål om AFP,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get('[type="radio"]').eq(2).check()
          cy.contains('button', 'Neste').click()
        })

        // 7
        describe('Når jeg er kommet til beregningssiden i redigeringsmodus,', () => {
          it('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', () => {
            cy.contains('Beregn endring av alderspensjon')
            cy.contains('Fra 10.10.2010 har du mottatt 100 % alderspensjon.')
          })

          it('forventer jeg å kunne endre inntekt frem til endring.', () => {
            cy.contains('Pensjonsgivende årsinntekt frem til endring')
            cy.contains('button', 'Endre inntekt').click()
            cy.get('[data-testid="inntekt-textfield"]').clear().type('550000')
            cy.contains('button', 'Oppdater inntekt').click()
            cy.contains('550 000 kr per år før skatt')
          })

          it('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', () => {
            // datoen som er mocked er 01. August 2029. Brukeren som er født 1964-04-30 er 65 år gammel og 3 md.
            cy.contains('Når vil du endre alderspensjonen din?').should('exist')
            cy.contains('Velg år').should('exist')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).then((selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(12)
              expect(options.eq(1).text()).equal('65 år')
              expect(options.eq(11).text()).equal('75 år')
            })
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('65')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).then((selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(9)
              expect(options.eq(1).text()).equal('4 md. (sep.)')
              expect(options.eq(8).text()).equal('11 md. (apr.)')
            })
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('75')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).then((selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(2)
              expect(options.eq(1).text()).equal('0 md. (mai)')
            })
          })

          it('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', () => {
            cy.contains('Hvor mye alderspensjon vil du ta ut?').should('exist')
            cy.contains('Velg ny uttaksgrad').should('exist')
            cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(8)
              expect(options.eq(1).text()).equal('0 %')
              expect(options.eq(2).text()).equal('20 %')
              expect(options.eq(3).text()).equal('40 %')
              expect(options.eq(4).text()).equal('50 %')
              expect(options.eq(5).text()).equal('60 %')
              expect(options.eq(6).text()).equal('80 %')
              expect(options.eq(7).text()).equal('100 %')
            })
          })

          it('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', () => {
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('65')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).select('4')
            cy.get('[data-testid="uttaksgrad"]').select('100 %')
            cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
            cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')
            cy.contains(
              'Til hvilken alder forventer du å ha inntekten?'
            ).should('exist')
            cy.contains('Velg år').should('exist')
            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
            ).then((selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(12)
              expect(options.eq(1).text()).equal('65 år')
              expect(options.eq(11).text()).equal('75 år')
            })
            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
            ).select('70')

            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
            ).select('75')
            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
            ).select('3')

            cy.contains('Beregn ny pensjon').click()

            cy.contains('Beregning').should('exist')
          })
        })

        // 8
        describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
          beforeEach(() => {
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('65')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).select('4')
            cy.get('[data-testid="uttaksgrad"]').select('40 %')
          })

          it('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', () => {
            cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
            cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('67')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).select('0')
            cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
            cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
            ).select('75')
            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
            ).select('0')

            cy.contains('Beregn ny pensjon').click()
            cy.contains('Beregning').should('exist')
          })
        })

        describe('Som bruker som har valgt endringer,', () => {
          beforeEach(() => {
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('65')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).select('4')
            cy.get('[data-testid="uttaksgrad"]').select('40 %')
            cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
            cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
            ).select('67')
            cy.get(
              '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
            ).select('0')
            cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
            cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
            ).select('75')
            cy.get(
              '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
            ).select('0')
          })

          // 9
          describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
            beforeEach(() => {
              cy.contains('Beregn ny pensjon').click()
              cy.contains('Beregning').should('exist')
              cy.contains('Pensjonsgivende inntekt').should('exist')
            })

            it('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', () => {
              cy.contains('Du har i dag 100 % alderspensjon.')
            })

            it('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', () => {
              cy.contains('Alderspensjon når du er')
              cy.contains('65 år og 4 md. (40 %): 12 342 kr/md.')
              cy.contains('67 år (100 %): 28 513 kr/md.')
            })

            it('forventer jeg en lenke for å endre mine valg.', () => {
              cy.contains('Endre valgene dine')
            })

            it('forventer jeg å se resultatet for alderspensjon i graf og tabell uten AFP.', () => {
              cy.contains('Beregning').should('exist')
              cy.contains('Pensjonsgivende inntekt').should('exist')
              cy.contains('AFP').should('exist')
              cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
                'not.exist'
              )
              cy.contains('Alderspensjon (Nav)').should('exist')
              cy.contains('Tusen kroner').should('exist')
              cy.contains('65').should('exist')
              cy.contains('77+').should('exist')
            })

            it('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', () => {
              cy.contains(
                'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
              ).should('exist')
            })

            it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP vises ut fra hva jeg har svart. ', () => {
              cy.contains('Beregning').should('exist')
              cy.contains('Om pensjonen din').should('exist')
              cy.contains('Sivilstand:').click({ force: true })
              cy.contains('Opphold utenfor Norge:').click({ force: true })
              cy.contains('Fra vedtak').should('exist')
              cy.contains(
                'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
              ).should('exist')
              cy.contains('AFP: Nei').should('exist')
            })

            it('forventer jeg lenke til søknad om endring av alderspensjon.', () => {
              cy.contains('Klar til å søke om endring?').should('exist')
              cy.contains('a', 'Din pensjon')
                .should('have.attr', 'href')
                .and('include', '/pensjon/opptjening/nb/')
            })
          })
        })
      })
    })

    describe('Som bruker som har gjeldende vedtak på alderspensjon og AFP privat', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 80,
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            afpPrivat: { fom: '2010-10-10' },
            ufoeretrygd: { grad: 0 },
          } satisfies LoependeVedtak
        ).as('getLoependeVedtak')
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_endring.json' }
        ).as('fetchAlderspensjon')
        cy.clock(new Date(2029, 7, 1, 12, 0, 0), ['Date'])
        cy.login()
      })

      // 11
      it('forventer jeg informasjon på startsiden om at jeg har alderspensjon og AFP privat og hvilken uttaksgrad.', () => {
        cy.contains('Hei Aprikos!')
        cy.contains('Du har nå 80 % alderspensjon og AFP i privat sektor')
      })
      it('forventer jeg å kunne gå videre ved å trykke kom i gang ', () => {
        cy.contains('button', 'Kom i gang').click()
      })

      // 12
      describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              harLoependeVedtak: true,
              alderspensjon: {
                grad: 80,
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              afpPrivat: { fom: '2010-10-10' },
              ufoeretrygd: { grad: 0 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })

        it('forventer jeg informasjon om at jeg har 80 % alderspensjon og AFP, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', () => {
          cy.contains(
            'Du har nå 80 % alderspensjon og AFP i privat sektor. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
      })

      // 13
      describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
        })

        it('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', () => {
          cy.contains('Beregn endring av alderspensjon')
          cy.contains('Fra 10.10.2010 har du mottatt 80 % alderspensjon.')
        })

        it('forventer jeg å kunne endre inntekt frem til endring.', () => {
          cy.contains('Pensjonsgivende årsinntekt frem til endring')
          cy.contains('button', 'Endre inntekt').click()
          cy.get('[data-testid="inntekt-textfield"]').clear().type('550000')
          cy.contains('button', 'Oppdater inntekt').click()
          cy.contains('550 000 kr per år før skatt')
        })

        it('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', () => {
          // datoen som er mocked er 01. August 2029. Brukeren som er født 1964-04-30 er 65 år gammel og 3 md.
          cy.contains('Når vil du endre alderspensjonen din?').should('exist')
          cy.contains('Velg år').should('exist')
          cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
            (selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(12)
              expect(options.eq(1).text()).equal('65 år')
              expect(options.eq(11).text()).equal('75 år')
            }
          )
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(9)
            expect(options.eq(1).text()).equal('4 md. (sep.)')
            expect(options.eq(8).text()).equal('11 md. (apr.)')
          })
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(2)
            expect(options.eq(1).text()).equal('0 md. (mai)')
          })
        })

        it('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', () => {
          cy.contains('Hvor mye alderspensjon vil du ta ut?').should('exist')
          cy.contains('Velg ny uttaksgrad').should('exist')
          cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(8)
            expect(options.eq(1).text()).equal('0 %')
            expect(options.eq(2).text()).equal('20 %')
            expect(options.eq(3).text()).equal('40 %')
            expect(options.eq(4).text()).equal('50 %')
            expect(options.eq(5).text()).equal('60 %')
            expect(options.eq(6).text()).equal('80 %')
            expect(options.eq(7).text()).equal('100 %')
          })
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')
          cy.contains('Til hvilken alder forventer du å ha inntekten?').should(
            'exist'
          )
          cy.contains('Velg år').should('exist')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(12)
            expect(options.eq(1).text()).equal('65 år')
            expect(options.eq(11).text()).equal('75 år')
          })
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('70')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('3')

          cy.contains('Beregn ny pensjon').click()

          cy.contains('Beregning').should('exist')
        })
      })

      // 14
      describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', () => {
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')

          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })
      })

      // 15
      describe('Som bruker som har valgt endringer,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')
        })

        describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
          beforeEach(() => {
            cy.contains('Beregn ny pensjon').click()
            cy.contains('Beregning').should('exist')
          })

          it('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', () => {
            cy.contains('Du har i dag 80 % alderspensjon.')
          })

          it('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', () => {
            cy.contains('Alderspensjon når du er')
            cy.contains('65 år og 4 md. (40 %): 12 342 kr/md.')
            cy.contains('67 år (100 %): 28 513 kr/md.')
          })

          it('forventer jeg en lenke for å endre mine valg.', () => {
            cy.contains('Endre valgene dine')
          })

          it('forventer jeg å se resultatet for alderspensjon i graf og tabell med AFP Privat.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (Nav)').should('exist')
            cy.contains('Tusen kroner').should('exist')
            cy.contains('65').should('exist')
            cy.contains('77+').should('exist')
          })

          it('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', () => {
            cy.contains(
              'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
            ).should('exist')
          })

          it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Privat er uendret ', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Om pensjonen din').should('exist')
            cy.contains('Sivilstand:').click({ force: true })
            cy.contains('Opphold utenfor Norge:').click({ force: true })
            cy.contains('Fra vedtak').should('exist')
            cy.contains(
              'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
            ).should('exist')
            cy.contains('AFP: Privat (uendret)').should('exist')
          })

          it('forventer jeg lenke til søknad om endring av alderspensjon.', () => {
            cy.contains('Klar til å søke om endring?').should('exist')
            cy.contains('a', 'Din pensjon')
              .should('have.attr', 'href')
              .and('include', '/pensjon/opptjening/nb/')
          })
        })
      })
    })

    // OBS: Dette er ikke i Jira
    describe('Som bruker som har gjeldende vedtak på alderspensjon og Livsvarig AFP (offentlig)', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 80,
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            afpOffentlig: { fom: '2010-10-10' },
            ufoeretrygd: { grad: 0 },
          } satisfies LoependeVedtak
        ).as('getLoependeVedtak')
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_endring.json' }
        ).as('fetchAlderspensjon')
        cy.clock(new Date(2029, 7, 1, 12, 0, 0), ['Date'])
        cy.login()
      })

      it('forventer jeg informasjon på startsiden om at jeg har alderspensjon og AFP privat og hvilken uttaksgrad.', () => {
        cy.contains('Hei Aprikos!')
        cy.contains('Du har nå 80 % alderspensjon og AFP i offentlig sektor')
      })
      it('forventer jeg å kunne gå videre ved å trykke kom i gang ', () => {
        cy.contains('button', 'Kom i gang').click()
      })

      describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              harLoependeVedtak: true,
              alderspensjon: {
                grad: 80,
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              afpOffentlig: { fom: '2010-10-10' },
              ufoeretrygd: {
                grad: 0,
              },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })

        it('forventer jeg informasjon om at jeg har 80 % alderspensjon og AFP, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', () => {
          cy.contains(
            'Du har nå 80 % alderspensjon og AFP i offentlig sektor. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
      })

      describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
        })

        it('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', () => {
          cy.contains('Beregn endring av alderspensjon')
          cy.contains('Fra 10.10.2010 har du mottatt 80 % alderspensjon.')
        })

        it('forventer jeg å kunne endre inntekt frem til endring.', () => {
          cy.contains('Pensjonsgivende årsinntekt frem til endring')
          cy.contains('button', 'Endre inntekt').click()
          cy.get('[data-testid="inntekt-textfield"]').clear().type('550000')
          cy.contains('button', 'Oppdater inntekt').click()
          cy.contains('550 000 kr per år før skatt')
        })

        it('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', () => {
          // datoen som er mocked er 01. August 2029. Brukeren som er født 1964-04-30 er 65 år gammel og 3 md.
          cy.contains('Når vil du endre alderspensjonen din?').should('exist')
          cy.contains('Velg år').should('exist')
          cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
            (selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(12)
              expect(options.eq(1).text()).equal('65 år')
              expect(options.eq(11).text()).equal('75 år')
            }
          )
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(9)
            expect(options.eq(1).text()).equal('4 md. (sep.)')
            expect(options.eq(8).text()).equal('11 md. (apr.)')
          })
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(2)
            expect(options.eq(1).text()).equal('0 md. (mai)')
          })
        })

        it('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', () => {
          cy.contains('Hvor mye alderspensjon vil du ta ut?').should('exist')
          cy.contains('Velg ny uttaksgrad').should('exist')
          cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(8)
            expect(options.eq(1).text()).equal('0 %')
            expect(options.eq(2).text()).equal('20 %')
            expect(options.eq(3).text()).equal('40 %')
            expect(options.eq(4).text()).equal('50 %')
            expect(options.eq(5).text()).equal('60 %')
            expect(options.eq(6).text()).equal('80 %')
            expect(options.eq(7).text()).equal('100 %')
          })
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')
          cy.contains('Til hvilken alder forventer du å ha inntekten?').should(
            'exist'
          )
          cy.contains('Velg år').should('exist')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(12)
            expect(options.eq(1).text()).equal('65 år')
            expect(options.eq(11).text()).equal('75 år')
          })
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('70')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('3')

          cy.contains('Beregn ny pensjon').click()

          cy.contains('Beregning').should('exist')
        })
      })

      describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', () => {
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')

          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })
      })

      describe('Som bruker som har valgt endringer,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')
        })

        describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
          beforeEach(() => {
            cy.contains('Beregn ny pensjon').click()
            cy.contains('Beregning').should('exist')
          })

          it('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', () => {
            cy.contains('Du har i dag 80 % alderspensjon.')
          })

          it('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', () => {
            cy.contains('Alderspensjon når du er')
            cy.contains('65 år og 4 md. (40 %): 12 342 kr/md.')
            cy.contains('67 år (100 %): 28 513 kr/md.')
          })

          it('forventer jeg en lenke for å endre mine valg.', () => {
            cy.contains('Endre valgene dine')
          })

          it('forventer jeg å se resultatet for alderspensjon i graf og tabell med Livsvarig AFP (offentlig).', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Pensjonsgivende inntekt').should('exist')
            // TODO kommentert ut for nå fordi ikke implementert enda. For nå vises ikke AFP Offentlig i resultatet.
            // cy.contains('AFP (avtalefestet pensjon)').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (Nav)').should('exist')
            cy.contains('Tusen kroner').should('exist')
            cy.contains('65').should('exist')
            cy.contains('77+').should('exist')
          })

          it('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', () => {
            cy.contains(
              'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
            ).should('exist')
          })

          it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Offentlig er uendret.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Om pensjonen din').should('exist')
            cy.contains('Sivilstand:').click({ force: true })
            cy.contains('Opphold utenfor Norge:').click({ force: true })
            cy.contains('Fra vedtak').should('exist')
            cy.contains(
              'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
            ).should('exist')
            cy.contains('AFP: Offentlig').should('exist')
          })

          it('forventer jeg lenke til søknad om endring av alderspensjon.', () => {
            cy.contains('Klar til å søke om endring?').should('exist')
            cy.contains('a', 'Din pensjon')
              .should('have.attr', 'href')
              .and('include', '/pensjon/opptjening/nb/')
          })
        })
      })
    })

    describe('Som bruker som har gjeldende vedtak på alderspensjon og gradert uføretrygd', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 50,
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 50 },
          } satisfies LoependeVedtak
        ).as('getLoependeVedtak')
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_endring.json' }
        ).as('fetchAlderspensjon')
        cy.clock(new Date(2029, 7, 1, 12, 0, 0), ['Date'])
        cy.login()
      })

      // 17
      it('forventer jeg informasjon på startsiden om at jeg har alderspensjon og uføetrygd og hvilken uttaksgrad.', () => {
        cy.contains('Hei Aprikos!')
        cy.contains('Du har nå 50 % alderspensjon og 50 % uføretrygd')
      })
      it('forventer jeg å kunne gå videre ved å trykke kom i gang ', () => {
        cy.contains('button', 'Kom i gang').click()
      })

      // 18
      describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              harLoependeVedtak: true,
              alderspensjon: {
                grad: 50,
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              ufoeretrygd: { grad: 40 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })

        it('forventer jeg informasjon om at jeg har 50 % alderspensjon og 40 % uføretrygd, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', () => {
          cy.contains(
            'Du har nå 50 % alderspensjon og 40 % uføretrygd. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
      })

      // 19
      describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
        })

        it('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', () => {
          cy.contains('Beregn endring av alderspensjon')
          cy.contains('Fra 10.10.2010 har du mottatt 50 % alderspensjon.')
        })

        it('forventer jeg å kunne endre inntekt frem til endring.', () => {
          cy.contains('Pensjonsgivende årsinntekt frem til endring')
          cy.contains('button', 'Endre inntekt').click()
          cy.get('[data-testid="inntekt-textfield"]').clear().type('550000')
          cy.contains('button', 'Oppdater inntekt').click()
          cy.contains('550 000 kr per år før skatt')
        })

        it('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', () => {
          // datoen som er mocked er 01. August 2029. Brukeren som er født 1964-04-30 er 65 år gammel og 3 md.
          cy.contains('Når vil du endre alderspensjonen din?').should('exist')
          cy.contains('Velg år').should('exist')
          cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
            (selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(12)
              expect(options.eq(1).text()).equal('65 år')
              expect(options.eq(11).text()).equal('75 år')
            }
          )
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(9)
            expect(options.eq(1).text()).equal('4 md. (sep.)')
            expect(options.eq(8).text()).equal('11 md. (apr.)')
          })
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(2)
            expect(options.eq(1).text()).equal('0 md. (mai)')
          })
        })

        it('forventer jeg at mulige uttaksgrader begrenses til uttaksgradene som er mulig å kombinere med uføretrygd ved uttaksalder før ubetinget uttaksalder.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('66')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('6')

          cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(5)
            expect(options.eq(1).text()).equal('0 %')
            expect(options.eq(2).text()).equal('20 %')
            expect(options.eq(3).text()).equal('40 %')
            expect(options.eq(4).text()).equal('50 %')
          })
        })

        it('forventer jeg at mulige uttaksgrader ikke begrenses ved uttaksalder over ubetinget uttaksalder.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')

          cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(8)
            expect(options.eq(1).text()).equal('0 %')
            expect(options.eq(2).text()).equal('20 %')
            expect(options.eq(3).text()).equal('40 %')
            expect(options.eq(4).text()).equal('50 %')
            expect(options.eq(5).text()).equal('60 %')
            expect(options.eq(6).text()).equal('80 %')
            expect(options.eq(7).text()).equal('100 %')
          })
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')

          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })
      })

      // 20
      describe('Som bruker som har valgt endringer,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('65')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')
        })

        describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
          beforeEach(() => {
            cy.contains('Beregn ny pensjon').click()
            cy.contains('Beregning').should('exist')
          })

          it('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', () => {
            cy.contains('Du har i dag 50 % alderspensjon.')
          })

          it('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', () => {
            cy.contains('Alderspensjon når du er')
            cy.contains('65 år og 4 md. (40 %): 12 342 kr/md.')
            cy.contains('67 år (100 %): 28 513 kr/md.')
          })

          it('forventer jeg en lenke for å endre mine valg.', () => {
            cy.contains('Endre valgene dine')
          })

          it('forventer jeg å se resultatet for alderspensjon i graf og tabell.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (Nav)').should('exist')
            cy.contains('Tusen kroner').should('exist')
            cy.contains('65').should('exist')
            cy.contains('77+').should('exist')
          })

          it('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', () => {
            cy.contains(
              'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
            ).should('exist')
          })

          it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Om pensjonen din').should('exist')
            cy.contains('Sivilstand:').click({ force: true })
            cy.contains('Opphold utenfor Norge:').click({ force: true })
            cy.contains('Fra vedtak').should('exist')
            cy.contains(
              'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
            ).should('exist')
            cy.contains('AFP: Nei').should('exist')
          })

          it('forventer jeg lenke til søknad om endring av alderspensjon.', () => {
            cy.contains('Klar til å søke om endring?').should('exist')
            cy.contains('a', 'Din pensjon')
              .should('have.attr', 'href')
              .and('include', '/pensjon/opptjening/nb/')
          })
        })
      })
    })

    describe('Som bruker som har gjeldende vedtak på alderspensjon med 0 % og 100 % uføretrygd', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
          },
          {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 0,
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 100 },
          } satisfies LoependeVedtak
        ).as('getLoependeVedtak')
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
          },
          { fixture: 'alderspensjon_endring.json' }
        ).as('fetchAlderspensjon')
        cy.clock(new Date(2029, 7, 1, 12, 0, 0), ['Date'])
        cy.login()
      })

      // 22
      it('forventer jeg informasjon på startsiden om at jeg har 0% alderspensjon og 100 % uføretrygd.', () => {
        cy.contains('Hei Aprikos!')
        cy.contains('Du har nå 0 % alderspensjon og 100 % uføretrygd')
      })
      it('forventer jeg å kunne gå videre ved å trykke kom i gang ', () => {
        cy.contains('button', 'Kom i gang').click()
      })

      // 23
      describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              harLoependeVedtak: true,
              alderspensjon: {
                grad: 0,
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              ufoeretrygd: { grad: 100 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })

        it('forventer jeg informasjon om at jeg har 0 % alderspensjon og 100 % uføretrygd, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', () => {
          cy.contains(
            'Du har nå 0 % alderspensjon og 100 % uføretrygd. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
      })

      // 24
      describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
        })

        it('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', () => {
          cy.contains('Beregn endring av alderspensjon')
          cy.contains('Fra 10.10.2010 har du mottatt 0 % alderspensjon.')
        })

        it('forventer jeg å kunne endre inntekt frem til endring.', () => {
          cy.contains('Pensjonsgivende årsinntekt frem til endring')
          cy.contains('button', 'Endre inntekt').click()
          cy.get('[data-testid="inntekt-textfield"]').clear().type('550000')
          cy.contains('button', 'Oppdater inntekt').click()
          cy.contains('550 000 kr per år før skatt')
        })

        it('forventer jeg å kunne velge pensjonsalder for endring mellom ubetinget uttaksalder og 75 år + 0 md.', () => {
          // datoen som er mocked er 01. August 2029. Allikevel skal brukeren ikke kunne begynne uttak før at er over ibetinget uttaksalder
          cy.contains('Når vil du endre alderspensjonen din?').should('exist')
          cy.contains('Velg år').should('exist')
          cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
            (selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(10)
              expect(options.eq(1).text()).equal('67 år')
              expect(options.eq(9).text()).equal('75 år')
            }
          )
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(13)
            expect(options.eq(1).text()).equal('0 md. (mai)')
            expect(options.eq(12).text()).equal('11 md. (apr.)')
          })
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(2)
            expect(options.eq(1).text()).equal('0 md. (mai)')
          })
        })

        it('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', () => {
          cy.contains('Hvor mye alderspensjon vil du ta ut?').should('exist')
          cy.contains('Velg ny uttaksgrad').should('exist')
          cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(8)
            expect(options.eq(1).text()).equal('0 %')
            expect(options.eq(2).text()).equal('20 %')
            expect(options.eq(3).text()).equal('40 %')
            expect(options.eq(4).text()).equal('50 %')
            expect(options.eq(5).text()).equal('60 %')
            expect(options.eq(6).text()).equal('80 %')
            expect(options.eq(7).text()).equal('100 %')
          })
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', () => {
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('100 %')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')
          cy.contains('Til hvilken alder forventer du å ha inntekten?').should(
            'exist'
          )
          cy.contains('Velg år').should('exist')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).then((selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(10)
            expect(options.eq(1).text()).equal('67 år')
            expect(options.eq(9).text()).equal('75 år')
          })
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('70')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('3')

          cy.contains('Beregn ny pensjon').click()

          cy.contains('Beregning').should('exist')
        })
      })

      // 25
      describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
        })

        it('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', () => {
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('72')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')

          cy.contains('Beregn ny pensjon').click()
          cy.contains('Beregning').should('exist')
        })
      })

      // 26
      describe('Som bruker som har valgt endringer,', () => {
        beforeEach(() => {
          cy.contains('button', 'Kom i gang').click()
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('67')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('4')
          cy.get('[data-testid="uttaksgrad"]').select('40 %')
          cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-aar"]'
          ).select('70')
          cy.get(
            '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
          ).select('0')
          cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').check()
          cy.get('[data-testid="inntekt-vsa-helt-uttak"]').type('100000')

          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
          ).select('75')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('0')
        })

        describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
          beforeEach(() => {
            cy.contains('Beregn ny pensjon').click()
            cy.contains('Beregning').should('exist')
          })

          it('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', () => {
            cy.contains('Du har i dag 0 % alderspensjon.')
          })

          it('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', () => {
            cy.contains('Alderspensjon når du er')
            cy.contains('67 år og 4 md. (40 %): 12 342 kr/md.')
            cy.contains('70 år (100 %): 28 513 kr/md.')
          })

          it('forventer jeg en lenke for å endre mine valg.', () => {
            cy.contains('Endre valgene dine')
          })

          it('forventer jeg å se resultatet for alderspensjon i graf og tabell.', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Pensjonsgivende inntekt').should('exist')
            cy.contains('AFP').should('exist')
            cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should(
              'not.exist'
            )
            cy.contains('Alderspensjon (Nav)').should('exist')
            cy.contains('Tusen kroner').should('exist')
            cy.contains('65').should('exist')
            cy.contains('77+').should('exist')
          })

          it('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', () => {
            cy.contains(
              'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
            ).should('exist')
          })

          it('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP: Nei vises', () => {
            cy.contains('Beregning').should('exist')
            cy.contains('Om pensjonen din').should('exist')
            cy.contains('Sivilstand:').click({ force: true })
            cy.contains('Opphold utenfor Norge:').click({ force: true })
            cy.contains('Fra vedtak').should('exist')
            cy.contains(
              'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
            ).should('exist')
            cy.contains('AFP: Nei').should('exist')
          })

          it('forventer jeg lenke til søknad om endring av alderspensjon.', () => {
            cy.contains('Klar til å søke om endring?').should('exist')
            cy.contains('a', 'Din pensjon')
              .should('have.attr', 'href')
              .and('include', '/pensjon/opptjening/nb/')
          })
        })
      })
    })
  })
})

export {}
