import { AccordionItem } from '../AccordionItem'
import { GrunnlagSection } from '@/components/Grunnlag/GrunnlagSection'
import { userEvent, render, screen } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('AccordionItem', () => {
  afterEach(() => {
    loggerTeardown()
  })
  it('åpne og logg', async () => {
    const user = userEvent.setup()

    render(
      <AccordionItem name="log-data">
        <GrunnlagSection headerTitle="SectionHeader" headerValue="">
          <p>Test</p>
        </GrunnlagSection>
      </AccordionItem>
    )

    const accordionHeaderEl = screen.getByTestId('accordion-header')
    await user.click(accordionHeaderEl)
    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'accordion åpnet',
      expect.any(Object)
    )
  })
  it('lukke og logg', async () => {
    const user = userEvent.setup()

    render(
      <AccordionItem initialOpen={true} name="test">
        <GrunnlagSection headerTitle="SectionHeader" headerValue="">
          <p>Test</p>
        </GrunnlagSection>
      </AccordionItem>
    )

    const accordionHeaderEl = screen.getByTestId('accordion-header')
    await user.click(accordionHeaderEl)
    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'accordion lukket',
      expect.any(Object)
    )
  })
})
