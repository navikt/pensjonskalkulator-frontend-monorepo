import { Accordion } from '@navikt/ds-react'

import { GrunnlagSection } from '@/components/Grunnlag/GrunnlagSection'
import { render, screen, userEvent } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

import { AccordionItem } from '../AccordionItem'

describe('AccordionItem', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at komponenten er ukontrollert', () => {
    it('åpne, lukke og logg', async () => {
      const user = userEvent.setup()
      render(
        <Accordion>
          <AccordionItem name="log-data">
            <GrunnlagSection headerTitle="SectionHeader" headerValue="">
              <p>Test</p>
            </GrunnlagSection>
          </AccordionItem>
        </Accordion>
      )

      await user.click(screen.getByTestId('accordion-header'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'accordion åpnet',
        expect.any(Object)
      )

      await user.click(screen.getByTestId('accordion-header'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        3,
        'accordion lukket',
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
        <Accordion>
          <AccordionItem name="test" isOpen={isOpen} onClick={toggleOpen}>
            <GrunnlagSection headerTitle="SectionHeader" headerValue="">
              <p>Test</p>
            </GrunnlagSection>
          </AccordionItem>
        </Accordion>
      )

      await user.click(screen.getByTestId('accordion-header'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'accordion åpnet',
        expect.any(Object)
      )
    })

    it('lukke og logg', async () => {
      const user = userEvent.setup()
      let isOpen = true
      const toggleOpen = () => (isOpen = !isOpen)
      render(
        <Accordion>
          <AccordionItem name="test" isOpen={isOpen} onClick={toggleOpen}>
            <GrunnlagSection headerTitle="SectionHeader" headerValue="">
              <p>Test</p>
            </GrunnlagSection>
          </AccordionItem>
        </Accordion>
      )

      await user.click(screen.getByTestId('accordion-header'))
    })
  })
})
