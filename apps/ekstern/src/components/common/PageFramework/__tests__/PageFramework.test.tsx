import { Link } from 'react-router'
import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { PageFramework } from '../PageFramework'

function TestComponent() {
  return <Link to="/">Klikk</Link>
}

describe('PageFramework', () => {
  afterEach(() => {
    window.scrollTo = () => vi.fn()
  })

  // * TODO: Fiks this test so it does not stop the pipeline
  //   it('viser loader mens loaderen fetcher data', async () => {
  //     const user = userEvent.setup()
  //     const router = createMemoryRouter(routes, {
  //       basename: BASE_PATH,
  //       initialEntries: [`${BASE_PATH}${paths.login}`],
  //     })

  //     render(<RouterProvider router={router} />, {
  //       hasRouter: false,
  //     })

  //     const button = await screen.findByTestId(
  //       'landingside-enkel-kalkulator-button'
  //     )
  //     await user.click(button)

  //     // * Wait for the loader to appear
  //     await waitFor(
  //       () => {
  //         const loader = screen.queryByTestId('pageframework-loader')
  //         expect(loader).toBeVisible()
  //       },
  //       { timeout: 2000 }
  //     )
  //   })

  it('rendrer slik den skal, med wrapper og Heading på riktig nivå', async () => {
    render(<PageFramework />, {
      hasLogin: true,
      preloadedState: {
        session: { isLoggedIn: true, hasErApotekerError: false },
      },
    })
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'pageframework.title'
    )
  })

  it('rendrer slik den skal med hvit bakgrunn', async () => {
    render(<PageFramework hasWhiteBg />, {
      hasLogin: true,
      preloadedState: {
        session: { isLoggedIn: true, hasErApotekerError: false },
      },
    })
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'pageframework.title'
    )
  })

  it('rendrer slik den skal i full bredde', async () => {
    render(<PageFramework isFullWidth shouldShowLogo={false} />, {
      hasLogin: true,
      preloadedState: {
        session: { isLoggedIn: true, hasErApotekerError: false },
      },
    })
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'pageframework.title'
    )
  })

  it('rendrer slik den skal med logo', async () => {
    render(<PageFramework shouldShowLogo={true} />, {
      hasLogin: true,
      preloadedState: {
        session: { isLoggedIn: true, hasErApotekerError: false },
      },
    })
    expect(await screen.findByTestId('framework-logo')).toBeInTheDocument()
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
      {
        hasLogin: true,
        preloadedState: {
          session: { isLoggedIn: true, hasErApotekerError: false },
        },
      }
    )

    const button = await screen.findByText('Klikk')
    await user.click(button)

    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })

  it('redirigerer til id-porten hvis shouldRedirectNonAuthenticated prop er satt og at brukeren ikke er authenticated', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const windowOpenMock = vi.fn()
    vi.stubGlobal('open', windowOpenMock)

    render(
      <PageFramework shouldRedirectNonAuthenticated>
        <TestComponent />
      </PageFramework>,
      {
        hasLogin: true,
        preloadedState: {
          session: { isLoggedIn: false, hasErApotekerError: false },
        },
      }
    )
    await Promise.resolve()

    await waitFor(() =>
      expect(windowOpenMock).toHaveBeenCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
        '_self'
      )
    )
  })
})
