import { vi } from 'vitest'

import { render, screen, userEvent } from '@/test-utils'
import {
  addSelfDestructingEventListener,
  cleanAndAddEventListener,
} from '@/utils/events'

function TestComponent() {
  return <div data-testid="test-component">lorem ipsum</div>
}

describe('events-utils', () => {
  it('addSelfDestructingEventListener legger til og fjerner events', async () => {
    const user = userEvent.setup()
    const cbMock = vi.fn()
    const removeEventListenerMock = vi.fn()
    const args = { a: 1, b: 'abc' }

    render(<TestComponent />)

    const el = await screen.findByTestId('test-component')
    el.removeEventListener = removeEventListenerMock

    addSelfDestructingEventListener(el, 'click', cbMock, args)
    await user.click(el)

    expect(cbMock).toHaveBeenCalled()
    expect(removeEventListenerMock.mock.calls[0][0]).toBe('click')
  })

  it('cleanAndAddEventListener fjerner event listener og legger til ny', async () => {
    const user = userEvent.setup()
    const cbMock = vi.fn()
    const removeEventListenerMock = vi.fn()
    const args = { a: 1, b: 'abc' }

    render(<TestComponent />)

    const el = await screen.findByTestId('test-component')
    el.removeEventListener = removeEventListenerMock

    cleanAndAddEventListener(el, 'click', cbMock, args)
    expect(removeEventListenerMock.mock.calls[0][0]).toBe('click')
    await user.click(el)

    expect(cbMock).toHaveBeenCalled()
  })
})
