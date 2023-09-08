import { ReadMore } from '../ReadMore'
import { userEvent, render, screen } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('ReadMore', () => {
  afterEach(() => {
    loggerTeardown()
  })
  it('åpne og lukk som unkonrollert komponent og logg', async () => {
    const user = userEvent.setup()
    render(
      <ReadMore header="header" name="name">
        test-data
      </ReadMore>
    )

    await user.click(screen.getByTestId('readmore'))
    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'readmore åpnet',
      expect.any(Object)
    )
    await user.click(screen.getByTestId('readmore'))
    expect(loggerSpy).toHaveBeenNthCalledWith(
      2,
      'readmore lukket',
      expect.any(Object)
    )
  })

  it('åpne som en kontrollert komponent og logg', async () => {
    const user = userEvent.setup()
    let isOpen = false
    const toggleOpen = () => (isOpen = !isOpen)

    render(
      <ReadMore header="header" name="name" open={isOpen} onClick={toggleOpen}>
        test-data
      </ReadMore>
    )

    await user.click(screen.getByTestId('readmore'))
    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'readmore åpnet',
      expect.any(Object)
    )
  })
})
