describe('Graff Horizontal scroll', () => {
  context(
    'Gitt at graffen rendres på desktop og har nok søyler for å kunne scrolles',
    () => {
      it('Brukeren kan se og bruke navigasjonsknappene når antall søyler passer i skjermens bredde', () => {
        cy.visit('/pensjon/kalkulator')

        cy.contains('button', '70 år').click()
        cy.contains('button', 'Vis færre år').should('not.exist')
        cy.contains('button', 'Vis flere år').should('not.exist')
      })

      it('Brukeren kan se og bruke navigasjonsknappene når det er flere søyler enn skjermens bredde', () => {
        cy.visit('/pensjon/kalkulator')

        cy.viewport('iphone-xr')
        cy.contains('button', '67 år').click()
        cy.contains('button', 'Vis færre år').should('not.exist')
        cy.contains('button', 'Vis flere år').should('exist')

        // Scroller til høyre slik at begge knappene blir synlige
        cy.contains('button', 'Vis flere år').click()
        cy.contains('button', 'Vis færre år').should('exist')
        cy.contains('button', 'Vis flere år').should('exist')
        // Scroller maksimalt til høyre slik at Vis flere år skjules
        cy.contains('button', 'Vis flere år').click()
        cy.contains('button', 'Vis flere år').click()
        cy.contains('button', 'Vis flere år').click()
        cy.contains('button', 'Vis flere år').should('not.exist')
        // Scroller til venstre slik at begge knappene blir synlige igjen
        cy.contains('button', 'Vis færre år').click()
        cy.contains('button', 'Vis færre år').should('exist')
        cy.contains('button', 'Vis flere år').should('exist')
        // Scroller maksimalt til venstre slik at Vis færre år skjules
        cy.contains('button', 'Vis færre år').click()
        cy.contains('button', 'Vis færre år').click()
        cy.contains('button', 'Vis færre år').click()
        cy.contains('button', 'Vis færre år').should('not.exist')
        cy.contains('button', 'Vis flere år').should('exist')
      })
    }
  )
})

export {}
