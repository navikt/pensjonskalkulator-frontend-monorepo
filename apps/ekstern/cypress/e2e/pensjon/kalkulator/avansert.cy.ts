describe('Avansert', () => {
  describe.skip('Gitt at jeg som bruker har gjort en enkel beregning,', () => {
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

  describe('Gitt at jeg som bruker har valgt "Avansert",', () => {
    describe.skip('Når jeg er kommet inn i avansert', () => {
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

      it('forventer jeg å kunne nullstille mine valg', () => {
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '65'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('3')
        cy.get('[data-testid="uttaksgrad"]').select('40 %')
        cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').check()
        cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').type('300000')
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '67'
        )
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

        cy.contains('Nullstill valg').click()

        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').should(
          'have.value',
          null
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).should('have.value', null)
        cy.get('[data-testid="uttaksgrad"]').should('have.value', null)
        cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-ja"]').should(
          'not.exist'
        )
        cy.get('[data-testid="inntekt-vsa-gradert-uttak-radio-nei"]').should(
          'not.exist'
        )
        cy.get('[data-testid="inntekt-vsa-gradert-uttak"]').should('not.exist')
        cy.get(
          '[data-testid="age-picker-uttaksalder-gradert-uttak-aar"]'
        ).should('not.exist')
        cy.get(
          '[data-testid="age-picker-uttaksalder-gradert-uttak-maaneder"]'
        ).should('not.exist')

        cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-ja"]').should(
          'not.exist'
        )
        cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').should(
          'not.exist'
        )
        cy.get('[data-testid="inntekt-vsa-helt-uttak"]').should('not.exist')
        cy.get(
          '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
        ).should('not.exist')
        cy.get(
          '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
        ).should('not.exist')
      })
    })

    describe('Når jeg har valgt ut pensjonsalder og ønsker 100 % alderspensjon', () => {
      beforeEach(() => {
        cy.login()
        cy.fillOutStegvisning({ samtykke: false })
        cy.wait('@fetchTidligsteUttaksalder')
        cy.contains('Avansert').click()
        cy.get('[data-testid="age-picker-uttaksalder-helt-uttak-aar"]').select(
          '65'
        )
        cy.get(
          '[data-testid="age-picker-uttaksalder-helt-uttak-maaneder"]'
        ).select('3')
        cy.get('[data-testid="uttaksgrad"]').select('100 %')
      })

      it('forventer jeg å kunne oppgi inntekt mens jeg tar ut 100% pensjon. Jeg forventer å kunne legge inn til hvilken alder jeg vil ha inntekt, men ikke lenger enn 75 år + 11 md.', () => {
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
        ).select('65')
        cy.get(
          '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
        ).then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(9)
          expect(options.eq(1).text()).equal('4 md. (sep.)')
          expect(options.eq(8).text()).equal('11 md. (apr.)')
        })
        cy.get(
          '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar"]'
        ).select('75')
        cy.get(
          '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
        ).then((selectElements) => {
          const options = selectElements.find('option')
          expect(options.length).equal(13)
          expect(options.eq(1).text()).equal('0 md. (mai)')
          expect(options.eq(12).text()).equal('11 md. (apr.)')
          cy.get(
            '[data-testid="age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder"]'
          ).select('3')

          cy.contains('Beregn pensjon').click()
          cy.contains('Beregning').should('exist')
          cy.contains('Se og endre dine valg').click({ force: true })
          cy.contains('65 år og 3 md. (01.08.2028)').should('exist')
          cy.contains('Alderspensjon: 100 %').should('exist')
          cy.contains(
            'Pensjonsgivende årsinntekt t.o.m. 75 år og 3 md.: 100 000 kr før skatt'
          ).should('exist')
        })
      })

      it.skip('forventer jeg å kunne velge å ikke legge til inntekt vsa. 100 % alderspensjon, og kunne beregne pensjon', () => {
        cy.get('[data-testid="inntekt-vsa-helt-uttak-radio-nei"]').check()
        cy.contains('Beregn pensjon').click()
        cy.contains('Beregning').should('exist')
        cy.contains('Se og endre dine valg').click({ force: true })
        cy.contains('65 år og 3 md. (01.08.2028)').should('exist')
        cy.contains('Alderspensjon: 100 %').should('exist')
      })
    })
  })
})
