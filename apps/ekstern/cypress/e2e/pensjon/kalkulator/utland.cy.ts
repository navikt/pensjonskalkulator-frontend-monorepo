describe('Utland', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    beforeEach(() => {
      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.contains('button', 'Neste').click()
    })

    describe('Når jeg har navigert til steget for utenlandsopphold,', () => {
      it('forventer jeg å bli spurt om jeg har bodd/jobbet mer enn 5 år utenfor Norge.', () => {
        cy.contains('h2', 'Opphold utenfor Norge').should('exist')
        cy.contains(
          'Har du bodd eller jobbet utenfor Norge i mer enn 5 år?'
        ).should('exist')
      })

      it('forventer jeg ikke å få en knapp for å legge til opphold.', () => {
        cy.contains('Legg til opphold').should('not.exist')
      })
    })

    describe('Når jeg har svart "ja" på spørsmål om jeg har bodd eller jobbet mer enn 5 år utenfor Norge,', () => {
      it('forventer jeg å få en knapp for å legge til opphold.', () => {
        cy.get('[type="radio"]').first().check({ force: true })
        cy.contains('Legg til opphold').should('exist')
      })
    })

    describe('Som bruker som svarer "ja" på mer enn 5 år i utlandet,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').first().check({ force: true })
      })

      describe('Når jeg trykker «neste» uten å legge til opphold,', () => {
        it('forventer jeg beskjed om at jeg må legge til minst ett opphold, eller svare nei.', () => {
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må legge til minst ett opphold eller svare «Nei» på om du har bodd eller jobbet utenfor Norge i mer enn 5 år.'
          ).should('exist')
        })
      })

      describe('Når jeg trykker på "legg til opphold",', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
        })

        it('forventer jeg å kunne velge land fra liste/nedtrekksmeny.', () => {
          cy.contains('Om oppholdet ditt').should('be.visible')
          cy.contains('Velg land').should('be.visible')
          cy.get('[data-testid="utenlandsopphold-land"]').then(
            (selectElements) => {
              const options = selectElements.find('option')
              expect(options.length).equal(257)
              expect(options.eq(1).text()).equal('Afghanistan')
              expect(options.eq(256).text()).equal('ukjent')
            }
          )
        })

        describe('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett avtaleland, unntatt nordiske land og Nederland,', () => {
          beforeEach(() => {
            cy.get('[data-testid="utenlandsopphold-land"]').select('Frankrike')
          })

          it('forventer jeg å kunne velge om jeg jobbet i landet eller ikke.', () => {
            cy.contains('Jobbet du i Frankrike?').should('be.visible')
          })

          it('forventer jeg å kunne oppgi startdato og sluttdato for oppholdet.', () => {
            cy.contains('Oppgi startdato').should('be.visible')
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.contains('Oppgi sluttdato').should('be.visible')
          })

          it('forventer jeg å kunne trykke på «legg til opphold» og registrere opphold med eller uten sluttdato.', () => {
            cy.get(
              '[data-testid="utenlandsopphold-arbeidet-utenlands-ja"]'
            ).check()
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
              '31.12.1982'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').clear()
            cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
          })
        })

        describe('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett ikke avtaleland, unntatt nordiske land og Nederland,', () => {
          beforeEach(() => {
            cy.get('[data-testid="utenlandsopphold-land"]').select(
              'Afghanistan'
            )
          })

          it('forventer jeg å ikke få spørsmål om jeg har jobbet i landet.', () => {
            cy.contains('Jobbet du i Afghanistan?').should('not.exist')
          })

          it('forventer jeg å kunne oppgi startdato og sluttdato for oppholdet.', () => {
            cy.contains('Oppgi startdato').should('be.visible')
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.contains('Oppgi sluttdato').should('be.visible')
          })

          it('forventer jeg å kunne trykke på «legg til opphold» og registrere opphold med eller uten sluttdato.', () => {
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
              '31.12.1982'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').clear()
            cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
          })
        })
      })

      describe('Når jeg har lagt til utenlandsopphold,', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
          cy.contains('Velg land').should('be.visible')
          cy.get('[data-testid="utenlandsopphold-land"]').select('Frankrike')
          cy.get(
            '[data-testid="utenlandsopphold-arbeidet-utenlands-nei"]'
          ).check()
          cy.get('[data-testid="utenlandsopphold-startdato"]').type(
            '01.06.1980'
          )
          cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
            '31.12.1982'
          )
          cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
        })

        it('forventer jeg å få en tabell/liste over utenlandsopphold jeg har lagt til.', () => {
          cy.contains('Oppholdene dine utenfor Norge').should('exist')
          cy.contains('Frankrike').should('exist')
          cy.contains('Periode: 01.06.1980–31.12.1982').should('exist')
          cy.contains('Jobbet: Nei').should('exist')
        })

        it('forventer jeg å kunne endre eller slette oppholdet.', () => {
          cy.contains('Endre opphold').should('exist')
          cy.contains('Slett opphold').should('exist')
        })

        it('forventer jeg at knappen har endret seg fra "legg til opphold" til "legg til nytt opphold".', () => {
          cy.contains('Legg til nytt opphold').should('exist')
        })

        it('forventer jeg å kunne gå videre til neste steg.', () => {
          cy.contains('button', 'Neste').click()
          cy.contains('AFP (avtalefestet pensjon)').should('exist')
        })
      })

      describe('Som bruker som har allerede lagt til et utenlandsopphold,', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
          cy.contains('Velg land').should('be.visible')
          cy.get('[data-testid="utenlandsopphold-land"]').select('Frankrike')
          cy.get(
            '[data-testid="utenlandsopphold-arbeidet-utenlands-nei"]'
          ).check()
          cy.get('[data-testid="utenlandsopphold-startdato"]').type(
            '10.06.1980'
          )
          cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
            '16.12.1982'
          )
          cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
          cy.contains('Oppholdene dine utenfor Norge').should('exist')
          cy.contains('Frankrike').should('exist')
          cy.contains('Periode: 10.06.1980–16.12.1982').should('exist')
          cy.contains('Jobbet: Nei').should('exist')
        })

        describe('Når jeg legger til et overlappende utenlandsopphold i et annet land,', () => {
          it('forventer jeg feilmelding om at jeg ikke kan ha overlappende opphold med to ulike land.', () => {
            cy.wait(50)
            cy.screenshot()
            cy.get('[data-testid="legg-til-utenlandsopphold"]').click()
            cy.contains('Velg land').should('be.visible')
            cy.get('[data-testid="utenlandsopphold-land"]').select('Antarktis')
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '20.04.1981'
            )
            cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
            // Full tekst 'Du har allerede registrert at du har bodd i Frankrike fra 01.06.1980 til 31.12.1982. Du kan ikke ha overlappende opphold i to ulike land.'
            cy.contains(
              'Du har allerede registrert at du har bodd i Frankrike '
            ).should('be.visible')
            cy.get('[data-testid="legg-til-utenlandsopphold-avbryt"]').click({
              force: true,
            })
          })
        })

        describe('Når jeg ønsker å endre ett utenlandsopphold jeg har lagt inn,', () => {
          it('forventer jeg å kunne endre land, jobb status, tidspunkt for oppholdet og oppdatere oppholdet.', () => {
            cy.wait(50)
            cy.screenshot()
            cy.get('[data-testid="endre-utenlandsopphold"]').click()
            cy.screenshot()
            cy.contains('Velg land').should('be.visible')
            cy.screenshot()
            cy.get('[data-testid="utenlandsopphold-land"]').scrollIntoView()
            cy.screenshot()
            cy.contains('Jobbet du i Frankrike?').should('exist')
            cy.get('[data-testid="utenlandsopphold-land"]').select('Spania')
            cy.get(
              '[data-testid="utenlandsopphold-arbeidet-utenlands-ja"]'
            ).check()
            cy.get('[data-testid="utenlandsopphold-startdato"]')
              .clear()
              .type('20.04.1981')
            cy.get('[data-testid="utenlandsopphold-sluttdato"]')
              .clear()
              .type('16.12.2020')
            cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
            cy.contains('Oppholdene dine utenfor Norge').should('exist')
            cy.contains('Frankrike').should('not.be.visible')
            cy.contains('Spania').should('exist')
            cy.contains('Periode: 20.04.1981–16.12.2020').should('exist')
            cy.contains('Jobbet: Ja').should('exist')
          })

          it('forventer jeg å kunne avbryte endringen.', () => {
            cy.wait(50)
            cy.screenshot()
            cy.get('[data-testid="endre-utenlandsopphold"]').click()
            cy.screenshot()
            cy.contains('Velg land').should('be.visible')
            cy.screenshot()
            cy.get('[data-testid="utenlandsopphold-land"]').scrollIntoView()
            cy.screenshot()
            cy.contains('Jobbet du i Frankrike?').should('be.visible')
            cy.contains('button', 'Avbryt endring').click()
            cy.contains('Oppholdene dine utenfor Norge').should('exist')
            cy.contains('Frankrike').should('exist')
            cy.contains('Periode: 10.06.1980–16.12.1982').should('exist')
            cy.contains('Jobbet: Nei').should('exist')
          })
        })

        describe('Når jeg ønsker å slette ett utenlandsopphold jeg har lagt til,', () => {
          it('forventer jeg spørsmål på om jeg er sikker på at jeg ønsker å slette oppholdet og jeg kan avbryte.', () => {
            cy.get('[data-testid="slett-utenlandsopphold"]').click()
            cy.contains(
              'Er du sikker på at du vil slette oppholdet ditt?'
            ).should('exist')
            cy.contains('button', 'Avbryt').click()
            cy.contains('Oppholdene dine utenfor Norge').should('exist')
            cy.contains('Frankrike').should('exist')
            cy.contains('Periode: 10.06.1980–16.12.1982').should('exist')
            cy.contains('Jobbet: Nei').should('exist')
          })

          it('forventer jeg at oppholdet slettes fra listen av opphold.', () => {
            cy.get('[data-testid="slett-utenlandsopphold"]').click()
            cy.contains(
              'Er du sikker på at du vil slette oppholdet ditt?'
            ).should('exist')
            cy.contains('button', 'Slett opphold').click()
            cy.contains('Frankrike').should('not.be.visible')
          })
        })

        describe('Som bruker som navigerer til resultatsiden,', () => {
          beforeEach(() => {
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').last().check()
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').last().check()
            cy.contains('button', 'Neste').click()
          })
          describe('Når har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.contains('button', '70 år').click({ force: true })
            })

            it('forventer jeg at det i grunnlaget står at jeg har opphold utenfor Norge på "mer enn 5 år".', () => {
              cy.contains('Opphold utenfor Norge:').should('exist')
              cy.contains('Mer enn 5 år').should('exist')
            })

            it('forventer å kunne trykke i grunnlaget for å se listen over mine opphold.', () => {
              cy.contains('Opphold utenfor Norge:').click({ force: true })
              cy.contains('Oppholdene dine utenfor Norge').should('exist')
              cy.contains('Frankrike').should('exist')
              cy.contains('Periode: 10.06.1980–16.12.1982').should('exist')
              cy.contains('Jobbet: Nei').should('exist')
            })

            it('forventer å kunne gå tilbake til "opphold utenfor Norge".', () => {
              cy.contains('Opphold utenfor Norge:').click({ force: true })
              cy.contains('a', 'Opphold utenfor Norge').click()
              cy.contains(
                'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.'
              ).should('exist')
              cy.contains('button', 'Gå tilbake til opphold').click()
              cy.contains('Opphold utenfor Norge').should('exist')
              cy.contains(
                'Har du bodd eller jobbet mer enn 5 år utenfor Norge mellom fylte 16 år og uttak av pensjon? Det kan påvirke alderspensjonen din.'
              ).should('exist')
            })
          })
        })
      })

      describe('Som bruker som har så langt opphold utenfor Norge, at trygdetid i Norge blir mindre enn 5 år,', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
          cy.get('[data-testid="utenlandsopphold-land"]').select('Afghanistan')
          cy.get('[data-testid="utenlandsopphold-startdato"]').type(
            '01.06.1964'
          )
          cy.get('[data-testid="legg-til-utenlandsopphold-submit"]').click()
          cy.contains('button', 'Neste').click()
        })

        describe('Som bruker som navigerer til resultatsiden,', () => {
          beforeEach(() => {
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').last().check()
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').last().check()
            cy.contains('button', 'Neste').click()
          })

          describe('Når har valgt alder jeg ønsker beregning fra,', () => {
            beforeEach(() => {
              cy.intercept(
                {
                  method: 'POST',
                  url: '/pensjon/kalkulator/api/v8/alderspensjon/simulering',
                },
                { fixture: 'alderspensjon_for_lite_trygdetid.json' }
              ).as('fetchAlderspensjon')
              cy.contains('button', '70 år').click({ force: true })
            })

            it('forventer jeg at det i grunnlaget står at jeg har opphold i Norge på "mindre enn 5 år".', () => {
              cy.contains('Opphold i Norge:').should('exist')
              cy.contains('Mindre enn 5 år').should('exist')
            })

            it('forventer informasjon om at beregningen kan være mangelfull.', () => {
              cy.contains(
                'Du har bodd mindre enn 5 år i Norge. Beregningen din kan være mangelfull.'
              ).should('exist')
            })

            it('forventer å kunne trykke i grunnlaget for å se listen over mine opphold.', () => {
              cy.contains('Opphold i Norge:').click({ force: true })
              cy.contains('Oppholdene dine utenfor Norge').should('exist')
              cy.contains('Afghanistan').should('exist')
              cy.contains('Periode: 01.06.1964 (Varig opphold)').should('exist')
            })

            it('forventer å kunne gå tilbake til "opphold utenfor Norge".', () => {
              cy.contains('Opphold i Norge:').click({ force: true })
              cy.contains('a', 'Opphold utenfor Norge').click()
              cy.contains(
                'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.'
              ).should('exist')
              cy.contains('button', 'Gå tilbake til opphold').click()
              cy.contains('Opphold utenfor Norge').should('exist')
              cy.contains(
                'Har du bodd eller jobbet mer enn 5 år utenfor Norge mellom fylte 16 år og uttak av pensjon? Det kan påvirke alderspensjonen din.'
              ).should('exist')
            })
          })
        })
      })
    })

    describe('Som bruker som svarer "nei" på mer enn 5 år i utlandet,', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').last().check({ force: true })
      })

      describe('Som bruker som navigerer til resultatsiden,', () => {
        beforeEach(() => {
          cy.contains('button', 'Neste').click()
          cy.get('[type="radio"]').last().check()
          cy.contains('button', 'Neste').click()
          cy.get('[type="radio"]').last().check()
          cy.contains('button', 'Neste').click()
        })

        describe('Når har valgt alder jeg ønsker beregning fra,', () => {
          beforeEach(() => {
            cy.contains('button', '70 år').click({ force: true })
          })

          it('forventer jeg at det i grunnlaget står at jeg har opphold utenfor Norge på "5 år eller mindre".', () => {
            cy.contains('Opphold utenfor Norge:').should('exist')
            cy.contains('5 år eller mindre').should('exist')
          })

          it('forventer å kunne gå tilbake til "opphold utenfor Norge".', () => {
            cy.contains('Opphold utenfor Norge:').click({ force: true })
            cy.contains('a', 'Opphold utenfor Norge').click()
            cy.contains(
              'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.'
            ).should('exist')
            cy.contains('button', 'Gå tilbake til opphold').click()
            cy.contains('Opphold utenfor Norge').should('exist')
            cy.contains(
              'Har du bodd eller jobbet mer enn 5 år utenfor Norge mellom fylte 16 år og uttak av pensjon? Det kan påvirke alderspensjonen din.'
            ).should('exist')
          })
        })
      })
    })
  })
})

export {}
