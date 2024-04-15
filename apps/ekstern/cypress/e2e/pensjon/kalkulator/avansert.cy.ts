describe('Avansert', () => {
  describe('Gitt at jeg som bruker har gjort en enkel beregning,', () => {
    describe('Når jeg ønsker en avansert beregning', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: false })
        cy.wait('@fetchTidligsteUttaksalder')
      })

      it('forventer jeg å kunne velge «Avansert fane» for å få flere valgmuligheter', () => {
        cy.contains('Avansert').click()
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
      })

      it('forventer også å kunne gå til Avansert fra «Uttaksgrad» og «Inntekt frem til uttak» i Grunnlaget', () => {
        cy.contains('button', '70').click()
        cy.contains('Uttaksgrad:').click({ force: true })
        cy.contains('Gå til avansert kalkulator').click({ force: true })
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
        cy.contains('Enkel').click()
        cy.contains('button', '70').click()
        cy.contains('Inntekt frem til uttak:').click({ force: true })
        cy.contains('Gå til avansert kalkulator').click({ force: true })
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
      })

      it('ønsker jeg å kunne starte ny beregning', () => {
        cy.contains('Avansert').click()
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
        cy.contains('button', 'Tilbake til start').click({ force: true })
        cy.location('href').should('include', '/pensjon/kalkulator/start')
      })
    })
  })
  describe('Gitt at jeg som bruker har gjort en enkel beregning og har valgt "Avansert",', () => {
    describe('Når jeg er kommet inn i avansert', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: false })
        cy.wait('@fetchTidligsteUttaksalder')
        cy.contains('Avansert').click()
      })

      it('forventer jeg å se, og kunne endre inntekt frem til pensjon.', () => {
        cy.contains('Pensjonsgivende inntekt frem til pensjon').should('exist')
        cy.contains('521 338 kr per år før skatt').should('exist')
        cy.contains('button', 'Endre inntekt').click()
        cy.get('[data-testid="inntekt-textfield"]').type('0')
        cy.contains('button', 'Oppdater inntekt').click()
        cy.contains('0 kr per år før skatt').should('exist')
      })

      it('forventer jeg å kunne velge pensjonsalder mellom 62 år + 0 md og 75 år og 0 md.', () => {
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
          '62'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(13)
          expect(options.eq(1).text()).equal('0 md. (mai)')
          expect(options.eq(12).text()).equal('11 md. (apr.)')
        })
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '75'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(2)
          expect(options.eq(1).text()).equal('0 md. (mai)')
        })
      })

      it('forventer jeg å kunne velge mellom  20, 40, 50, 60, 80 og 100% uttaksgrad.', () => {
        cy.contains('Hvor mye alderspensjon vil du ta ut?').should('exist')
        cy.contains('Velg uttaksgrad').should('exist')
        cy.get('[data-testid="uttaksgrad"]').then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(7)
          expect(options.eq(1).text()).equal('20 %')
          expect(options.eq(2).text()).equal('40 %')
          expect(options.eq(3).text()).equal('50 %')
          expect(options.eq(4).text()).equal('60 %')
          expect(options.eq(5).text()).equal('80 %')
          expect(options.eq(6).text()).equal('100 %')
        })
      })
    })
  })
})
