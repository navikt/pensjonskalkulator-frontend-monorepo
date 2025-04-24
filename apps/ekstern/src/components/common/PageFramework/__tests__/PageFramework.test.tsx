import { Link, RouterProvider, createMemoryRouter } from 'react-router'
import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { PageFramework } from '../PageFramework'

function TestComponent() {
  return <Link to="/">Klikk</Link>
}

describe('PageFramework', () => {
  afterEach(() => {
    window.scrollTo = () => vi.fn()
  })

  it('viser loader mens loaderen fetcher data', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    const button = await screen.findByTestId(
      'landingside-enkel-kalkulator-button'
    )
    user.click(button)
    expect(await screen.findByTestId('pageframework-loader')).toBeVisible()
  })

  it('rendrer slik den skal, med wrapper og Heading på riktig nivå', async () => {
    render(<PageFramework />, { hasLogin: true })
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
  })

  it('rendrer slik den skal med hvit bakgrunn', async () => {
    render(<PageFramework hasWhiteBg />, {
      hasLogin: true,
    })
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
  })

  it('rendrer slik den skal i full bredde', async () => {
    render(<PageFramework isFullWidth shouldShowLogo={false} />, {
      hasLogin: true,
    })
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
  })

  it('rendrer slik den skal med logo', async () => {
    render(<PageFramework shouldShowLogo={true} />, {
      hasLogin: true,
    })
    await waitFor(async () => {
      expect(screen.getByTestId('framework-logo')).toBeInTheDocument()
    })
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
      </PageFramework>,
      { hasLogin: true }
    )

    const button = await screen.findByText('Klikk')
    await user.click(button)

    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })

  it('redirigerer til id-porten hvis shouldRedirectNonAuthenticated prop er satt og at brukeren ikke er authenticated', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const windowSpy = vi.spyOn(window, 'open')

    render(
      <PageFramework shouldRedirectNonAuthenticated>
        <TestComponent />
      </PageFramework>,
      { hasLogin: true }
    )
    await Promise.resolve()

    await waitFor(() =>
      expect(windowSpy).toHaveBeenCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
        '_self'
      )
    )
  })
})
