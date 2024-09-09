describe('Utland', () => {
  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    beforeEach(() => {
      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.get('[type="radio"]').last().check({ force: true })
      cy.contains('button', 'Neste').click()
    })

    describe.skip('Når jeg har navigert til steget for utenlandsopphold,', () => {
      it('forventer jeg å bli spurt om jeg har bodd/jobbet mer enn 5 år utenfor Norge.', () => {
        cy.contains('h2', 'Opphold utenfor Norge').should('exist')
        cy.contains(
          'Har du bodd eller jobbet utenfor Norge i mer enn 5 år?'
        ).should('exist')
      })

      it('forventer jeg ikke å få en knapp for å legge til opphold', () => {
        cy.contains('Legg til opphold').should('not.exist')
      })
    })

    describe.skip('Når jeg har svart "ja" på spørsmål om jeg har bodd eller jobbet mer enn 5 år utenfor Norge', () => {
      it('forventer jeg å få en knapp for å legge til opphold', () => {
        cy.get('[type="radio"]').first().check({ force: true })
        cy.contains('Legg til opphold').should('exist')
      })
    })

    describe('Som bruker som svarer "ja" på mer enn 5 år i utlandet', () => {
      beforeEach(() => {
        cy.get('[type="radio"]').first().check({ force: true })
      })

      describe.skip('Når jeg trykker «neste» uten å legge til opphold', () => {
        it('forventer jeg beskjed om at jeg må legge til minst ett opphold, eller svare nei', () => {
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må legge til minst ett opphold eller svare «Nei» på om du har bodd eller jobbet utenfor Norge i mer enn 5 år.'
          ).should('exist')
        })
      })

      describe.skip('Når jeg trykker på "legg til opphold"', () => {
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
              expect(options.length).equal(253)
              expect(options.eq(1).text()).equal('Afghanistan')
              expect(options.eq(252).text()).equal('Åland')
            }
          )
        })

        describe.skip('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett avtaleland, unntatt nordiske land og Nederland.', () => {
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

          it('forventer jeg å kunne trykk «legg til opphold» og registrere opphold med eller uten sluttdato.', () => {
            cy.get(
              '[data-testid="utenlandsopphold-arbeidet-utenlands-ja"]'
            ).check()
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.contains('button', 'Legg til opphold').click()

            cy.contains('button', 'Legg til nytt opphold').click()
            cy.get('[data-testid="utenlandsopphold-land"]').select('Spania')
            cy.get(
              '[data-testid="utenlandsopphold-arbeidet-utenlands-nei"]'
            ).check()
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '01.06.1980'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
              '31.12.1982'
            )
            cy.contains('button', 'Legg til opphold').click()
          })
        })

        describe.skip('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett ikke avtaleland, unntatt nordiske land og Nederland.', () => {
          beforeEach(() => {
            cy.get('[data-testid="utenlandsopphold-land"]').select(
              'Afghanistan'
            )
          })

          it('forventer jeg å ikke få spørsmålom jeg har jobbet i landet eller ikke.', () => {
            cy.contains('Jobbet du i Afghanistan?').should('not.exist')
          })

          it('forventer jeg å kunne oppgi startdato og sluttdato for oppholdet.', () => {
            cy.contains('Oppgi startdato').should('be.visible')
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.contains('Oppgi sluttdato').should('be.visible')
          })

          it('forventer jeg å kunne trykk «legg til opphold» og registrere opphold med eller uten sluttdato.', () => {
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '12.01.1990'
            )
            cy.contains('button', 'Legg til opphold').click()

            cy.contains('button', 'Legg til nytt opphold').click()
            cy.get('[data-testid="utenlandsopphold-land"]').select(
              'Afghanistan'
            )
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '01.06.1980'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
              '31.12.1982'
            )
            cy.contains('button', 'Legg til opphold').click()
          })
        })
      })

      describe.skip('Når jeg har lagt til utenlandsopphold', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
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
          cy.contains('button', 'Legg til opphold').click()
        })

        it('forventer jeg å få en tabell/liste over utenlandsopphold jeg har lagt til.', () => {
          cy.contains('Oppholdene dine utenfor Norge').should('exist')
          cy.contains('Frankrike').should('exist')
          cy.contains('Periode: 01.06.1980–31.12.1982').should('exist')
          cy.contains('Jobbet: Nei').should('exist')
        })

        it('forventer jeg å kunne endre eller slett oppholdet.', () => {
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

      describe('Som bruker som har allerede lagt til et utenlandsopphold', () => {
        beforeEach(() => {
          cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
            force: true,
          })
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
          cy.contains('button', 'Legg til opphold').click()
        })

        describe('Når jeg legger til et overlappende utenlandsopphold i et annet land', () => {
          it('forventer jeg at knappen har endret seg fra "legg til opphold" til "legg til nytt opphold".', () => {
            cy.get('[data-testid="legg-til-utenlandsopphold"]').click({
              force: true,
            })
            cy.get('[data-testid="utenlandsopphold-land"]').select('Spania')
            cy.get(
              '[data-testid="utenlandsopphold-arbeidet-utenlands-nei"]'
            ).check()
            cy.get('[data-testid="utenlandsopphold-startdato"]').type(
              '30.04.1981'
            )
            cy.get('[data-testid="utenlandsopphold-sluttdato"]').type(
              '31.12.1981'
            )
            cy.contains('button', 'Legg til opphold').click()
            cy.contains(
              'Du har allerede registrert at du har bodd i Frankrike fra 01.06.1980 til 31.12.1982. Du kan ikke ha overlappende opphold i to ulike land.'
            ).should('exist')
          })
        })
      })
    })
  })
})

export {}
