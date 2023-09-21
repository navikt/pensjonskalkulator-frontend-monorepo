import { AccordionItem } from '../AccordionItem'
import { GrunnlagSection } from '@/components/Grunnlag/GrunnlagSection'
import { userEvent, render, screen } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('AccordionItem', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at komponenten er ukontrollert', () => {
    it('åpne, lukke og logg', async () => {
      const user = userEvent.setup()
      render(
        <AccordionItem name="log-data">
          <GrunnlagSection headerTitle="SectionHeader" headerValue="">
            <p>Test</p>
          </GrunnlagSection>
        </AccordionItem>
      )
      await user.click(screen.getByTestId('accordion-header'))
      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'accordion åpnet',
        expect.any(Object)
      )
      await user.click(screen.getByTestId('accordion-header'))
      expect(loggerSpy).toHaveBeenNthCalledWith(
        2,
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
        <AccordionItem name="test" isOpen={isOpen} onClick={toggleOpen}>
          <GrunnlagSection headerTitle="SectionHeader" headerValue="">
            <p>Test</p>
          </GrunnlagSection>
        </AccordionItem>
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
        <AccordionItem name="test" isOpen={isOpen} onClick={toggleOpen}>
          <GrunnlagSection headerTitle="SectionHeader" headerValue="">
            <p>Test</p>
          </GrunnlagSection>
        </AccordionItem>
      )
      await user.click(screen.getByTestId('accordion-header'))
      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'accordion lukket',
        expect.any(Object)
      )
    })
  })
})
