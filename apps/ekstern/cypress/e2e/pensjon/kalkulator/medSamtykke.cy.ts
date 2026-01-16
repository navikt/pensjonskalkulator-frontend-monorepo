const alertTekstStart = 'Beregningen viser kanskje ikke alt.'
const alertTekstAnnenTPO = `${alertTekstStart} Du kan ha rett til offentlig tjenestepensjon. Les mer under pensjonsavtaler.`
const alertTekstNP = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under pensjonsavtaler.`
const alertTekstTPO = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor. Les mer under pensjonsavtaler.`
const alertTekstBegge = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor. Les mer under pensjonsavtaler.`

// https://jira.adeo.no/secure/Tests.jspa#/testCase/PEK-T16

describe('Med samtykke', () => {
  describe('Som bruker som har samtykket til innhenting av avtaler og har TPO-forhold hos SPK,', () => {
    beforeEach(() => {
      cy.login()
    })

    describe('Når NP og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 1
      it('forventer jeg ingen alert', () => {
        cy.contains('button', 'Vis tabell av beregningen').should('exist')
        cy.contains(alertTekstStart).should('not.exist')
      })
    })

    describe('Når NP har feilet og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
          statusCode: 503,
        }).as('fetchPensjonsavtaler')
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 2
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', () => {
        cy.contains(alertTekstNP).should('exist')
      })
    })

    describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
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
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 3
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', () => {
        cy.contains(alertTekstNP).should('exist')
      })
    })

    describe('Når simulering av tjenestepensjon fra SPK svarer med Teknisk feil,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp/fra-1963',
          },
          {
            simuleringsresultatStatus: 'TEKNISK_FEIL',
            muligeTpLeverandoerListe: [],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ samtykke: true })
      })

      describe('Når NP er vellykket,', () => {
        // 5
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', () => {
          cy.contains('button', '67 år').click()
          cy.contains(alertTekstTPO).should('exist')
        })
      })

      describe('Når NP feiler,', () => {
        beforeEach(() => {
          cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
            statusCode: 503,
          }).as('fetchPensjonsavtaler')
          cy.contains('button', '67 år').click()
        })
        // 6
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
          cy.contains(alertTekstBegge).should('exist')
        })
      })

      describe('Når NP feiler gir delvis svar med 0 avtaler,', () => {
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
          cy.contains('button', '67 år').click()
        })
        // 7
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
          cy.contains(alertTekstBegge).should('exist')
        })
      })
    })

    describe('Når simulering av tjenestepensjon fra SPK svarer med tom simulering,', () => {
      beforeEach(() => {
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/simuler-oftp/fra-1963',
          },
          {
            simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
            muligeTpLeverandoerListe: [],
          }
        ).as('fetchOffentligTp')
        cy.fillOutStegvisning({ samtykke: true })
      })

      describe('Når NP er vellykket,', () => {
        // 8
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', () => {
          cy.contains('button', '67 år').click()
          cy.contains(alertTekstTPO).should('exist')
        })
      })

      describe('Når NP feiler,', () => {
        beforeEach(() => {
          cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
            statusCode: 503,
          }).as('fetchPensjonsavtaler')
          cy.contains('button', '67 år').click()
        })
        // 9
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
          cy.contains(alertTekstBegge).should('exist')
        })
      })

      describe('Når NP feiler gir delvis svar med 0 avtaler,', () => {
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
          cy.contains('button', '67 år').click()
        })
        // 10
        it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
          cy.contains(alertTekstBegge).should('exist')
        })
      })
    })
  })

  describe('Som bruker som har samtykket til innhenting av avtaler og IKKE har TPO-forhold,', () => {
    beforeEach(() => {
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
      cy.login()
    })

    describe('Når NP og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 12
      it('forventer jeg ingen alert', () => {
        cy.contains(alertTekstStart).should('not.exist')
      })
    })

    describe('Når NP har feilet og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
          statusCode: 503,
        }).as('fetchPensjonsavtaler')
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 13
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', () => {
        cy.contains(alertTekstNP).should('exist')
      })
    })

    describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
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
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 14
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', () => {
        cy.contains(alertTekstNP).should('exist')
      })
    })
  })

  describe('Som bruker som har samtykket til innhenting av avtaler og har TPO-forhold hos annen ordning enn SPK,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'POST',
          url: '/pensjon/kalkulator/api/v2/simuler-oftp/fra-1963',
        },
        {
          simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
          muligeTpLeverandoerListe: ['KLP'],
        }
      ).as('fetchOffentligTp')
      cy.login()
    })

    describe('Når NP og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 16
      it('forventer jeg melding om at jeg kan ha rett til offentlig tjenestepensjon.', () => {
        cy.contains(alertTekstAnnenTPO).should('exist')
      })
    })

    describe('Når NP har feilet og TPO er vellykket,', () => {
      beforeEach(() => {
        cy.intercept('POST', '/pensjon/kalkulator/api/v3/pensjonsavtaler', {
          statusCode: 503,
        }).as('fetchPensjonsavtaler')
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 17
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
        cy.contains(alertTekstBegge).should('exist')
      })
    })

    describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
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
        cy.fillOutStegvisning({ samtykke: true })
        cy.contains('button', '67 år').click()
      })
      // 18
      it('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', () => {
        cy.contains(alertTekstBegge).should('exist')
      })
    })
  })
})
