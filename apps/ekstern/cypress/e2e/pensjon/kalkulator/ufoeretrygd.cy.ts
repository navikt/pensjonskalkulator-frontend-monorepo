import { format, sub } from 'date-fns'

import loependeVedtakMock from '../../../fixtures/loepende-vedtak.json'
import personMock from '../../../fixtures/person.json'

const fødselsdatoEldreEnn62 = format(
  sub(new Date(), { years: 62, months: 1, days: 5 }),
  'yyyy-MM-dd'
)

describe('Med ufoeretrygd', () => {
  describe('Som bruker som har logget inn på kalkulatoren, mottar uføretrygd og er eldre enn 62 år', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v5/person' },
        {
          ...personMock,
          foedselsdato: fødselsdatoEldreEnn62,
        }
      ).as('getPerson')
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 90 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.contains('button', 'Neste').click() // -> Sivilstand
      cy.get('[type="radio"]').last().check()
      cy.contains('button', 'Neste').click() // -> Opphold utenfor Norge
      cy.get('[type="radio"]').last().check()
    })

    it('forventer jeg å ikke få steget om AFP og at neste steg er "Pensjonsavtaler".', () => {
      cy.contains('Pensjonsavtaler').should('exist')
      cy.contains('Skal vi hente pensjonsavtalene dine?').should('exist')
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren og som mottar uføretrygd,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 90 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
      cy.contains('button', 'Kom i gang').click()
      cy.contains('button', 'Neste').click()
      cy.get('[type="radio"]').last().check()
      cy.contains('button', 'Neste').click()
      cy.contains('button', 'Neste').click()
    })

    describe('Når jeg svarer "nei" på spørsmål om AFP,', () => {
      it('forventer jeg å kunne gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.get('[type="radio"]').eq(2).check()
        cy.contains('button', 'Neste').click()
      })
      it('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', () => {
        cy.get('[type="radio"]').eq(2).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', '67 år').click()
        cy.contains('AFP: Nei').click()
        cy.contains(
          'Du har svart at du ikke har rett til AFP. Derfor vises ikke AFP i beregningen. Du kan endre valgene dine for AFP ved å gå tilbake til AFP (avtalefestet pensjon).'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "vet ikke" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.get('[type="radio"]').eq(3).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should('exist')
        cy.contains(
          'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
        ).should('exist')
        cy.contains(
          'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })
      it('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', () => {
        cy.get('[type="radio"]').eq(3).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', '67 år').click()
        cy.contains('AFP: Vet ikke').click()
        cy.contains(
          'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din.'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should('exist')
        cy.contains(
          'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
        ).should('exist')
        cy.contains(
          'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })
      it('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', () => {
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(0).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', '67 år').click()
        cy.contains('AFP: Offentlig (ikke beregnet)').click()
        cy.contains(
          'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den. Derfor vises ikke AFP i beregningen.'
        ).should('exist')
      })
    })

    describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      it('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', () => {
        cy.contains('Har du rett til AFP?').should('exist')
        cy.contains('Ja, i offentlig sektor').should('exist')
        cy.contains('Ja, i privat sektor').should('exist')
        cy.contains('Nei').should('exist')
        cy.contains('Vet ikke').should('exist')
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('Uføretrygd og AFP (avtalefestet pensjon)').should('exist')
        cy.contains(
          'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
        ).should('exist')
        cy.contains(
          'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
        ).should('exist')
        cy.contains('button', 'Neste').click()
      })
      it('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', () => {
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', 'Neste').click()
        cy.get('[type="radio"]').eq(1).check()
        cy.contains('button', 'Neste').click()
        cy.contains('button', '67 år').click()
        cy.contains('AFP: Privat (ikke beregnet)').click()
        cy.contains(
          'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP. Du må derfor velge mellom AFP og uføretrygd før du er 62 år.'
        ).should('exist')
      })
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren, mottar uføretrygd og er eldre enn 62 år', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/pensjon/kalkulator/api/v5/person' },
        {
          ...personMock,
          foedselsdato: fødselsdatoEldreEnn62,
        }
      ).as('getPerson')
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 90 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
    })

    describe('Når jeg er kommet til beregningssiden,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({})
        cy.contains('button', '67 år').click()
      })

      it('forventer jeg at informasjon om AFP står i grunnlaget.', () => {
        cy.contains('AFP').should('exist')
      })
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren, som mottar 100 % uføretrygd og som ikke har rett til AFP', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 100 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
    })
    describe('Når jeg er kommet til beregningssiden,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({ afp: 'nei' })
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains('Du har 100 % uføretrygd.').should('exist')
      })

      it('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd».', () => {
        cy.get('[data-testid="om_pensjonsalder_UT_hel"]').should('exist')
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

  describe('Som bruker som har logget inn på kalkulatoren, som mottar gradert uføretrygd og som ikke har rett til AFP,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 75 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
    })

    describe('Når jeg er kommet til beregningssiden,', () => {
      beforeEach(() => {
        cy.fillOutStegvisning({ afp: 'nei' })
      })

      it('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', () => {
        cy.contains(
          'Du har 75 % uføretrygd. Her kan du beregne 100 % alderspensjon fra 67 år.'
        ).should('exist')
      })

      it('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd».', () => {
        cy.get('[data-testid="om_pensjonsalder_UT_gradert_enkel"]').should(
          'exist'
        )
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

  describe('Som bruker som har logget inn på kalkulatoren, som mottar 100 % uføretrygd, som ikke har rett til AFP og som ønsker en avansert beregning,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 100 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
      cy.fillOutStegvisning({ afp: 'nei' })
      cy.get('[data-testid="toggle-avansert"]').within(() => {
        cy.contains('Avansert').click()
      })
    })

    describe('Når jeg er kommet til avansert beregning,', () => {
      it('forventer jeg å kunne velge pensjonsalder mellom 67 år + 0 md og 75 år og 0 md.', () => {
        cy.contains('Når vil du ta ut alderspensjon?').should('exist')
        cy.contains('Velg år').should('exist')
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(10)
            expect(options.eq(1).text()).equal('67 år')
            expect(options.eq(9).text()).equal('75 år')
          }
        )
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '67'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('6')
        cy.get('[data-testid="uttaksgrad"]').select('50 %')
        cy.get('[data-testid="age-picker-uttaksalder-gradert-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(10)
            expect(options.eq(1).text()).equal('67 år')
            expect(options.eq(9).text()).equal('75 år')
          }
        )
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(10)
            expect(options.eq(1).text()).equal('67 år')
            expect(options.eq(9).text()).equal('75 år')
          }
        )
      })

      it('forventer jeg å få tilpasset informasjon i read more «Om pensjonsalder og uføretrygd».', () => {
        cy.get('[data-testid="om_pensjonsalder_UT_hel"]').should('exist')
      })
    })
  })

  describe('Som bruker som har logget inn på kalkulatoren, som mottar gradert uføretrygd, som ikke har rett til AFP og som ønsker en avansert beregning,', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 40 },
        } satisfies LoependeVedtak
      ).as('getLoependeVedtak')
      cy.login()
      cy.fillOutStegvisning({ afp: 'nei' })
      cy.get('[data-testid="toggle-avansert"]').within(() => {
        cy.contains('Avansert').click()
      })
    })

    describe('Når jeg er kommet til avansert beregning,', () => {
      it('forventer jeg å kunne velge pensjonsalder mellom 62 år + 0 md og 75 år og 0 md, og jeg kan velge pensjonsalder mellom 67 år + 0 md og 75 år og 0 md for når jeg ønsker øke til hel alderspensjon.', () => {
        cy.contains('Når vil du ta ut alderspensjon?').should('exist')
        cy.contains('Velg år').should('exist')
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(15)
            expect(options.eq(1).text()).equal('62 år')
            expect(options.eq(14).text()).equal('75 år')
          }
        )
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '63'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('6')
        cy.get('[data-testid="uttaksgrad"]').select('50 %')
        cy.get('[data-testid="age-picker-uttaksalder-gradert-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(15)
            expect(options.eq(1).text()).equal('62 år')
            expect(options.eq(14).text()).equal('75 år')
          }
        )
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').then(
          (selectElements) => {
            const options = selectElements.find('option')
            expect(options.length).equal(10)
            expect(options.eq(1).text()).equal('67 år')
            expect(options.eq(9).text()).equal('75 år')
          }
        )
      })

      it('forventer jeg å få tilpasset informasjon i read more «Om pensjonsalder og uføretrygd».', () => {
        cy.get('[data-testid="om_pensjonsalder_UT_gradert_avansert"]').should(
          'exist'
        )
      })
    })

    describe('Når jeg har valgt pensjonsalder mellom 62 år og 0 md og 66 år og 11 md.,', () => {
      beforeEach(() => {
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '63'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('6')
      })

      it('forventer jeg at mulige uttaksgrader begrenses til uttaksgradene som er mulig å kombinere med uføretrygd.', () => {
        cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(5)
          expect(options.eq(1).text()).equal('20 %')
          expect(options.eq(4).text()).equal('60 %')
        })
      })

      it('forventer jeg å få tilpasset informasjon i read more "om uttaksgrad og uføretrygd".', () => {
        cy.get('[data-testid="om_uttaksgrad_UT_gradert"]').should('exist')
      })

      it('forventer jeg tilpasset informasjon om inntekt samtidig som uttak av pensjon.', () => {
        cy.get('[data-testid="uttaksgrad"]').select('50 %')
        cy.contains(
          'Forventer du å ha inntekt samtidig som du tar ut 50 % pensjon?'
        ).should('exist')
        cy.contains(
          'Alderspensjonen påvirker ikke inntektsgrensen for uføretrygden din.'
        ).should('exist')
        cy.contains(
          'button',
          'Om alderspensjon og inntektsgrensen for uføretrygd'
        ).click()
        cy.get('[data-testid="om_alderspensjon_inntektsgrense_UT"]').should(
          'exist'
        )
      })
    })

    describe('Når jeg har valgt pensjonsalder etter 67 år og 0 md.,', () => {
      beforeEach(() => {
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '69'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('3')
      })

      it('forventer jeg å kunne velge alle uttaksgrader.', () => {
        cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(7)
          expect(options.eq(1).text()).equal('20 %')
          expect(options.eq(6).text()).equal('100 %')
        })
      })

      it('forventer jeg å få tilpasset informasjon i read more "om uttaksgrad og uføretrygd".', () => {
        cy.get('[data-testid="om_uttaksgrad_UT_gradert"]').should('exist')
      })

      it('forventer jeg vanlig informasjon om inntekt samtidig som uttak av pensjon.', () => {
        cy.get('[data-testid="uttaksgrad"]').select('50 %')
        cy.contains(
          'Forventer du å ha inntekt samtidig som du tar ut 50 % pensjon?'
        ).should('exist')
        cy.contains(
          'Du kan tjene så mye du vil samtidig som du tar ut pensjon.'
        ).should('exist')
      })
    })
  })
})

export {}
