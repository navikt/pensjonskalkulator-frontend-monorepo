import loependeVedtakMock from '../fixtures/loepende-vedtak.json'

export const setupLoependeVedtakWithPre2025OffentligAFP = (
  grad: number = 100
) => {
  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
    },
    {
      ...loependeVedtakMock,
      alderspensjon: {
        grad,
        fom: '2029-04-30',
        sivilstand: 'UGIFT',
      },
      pre2025OffentligAfp: {
        fom: '2025-04-30',
      },
    } satisfies LoependeVedtak
  ).as('getLoependeVedtak')
}

export const setupLoependeVedtakWithFremtidigAlderspensjon = (
  grad: number,
  fom: string = '2099-01-01'
) => {
  cy.intercept(
    {
      method: 'GET',
      url: '/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak',
    },
    {
      ...loependeVedtakMock,
      fremtidigAlderspensjon: {
        grad,
        fom,
      },
    } satisfies LoependeVedtak
  ).as('getLoependeVedtak')
}

// Register Cypress commands
Cypress.Commands.add(
  'setupLoependeVedtakWithPre2025OffentligAFP',
  setupLoependeVedtakWithPre2025OffentligAFP
)
Cypress.Commands.add(
  'setupLoependeVedtakWithFremtidigAlderspensjon',
  setupLoependeVedtakWithFremtidigAlderspensjon
)
