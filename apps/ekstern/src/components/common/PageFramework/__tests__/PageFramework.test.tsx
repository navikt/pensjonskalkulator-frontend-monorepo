import * as ReactRouterUtils from 'react-router'
import { Link } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { PageFramework } from '..'
import { paths } from '@/router'
import { render, screen, userEvent } from '@/test-utils'
import * as useRequest from '@/utils/useRequest'

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
      'pageframework.title'
    )
    expect(result.asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal i full width', () => {
    const result = render(<PageFramework isFullWidth />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'pageframework.title'
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

  it('sjekker auth når siden kommer i fokus', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const reloadMock = vi.fn()

    const spy = vi.spyOn(useRequest, 'default')
    spy.mockReturnValue({
      status: 401,
      reload: reloadMock,
      isLoading: false,
      loadingState: 'ERROR',
      data: null,
      hasError: false,
      errorData: null,
    })

    render(
      <PageFramework isAuthenticated>
        <TestComponent />
      </PageFramework>
    )

    window.dispatchEvent(new Event('focus'))
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })
})
