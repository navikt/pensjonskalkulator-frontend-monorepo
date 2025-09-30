import { render, screen, userEvent } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

import { ReadMore } from '../ReadMore'

describe('ReadMore', () => {
  afterEach(() => {
    loggerTeardown()
  })

  describe('Gitt at komponenten er ukontrollert', () => {
    it('åpne, lukk og logg', async () => {
      const user = userEvent.setup()
      render(
        <ReadMore header="header" name="name">
          test-data
        </ReadMore>
      )

      await user.click(screen.getByTestId('readmore'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'les mer åpnet',
        expect.any(Object)
      )
      expect(loggerSpy).toHaveBeenNthCalledWith(
        2,
        'readmore åpnet',
        expect.any(Object)
      )

      await user.click(screen.getByTestId('readmore'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        3,
        'les mer lukket',
        expect.any(Object)
      )
      expect(loggerSpy).toHaveBeenNthCalledWith(
        4,
        'readmore lukket',
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
        <ReadMore
          header="header"
          name="name"
          open={isOpen}
          onOpenChange={toggleOpen}
        >
          test-data
        </ReadMore>
      )

      await user.click(screen.getByTestId('readmore'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'les mer åpnet',
        expect.any(Object)
      )
    })

    it('lukke og logg', async () => {
      const user = userEvent.setup()
      let isOpen = true
      const toggleOpen = () => (isOpen = !isOpen)

      render(
        <ReadMore
          header="header"
          name="name"
          open={isOpen}
          onOpenChange={toggleOpen}
        >
          test-data
        </ReadMore>
      )

      await user.click(screen.getByTestId('readmore'))

      expect(loggerSpy).toHaveBeenNthCalledWith(
        1,
        'les mer lukket',
        expect.any(Object)
      )
    })
  })
})
