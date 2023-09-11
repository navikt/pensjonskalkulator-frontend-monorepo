import { Link } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { PageFramework } from '..'
import { render, screen, userEvent } from '@/test-utils'

function TestComponent() {
  return <Link to="/something-else">Klikk</Link>
}

describe('PageFramework', () => {
  afterEach(() => {
    window.scrollTo = () => vi.fn()
  })

  it('rendrer slik den skal, med main tag og Heading på riktig nivå', () => {
    const result = render(<PageFramework />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'application.title'
    )
    expect(result.asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal i full width', () => {
    const result = render(<PageFramework isFullWidth />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'application.title'
    )
    expect(result.asFragment()).toMatchSnapshot()
  })

  it('scroller på toppen av siden når en route endrer seg', async () => {
    const user = userEvent.setup()
    const scrollToMock = vi.fn()
    Object.defineProperty(global.window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })

    render(
      <PageFramework>
        <TestComponent />
      </PageFramework>
    )

    await await user.click(screen.getByText('Klikk'))
    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })
})
