describe('Pensjonskalkulator', () => {
  it('viser status', () => {
    cy.intercept(
      { method: 'GET', url: '/pensjon/kalkulator/api/pensjonsberegning' },
      {
        fixture: 'pensjonsberegning.json',
      }
    )
    cy.visit('/pensjon/kalkulator')

    cy.contains('Din pensjon')
    cy.contains(
      'Hvis du fortsetter å ha samme inntekt som du har i dag kan du tidligst gå av med pensjon ved 67 år hvor du vil få utbetalt 300001 kroner i året'
    )
    cy.contains(
      'Dersom du jobber frem til du er 68 år, vil du få 300002 kroner utbetalt'
    )
    cy.contains(
      'Dersom du jobber frem til du er 69 år, vil du få 300003 kroner utbetalt'
    )

    cy.injectAxe()
    cy.checkA11y()
  })
})

export {}
