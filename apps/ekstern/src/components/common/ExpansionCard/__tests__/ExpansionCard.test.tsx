import { ExpansionCard as ExpansionCardAksel } from '@navikt/ds-react'

import { render, screen, userEvent } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

import { ExpansionCard } from '../ExpansionCard'

describe('ExpansionCard', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at komponenten er ukontrollert', () => {
    it('åpne, lukk og logg', async () => {
      const user = userEvent.setup()
      render(
        <ExpansionCard name="name" aria-labelledby="expansion-card-label">
          <ExpansionCardAksel.Header>
            <ExpansionCardAksel.Title id="expansion-card-label" size="small">
              something
            </ExpansionCardAksel.Title>
            <ExpansionCardAksel.Description>
              description
            </ExpansionCardAksel.Description>
          </ExpansionCardAksel.Header>
        </ExpansionCard>
      )

      await user.click(screen.getByRole('button', { name: 'Vis mer' }))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'expansion card åpnet',
        expect.any(Object)
      )

      await user.click(screen.getByRole('button', { name: 'Vis mer' }))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        2,
        'expansion card lukket',
        expect.any(Object)
      )
    })
  })

  describe('Gitt at komponenten er kontrollert', () => {
    it('åpne og logg', async () => {
      const user = userEvent.setup()
      let isOpen = false
      const toggleOpen = () => (isOpen = !isOpen)
      render(
        <ExpansionCard
          name="name"
          aria-labelledby="expansion-card-label"
          open={isOpen}
          onToggle={toggleOpen}
        >
          <ExpansionCardAksel.Header>
            <ExpansionCardAksel.Title id="expansion-card-label" size="small">
              something
            </ExpansionCardAksel.Title>
            <ExpansionCardAksel.Description>
              description
            </ExpansionCardAksel.Description>
          </ExpansionCardAksel.Header>
        </ExpansionCard>
      )

      await user.click(screen.getByRole('button', { name: 'Vis mer' }))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'expansion card åpnet',
        expect.any(Object)
      )
    })

    it('lukke og logg', async () => {
      const user = userEvent.setup()
      let isOpen = true
      const toggleOpen = () => (isOpen = !isOpen)

      render(
        <ExpansionCard
          name="name"
          aria-labelledby="expansion-card-label"
          open={isOpen}
          onToggle={toggleOpen}
        >
          <ExpansionCardAksel.Header>
            <ExpansionCardAksel.Title id="expansion-card-label" size="small">
              something
            </ExpansionCardAksel.Title>
            <ExpansionCardAksel.Description>
              description
            </ExpansionCardAksel.Description>
          </ExpansionCardAksel.Header>
        </ExpansionCard>
      )

      await user.click(screen.getByRole('button', { name: 'Vis mer' }))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'expansion card lukket',
        expect.any(Object)
      )
    })
  })
})
