import { format, sub } from 'date-fns'

import loependeVedtakMock from '../../../fixtures/loepende-vedtak.json'
import personMock from '../../../fixtures/person.json'

// https://jira.adeo.no/secure/Tests.jspa#/testCase/PEK-T1

describe('Hovedhistorie', () => {
  describe('Når jeg som bruker navigerer på nav.no/din pensjon og velger å prøve den nye kalkulatoren,', () => {
    // 1
    it('ønsker jeg å få informasjon om ny kalkulator og om jeg er i målgruppen for å bruke den.', () => {
      cy.visit('https://www.nav.no/planlegger-pensjon')
      cy.contains('a', 'Prøv pensjonskalkulatoren')
        .should('be.visible')
        .should('have.attr', 'href')
        .and('include', 'https://www.nav.no/pensjon/kalkulator/login')
    })
  })

  describe('Gitt at jeg som bruker ikke er pålogget,', () => {
    beforeEach(() => {
      cy.intercept('GET', '/pensjon/kalkulator/oauth2/session', {
        statusCode: 401,
      }).as('getAuthSession')
      cy.visit('/pensjon/kalkulator/')
      cy.wait('@getAuthSession')
    })

    describe('Hvis jeg ikke er i målgruppen for ny kalkulator eller ikke bør bruke kalkulatoren,', () => {
      // 2
      it('forventer jeg tilgang til detaljert kalkulator og uinnlogget kalkulator.', () => {
        cy.contains('button', 'Logg inn i pensjonskalkulator').should('exist')
        cy.contains('button', 'Logg inn i detaljert pensjonskalkulator').click()
        cy.origin('https://www.nav.no', () => {
          cy.on('uncaught:exception', () => {
            return false
          })
        })
        cy.location('pathname').should(
          'eq',
          '/pensjon/kalkulator/redirect/detaljert-kalkulator'
        )

        cy.visit('/pensjon/kalkulator/')
        cy.contains('button', 'Uinnlogget kalkulator').click()

        cy.location('href', { timeout: 0 }).should(
          'eq',
          'https://www.nav.no/pensjon/uinnlogget-kalkulator'
        )
      })
    })

    // 3
    describe('Når jeg vil logge inn for å teste kalkulatoren,', () => {
      it('forventer jeg å kunne logge inn med ID-porten.', () => {
        cy.contains('button', 'Logg inn i pensjonskalkulator').click()
        cy.location('href').should(
          'eq',
          'http://localhost:4173/pensjon/kalkulator/oauth2/login?redirect=%2Fpensjon%2Fkalkulator%2Fstart'
        )
      })
      it('ønsker jeg informasjon om hvilke personopplysninger som brukes i kalkulatoren.', () => {
        cy.contains('a', 'Personopplysninger som brukes i pensjonskalkulator')
          .should('have.attr', 'href')
          .and(
            'include',
            'https://www.nav.no/personopplysninger-i-pensjonskalkulator'
          )
      })
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren,', () => {
    const foedselsdatoMindreEnn75 = format(
      sub(new Date(), { years: 65, months: 1, days: 5 }),
      'yyyy-MM-dd'
    )

    const foedselsdato75Plus1Maaned = format(
      sub(new Date(), { years: 75, months: 1, days: 5 }),
      'yyyy-MM-dd'
    )

    // 4
    describe('Når jeg navigerer videre fra /login til /start og er yngre enn 75 år,', () => {
      beforeEach(() => {
        cy.visit('/pensjon/kalkulator/')
        cy.wait('@getAuthSession')
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
          {
            ...personMock,
            foedselsdato: foedselsdatoMindreEnn75,
          }
        ).as('getPerson')
      })

      it('forventer jeg å se en startside som ønsker meg velkommen.', () => {
        cy.contains('button', 'Detaljert pensjonskalkulator').should('exist')
        cy.contains('button', 'Pensjonskalkulator').click()
        cy.contains('Hei Aprikos!')
      })

      it('ønsker jeg informasjon om hvilke personopplysninger som brukes i kalkulatoren.', () => {
        cy.contains('button', 'Pensjonskalkulator').click()
        cy.contains('a', 'Personopplysninger som brukes i pensjonskalkulator')
          .should('have.attr', 'href')
          .and(
            'include',
            'https://www.nav.no/personopplysninger-i-pensjonskalkulator'
          )
      })

      it('ønsker jeg å kunne starte kalkulatoren eller avbryte beregningen.', () => {
        cy.contains('button', 'Pensjonskalkulator').click()
        cy.contains('button', 'Kom i gang').click()
        cy.location('href').should('include', '/pensjon/kalkulator/sivilstand')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })

    // 5
    describe('Når jeg navigerer videre fra /login til /start og har fyllt 75 år plus 1 måned,', () => {
      beforeEach(() => {
        cy.visit('/pensjon/kalkulator/')
        cy.wait('@getAuthSession')
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
          {
            ...personMock,
            foedselsdato: foedselsdato75Plus1Maaned,
          }
        ).as('getPerson')
        cy.contains('button', 'Detaljert pensjonskalkulator').should(
          'be.visible'
        )
        cy.contains('button', 'Pensjonskalkulator').click()
      })

      it('forventer jeg å se en startside som sier at jeg desverre kan ikke beregne pensjon.', () => {
        cy.get('[data-testid="start-brukere-fyllt-75-ingress"]').should(
          'be.visible'
        )
      })

      it('forventer jeg å se og navigere til "kontakte oss" lenke.', () => {
        cy.window().then((win) => {
          cy.stub(win, 'open').as('windowOpen')
        })

        cy.get('[data-testid="start-brukere-fyllt-75-ingress"] a')
          .should('exist')
          .and('be.visible')
          .then(($el) => {
            const anchorElement = $el[0]
            expect(anchorElement.getAttribute('href')).to.include(
              '/planlegger-pensjon#noe-du-ikke-finner-svaret-p-her'
            )
            anchorElement.removeAttribute('target') // Ensures to open the link in same window as Cypress cannot handle multiple tabs
            anchorElement.click()
          })

        cy.get('@windowOpen').should(
          'be.calledWith',
          'https://www.nav.no/planlegger-pensjon#noe-du-ikke-finner-svaret-p-her'
        )
      })

      it('kan jeg navigere til "Din pensjon" side.', () => {
        const dinPensjonButton = cy.get(
          '[data-testid="start-brukere-fyllt-75-din-pensjon-button"]'
        )

        dinPensjonButton.should('be.visible')
        dinPensjonButton.click()
        cy.location('href').should(
          'include',
          '/pensjon/selvbetjening/dinpensjon'
        )
      })

      it('kan jeg avbryte og navigere til login side.', () => {
        const avbrytButton = cy.get(
          '[data-testid="start-brukere-fyllt-75-avbryt-button"]'
        )
        avbrytButton.should('be.visible')
        avbrytButton.click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })

    // 6
    describe('Som bruker som har fremtidig vedtak om alderspensjon,', () => {
      describe('Når jeg navigerer videre fra /login til /start,', () => {
        beforeEach(() => {
          cy.intercept(
            {
              method: 'GET',
              url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
            },
            {
              ...loependeVedtakMock,
              fremtidigAlderspensjon: {
                grad: 100,
                fom: '2099-01-01',
              },
            } satisfies LoependeVedtak
          ).as('getLoependeVedtak')
          cy.login()
        })
        it('forventer jeg informasjon om at jeg har vedtak med 100 % alderspensjon fra dato 01.01.2099.', () => {
          cy.contains(
            'Du har vedtak om 100 % alderspensjon fra 01.01.2099. Du kan gjøre en ny beregning her frem til uttak.'
          )
        })
      })
    })

    // 7
    describe('Som bruker som er registrert med en annen sivilstand enn gift, registrert partner eller samboer,', () => {
      describe('Når jeg navigerer videre fra /start til neste steg,', () => {
        beforeEach(() => {
          cy.login()
          cy.contains('button', 'Kom i gang').click()
        })
        it('forventer jeg informasjon om hvilken sivilstand jeg er registrert med.', () => {
          cy.contains('h2', 'Sivilstand').should('exist')
          cy.get('select[name="sivilstand"]').should('have.value', 'UGIFT')
        })
        it('forventer jeg å få muligheten til å endre sivilstand for å få riktig beregning.', () => {
          cy.get('select[name="sivilstand"]').select('GIFT')
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må svare på om ektefellen din vil motta pensjon eller uføretrygd fra folketrygden, eller AFP.'
          ).should('exist')
          cy.get('[type="radio"]').first().check({ force: true })
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må svare på om ektefellen din vil motta pensjon eller uføretrygd fra folketrygden, eller AFP.'
          ).should('not.exist')
        })
        it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
          cy.contains('button', 'Tilbake').click()
          cy.location('href').should('include', '/pensjon/kalkulator/start')
          cy.go('forward')
          cy.contains('button', 'Avbryt').click()
          cy.location('href').should('include', '/pensjon/kalkulator/login')
        })
      })
    })

    // 8
    describe('Som bruker som har sivilstand gift, registrert partner eller samboer,', () => {
      describe('Når jeg navigerer videre fra /start til neste steg,', () => {
        beforeEach(() => {
          cy.intercept(
            { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
            {
              navn: 'Aprikos',
              sivilstand: 'GIFT',
              foedselsdato: '1963-04-30',
              pensjoneringAldre: {
                normertPensjoneringsalder: {
                  aar: 67,
                  maaneder: 0,
                },
                nedreAldersgrense: {
                  aar: 62,
                  maaneder: 0,
                },
              },
            }
          ).as('getPerson')
          cy.login()
          cy.contains('button', 'Kom i gang').click()
        })
        it('forventer jeg informasjon om hvilken sivilstand jeg er registrert med.', () => {
          cy.contains('h2', 'Sivilstand').should('exist')
          cy.get('select[name="sivilstand"]').should('have.value', 'GIFT')
        })
        it('forventer jeg å få muligheten til å endre sivilstand for å få riktig beregning.', () => {
          cy.get('select[name="sivilstand"]').select('UGIFT')
          cy.contains('button', 'Neste').click()
        })
        it('forventer jeg å måtte oppgi om E/P/S mottar pensjon, uføretrygd eller AFP.', () => {
          cy.get('select[name="sivilstand"]').should('have.value', 'GIFT')
          cy.get('[type="radio"]')
            .first()
            .check({ force: true })
            .should('be.checked')
          cy.contains('button', 'Neste').click()
        })
        it('forventer jeg å måtte oppgi om E/P/S har inntekt over 2G når bruker har svart "nei" på at EPS har pensjon.', () => {
          cy.get('select[name="sivilstand"]').should('have.value', 'GIFT')
          cy.get('[type="radio"][name="epsHarPensjon"][value="nei"]')
            .check({ force: true })
            .should('be.checked')
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må svare på om ektefellen din vil ha inntekt over 2G.'
          ).should('exist')
          cy.get('[type="radio"][name="epsHarInntektOver2G"][value="ja"]')
            .check({ force: true })
            .should('be.checked')
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må svare på om ektefellen din vil ha inntekt over 2G.'
          ).should('not.exist')
        })
        it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
          cy.contains('button', 'Tilbake').click()
          cy.location('href').should('include', '/pensjon/kalkulator/start')
          cy.go('forward')
          cy.contains('button', 'Avbryt').click()
          cy.location('href').should('include', '/pensjon/kalkulator/login')
        })
      })
    })

    // 9
    describe('Når jeg navigerer videre fra sivilstand til neste steg,', () => {
      beforeEach(() => {
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
          {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          }
        ).as('getPerson')
        cy.login()
        cy.contains('button', 'Kom i gang').click()
        cy.contains('button', 'Neste').click()
      })
      it('forventer jeg å bli spurt om jeg har bodd/jobbet mer enn 5 år utenfor Norge.', () => {
        cy.contains('h2', 'Opphold utenfor Norge').should('exist')
        cy.contains(
          'Har du bodd eller jobbet utenfor Norge i mer enn 5 år?'
        ).should('exist')
      })
      it('forventer jeg å måtte svare ja/nei på spørsmål om tid utenfor Norge.', () => {
        cy.contains('button', 'Neste').click()
        cy.contains(
          'Du må svare på om du har bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år.'
        ).should('exist')
        cy.get('[type="radio"]').first().check()
        cy.contains(
          'Du må svare på om du har bodd eller jobbet utenfor Norge i mer enn 5 år etter fylte 16 år.'
        ).should('not.exist')
        cy.contains('button', 'Neste').click()
      })
      it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
        cy.contains('button', 'Tilbake').click()
        cy.location('href').should('include', '/pensjon/kalkulator/sivilstand')
        cy.go('forward')
        cy.contains('button', 'Avbryt').click()
        cy.location('href').should('include', '/pensjon/kalkulator/login')
      })
    })

    describe('Gitt at jeg som bruker svarer nei på bodd/jobbet mer enn 5 år utenfor Norge,', () => {
      // 10
      describe('Når jeg navigerer videre til /afp,', () => {
        beforeEach(() => {
          cy.login()
          cy.contains('button', 'Kom i gang').click()
          cy.contains('button', 'Neste').click()
          cy.get('[type="radio"]').last().check()
          cy.contains('button', 'Neste').click()
        })
        it('forventer jeg å få informasjon om AFP og muligheten for å velge om jeg ønsker å beregne AFP.', () => {
          cy.contains('h2', 'AFP (avtalefestet pensjon)').should('exist')
          cy.get('[data-testid="om_livsvarig_AFP_i_offentlig_sektor"]').click()
          cy.get('[data-testid="om_livsvarig_AFP_i_privat_sektor"]').click()
        })
        it('forventer jeg å måtte velge om jeg vil beregne med eller uten AFP både i privat og offentlig sektor. Jeg må kunne svare nei for å bare beregne alderspensjon, eller vet ikke hvis jeg er usikker.', () => {
          cy.contains('Har du rett til AFP?').should('exist')
          cy.contains('Ja, i offentlig sektor').should('exist')
          cy.contains('Ja, i privat sektor').should('exist')
          cy.contains('Nei').should('exist')
          cy.contains('Vet ikke').should('exist')
          cy.contains('button', 'Neste').click()
          cy.contains('Du må svare på om du har rett til AFP.').should('exist')
          cy.get('[type="radio"]').last().check()
          cy.contains('Du må svare på om du har rett til AFP.').should(
            'not.exist'
          )
          cy.contains('button', 'Neste').click()
        })
        it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
          cy.contains('button', 'Tilbake').click()
          cy.location('href').should(
            'include',
            '/pensjon/kalkulator/utenlandsopphold'
          )
          cy.go('forward')
          cy.contains('button', 'Avbryt').click()
          cy.location('href').should('include', '/pensjon/kalkulator/login')
        })
      })

      // 11
      describe('Gitt at jeg som bruker har svart "ja, offentlig" på spørsmålet om AFP,', () => {
        describe('Når jeg navigerer videre fra /afp til /samtykke-offentlig-afp,', () => {
          beforeEach(() => {
            cy.login()
            cy.contains('button', 'Kom i gang').click()
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').last().check()
            cy.contains('button', 'Neste').click()
            cy.get('[type="radio"]').first().check()
            cy.contains('button', 'Neste').click()
          })
          it('forventer jeg å bli spurt om mitt samtykke for beregning av offentlig-AFP, og få informasjon om hva samtykket innebærer.', () => {
            cy.contains(
              'h2',
              'Samtykke til at Nav beregner AFP (avtalefestet pensjon)'
            ).should('exist')
            cy.contains('Vil du at Nav skal beregne AFP for deg?').should(
              'exist'
            )
            cy.contains('button', 'Neste').click()
            cy.contains(
              'Du må svare på om du vil at Nav skal beregne AFP for deg.'
            ).should('exist')
            cy.get('[type="radio"]').last().check()
            cy.contains(
              'Du må svare på om du vil at Nav skal beregne AFP for deg.'
            ).should('not.exist')
            cy.contains('button', 'Neste').click()
          })

          it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
            cy.contains('button', 'Tilbake').click()
            cy.location('href').should('include', '/pensjon/kalkulator/afp')
            cy.go('forward')
            cy.contains('button', 'Avbryt').click()
            cy.location('href').should('include', '/pensjon/kalkulator/login')
          })
        })
      })

      // 12
      describe('Når jeg navigerer videre til /samtykke,', () => {
        beforeEach(() => {
          cy.login()
          cy.contains('button', 'Kom i gang').click()
          cy.contains('button', 'Neste').click()
          cy.get('[type="radio"]').last().check()
          cy.contains('button', 'Neste').click()
          cy.get('[type="radio"]').last().check()
          cy.contains('button', 'Neste').click()
        })
        it('forventer jeg å bli spurt om mitt samtykke, og få informasjon om hva samtykket innebærer.', () => {
          cy.contains('h2', 'Pensjonsavtaler').should('exist')
          cy.contains('Skal vi hente pensjonsavtalene dine?').should('exist')
          cy.get('[data-testid="dette_henter_vi_OFTP"]').should('exist')
          cy.get('[data-testid="dette_henter_vi_NP"]').should('exist')
        })
        it('forventer jeg å måtte svare ja/nei på spørsmål om samtykke for å hente mine avtaler eller om jeg ønsker å gå videre med bare alderspensjon.', () => {
          cy.contains('button', 'Neste').click()
          cy.contains(
            'Du må svare på om du vil at vi skal hente dine pensjonsavtaler.'
          ).should('exist')
          cy.get('[type="radio"]').last().check()
          cy.contains(
            'Du må svare på om du vil at vi skal hente dine pensjonsavtaler.'
          ).should('not.exist')
          cy.contains('button', 'Neste').click()
        })
        it('ønsker jeg å kunne gå tilbake til forrige steg, eller avbryte beregningen.', () => {
          cy.contains('button', 'Tilbake').click()
          cy.location('href').should('include', '/pensjon/kalkulator/afp')
          cy.go('forward')
          cy.contains('button', 'Avbryt').click()
          cy.location('href').should('include', '/pensjon/kalkulator/login')
        })
      })
    })

    // 13
    describe('Når jeg venter på at resultatet kommer fram,', () => {
      it('forventer jeg en melding dersom det tar tid før resultatet kommer opp.', () => {
        cy.login()
        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/tidligste-hel-uttaksalder',
          },
          (req) => {
            req.on('response', (res) => {
              res.setDelay(1000)
            })
          }
        )
        cy.fillOutStegvisning({})
        cy.get('[data-testid="uttaksalder-loader"]').should('exist')
      })
    })

    // 14
    describe('Når jeg er kommet til beregningssiden,', () => {
      it('ønsker jeg som er født i 1963 informasjon om når jeg tidligst kan starte uttak av pensjon.', () => {
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
          {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          }
        ).as('getPerson')
        cy.login()
        cy.fillOutStegvisning({})
        cy.wait('@fetchTidligsteUttaksalder')
        cy.contains(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        ).should('exist')
        cy.contains('62 år og 10 måneder').should('exist')
        cy.contains(
          'Hvis du venter lenger med uttaket, vil den årlige pensjonen din øke.'
        ).should('exist')
      })
      it('ønsker jeg som er født fom. 1964 informasjon om når jeg tidligst kan starte uttak av pensjon.', () => {
        cy.intercept(
          { method: 'GET', url: '/pensjon/kalkulator/api/v4/person' },
          {
            navn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1964-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          }
        ).as('getPerson')
        cy.login()
        cy.fillOutStegvisning({})
        cy.wait('@fetchTidligsteUttaksalder')
        cy.contains(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        ).should('exist')
        cy.contains('62 år og 10 måneder').should('exist')
        cy.contains(
          'Det kan bli senere fordi pensjonsalderen i Norge øker.'
        ).should('exist')
      })
      it('må jeg kunne trykke på Readmore for å få mer informasjon om tidspunktet for tidligst uttak.', () => {
        cy.login()
        cy.fillOutStegvisning({})
        cy.wait('@fetchTidligsteUttaksalder')
        cy.get('[data-testid="om_TMU"]').should('exist')
      })

      it('forventer jeg å få knapper jeg kan trykke på for å velge og sammenligne ulike uttakstidspunkt. Bruker må også kunne sammenligne uttak mellom 62 år og 10 md. (første mulige) og 75 år.', () => {
        cy.login()
        cy.fillOutStegvisning({})
        cy.wait('@fetchTidligsteUttaksalder')
        cy.get('.VelgUttaksalder--wrapper button').should('have.length', 14)
        cy.contains('button', '62 år og 10 md.').should('exist')
        cy.contains('button', '75 år').should('exist')
      })
    })

    // 15
    describe('Når jeg velger hvilken alder jeg ønsker beregning fra,', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. Jeg forventer å kunne velge ny uttaksalder for å sammenligne hvordan pensjon blir ved ulike uttaksaldre.', () => {
        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('AFP (avtalefestet pensjon)').should('exist')
        cy.contains('Pensjonsavtaler (arbeidsgivere m.m.)').should('exist')
        cy.contains('Alderspensjon (Nav)').should('exist')
        cy.contains('Tusen kroner').should('be.visible')
        cy.contains('61').should('be.visible')
        cy.contains('87+').should('exist')
        cy.contains('button', '70 år').click({ force: true })
        cy.contains('61').should('not.be.visible')
        cy.contains('69').should('be.visible')
        cy.contains('87+').should('exist')
        cy.contains('Klikk på søylene for detaljer').should('exist')
      })

      it('forventer jeg en egen tabell med oversikt over mine pensjonsavtaler. Jeg må kunne trykke på trykk vis mer for å se all informasjon, og vis mindre for å skjule informasjon om pensjonsavtaler.', () => {
        cy.contains('button', '70').click()
        cy.contains('Pensjonsavtaler').should('be.visible')
        cy.get('[data-testid="showmore-button"]').click()
        cy.contains('Andre avtaler').should('be.visible')
        cy.contains('Privat tjenestepensjon').should('be.visible')
        cy.contains('Individuelle ordninger').should('be.visible')
        cy.contains('Vis mindre').should('be.visible')
      })

      it('forventer jeg å få informasjon om inntekten og pensjonen din. Jeg må kunne trykke på de ulike faktorene for å få opp mer informasjon.', () => {
        cy.contains('button', '70').click()
        cy.contains('Om inntekten og pensjonen din').should('exist')
        cy.contains('Pensjonsgivende inntekt frem til uttak').should('exist')
        cy.contains('Sivilstand:').click({ force: true })
        cy.contains('Opphold utenfor Norge:').click({ force: true })
        cy.contains('AFP:').should('exist')
      })

      it('forventer jeg å kunne lese enkle forbehold, og få lenke til utfyllende forbehold.', () => {
        cy.contains('button', '70').click()
        cy.contains('Forbehold').should('exist')
        cy.contains('a', 'Alle forbehold')
          .should('have.attr', 'href')
          .and('include', '/pensjon/kalkulator/forbehold')
      })

      it('ønsker jeg å kunne starte ny beregning.', () => {
        cy.contains('button', '62 år og 10 md.').click()
        cy.contains('button', 'Tilbake til start').click({ force: true })
        cy.contains('button', 'Gå tilbake til start').click({ force: true })
        cy.location('href').should('include', '/pensjon/kalkulator/start')
      })
    })

    // 16
    describe('Når jeg foretrekker tabell frem for graf,', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('ønsker jeg å få resultatet presentert i både graf og tabell, og mulighet til å lukke/åpne tabellen.', () => {
        cy.contains('button', '70').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Vis tabell av beregningen').click({ force: true })
        cy.contains('Lukk tabell av beregningen').should('exist')
        cy.contains('Alder').should('exist')
        cy.contains('Sum (kr)').should('exist')
        cy.get('.navds-table__toggle-expand-button')
          .first()
          .click({ force: true })
        cy.contains('0').should('exist')
        cy.contains('dt', 'Pensjonsgivende inntekt').should('exist')
        cy.contains('dt', 'AFP (avtalefestet pensjon)').should('exist')
        cy.contains('dt', 'Pensjonsavtaler (arbeidsgivere m.m.)').should(
          'exist'
        )
        cy.contains('dt', 'Alderspensjon (Nav)').should('exist')
      })
    })

    // 17
    describe('Når jeg endrer fremtidig inntekt,', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('ønsker jeg at tidligste uttakstidspunkt oppdateres og at knapper jeg kan trykke på for å velge uttakstidspunkt tilpasses oppdatert uttakstidspunkt.', () => {
        cy.contains('button', '70').click()
        cy.get('.highcharts-series-group .highcharts-series-0 path')
          .first()
          .click()
        cy.contains('Pensjonsgivende inntekt frem til uttak').should('exist')
        cy.contains('521 338 kr').should('exist')
        cy.contains(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er 62 år og 10 måneder'
        ).should('exist')

        cy.intercept(
          {
            method: 'POST',
            url: '/pensjon/kalkulator/api/v2/tidligste-hel-uttaksalder',
          },
          {
            aar: 67,
            maaneder: 0,
          }
        ).as('fetchTidligsteUttaksalder')
        cy.contains('Pensjonsgivende inntekt frem til uttak')
        cy.contains('button', 'Endre inntekt').click()
        cy.get('[data-testid="inntekt-textfield"]').type('0')
        cy.contains('button', 'Oppdater inntekt').click()
        cy.get('62 år og 10 måneder').should('not.exist')
        cy.contains(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er 67 år.'
        ).should('exist')
      })

      it('ønsker jeg å få resultatet oppdatert i graf og tabell og å kunne endre inntekt flere ganger for å sammenligne pensjon ved ulike inntekter.', () => {
        cy.contains('button', '70').click()
        cy.get('.highcharts-series-group .highcharts-series-0 path')
          .first()
          .click()
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('521 338 kr').should('exist')

        cy.contains('button', 'Endre inntekt').click()
        cy.get('[data-testid="inntekt-textfield"]').type('100000')
        cy.contains('button', 'Oppdater inntekt').click()
        cy.get('[data-testid="alert-inntekt"]').should('exist')

        cy.contains('button', '70').click()
        cy.get('[data-testid="alert-inntekt"]').should('not.exist')
        cy.get('.highcharts-series-group .highcharts-series-0 path')
          .first()
          .click({ force: true })
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('100 000 kr').should('exist')
        cy.contains('Vis tabell av beregningen').click({ force: true })
        cy.get('.TabellVisning--table tbody tr').first().click({ force: true })
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('100 000').should('exist')

        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('button', 'Endre inntekt').click()
        cy.get('[data-testid="inntekt-textfield"]').clear().type('800000')
        cy.contains('button', 'Oppdater inntekt').click()

        cy.contains('button', '70').click()
        cy.contains(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er 521 338 kr'
        ).should('exist')
        cy.get('.highcharts-series-group .highcharts-series-0 path')
          .first()
          .click()
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('800 000 kr').should('exist')
      })

      it('ønsker jeg å kunne starte på nytt og at inntekt da er tilbake til siste årsinntekt.', () => {
        cy.contains('button', '70').click()
        cy.get('.highcharts-series-group .highcharts-series-0 path')
          .first()
          .click()
        cy.contains('Pensjonsgivende inntekt').should('exist')
        cy.contains('521 338 kr').should('exist')
        cy.contains(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er 521 338 kr'
        ).should('exist')

        cy.contains('button', 'Endre inntekt').click()
        cy.get('[data-testid="inntekt-textfield"]').type('100000')
        cy.contains('button', 'Oppdater inntekt').click()
        cy.contains('button', '70').click()
        cy.contains(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er 521 338 kr'
        ).should('exist')

        cy.contains('button', 'Tilbake til start').click({ force: true })
        cy.contains('button', 'Gå tilbake til start').click({ force: true })
        cy.fillOutStegvisning({ afp: 'ja_privat', samtykke: true })
        cy.wait('@fetchTidligsteUttaksalder')
        cy.contains('button', '70').click()
        cy.contains(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er 521 338 kr'
        ).should('exist')
      })
    })
  })
})

export {}
