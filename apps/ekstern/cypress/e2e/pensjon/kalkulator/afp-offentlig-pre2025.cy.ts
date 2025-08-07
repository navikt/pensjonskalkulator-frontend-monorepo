import { format, sub } from 'date-fns'

import loependeVedtakMock from '../../../fixtures/loepende-vedtak.json'
import personMock from '../../../fixtures/person.json'

const fødselsdatofør1963 = format(
  sub(new Date(), { years: 61, months: 1, days: 5 }),
  'yyyy-MM-dd'
)

describe('AFP offentlig etterfulgt av AP', () => {
  describe('Gitt at bruker er innlogget og har vedtak om pre2025AfpOffentlig', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v5/person',
        },
        {
          ...personMock,
          foedselsdato: fødselsdatofør1963,
        }
      ).as('getPerson')

      cy.intercept(
        {
          method: 'GET',
          url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
        },
        {
          ...loependeVedtakMock,
          pre2025OffentligAfp: {
            fom: '2024-08-01',
          },
        }
      ).as('getLoependeVedtak')
      cy.login()
    })

    describe('Start side med vedtak om AFP offentlig', () => {
      it('forventer riktig ingress i start side med vedtak om AFP offentlig', () => {
        cy.get(
          '[data-testid="stegvisning-start-ingress-pre2025-offentlig-afp"]'
        ).should('be.visible')
      })
    })

    describe('Når jeg trykker "Neste" på utlandsopphold,', () => {
      beforeEach(() => {
        cy.get('[data-testid="stegvisning-start-button"]')
          .should('be.visible')
          .click()
        cy.contains('button', 'Neste').click() // -> Sivilstand
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click() // -> Opphold utenfor Norge
        cy.get('[type="radio"]').last().check()
        cy.contains('button', 'Neste').click() // -> Samtykke Pensjonsavtaler
      })
      it('forventer jeg å komme til beregningsside', () => {
        cy.location('href').should('include', '/pensjon/kalkulator/beregning')
      })
    })
  })
})
