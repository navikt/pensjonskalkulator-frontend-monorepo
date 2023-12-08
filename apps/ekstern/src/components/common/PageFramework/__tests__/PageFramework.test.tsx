import { Link } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { PageFramework } from '..'
import { mockResponse } from '@/mocks/server'
import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { apiSlice } from '@/state/api/apiSlice'
import { render, screen, userEvent, waitFor } from '@/test-utils'

function TestComponent() {
  return <Link to="/">Klikk</Link>
}

describe('PageFramework', () => {
  afterEach(() => {
    window.scrollTo = () => vi.fn()
  })

  it('rendrer slik den skal, med wrapper og Heading på riktig nivå', async () => {
    const { asFragment } = render(<PageFramework />, { hasLogin: true })
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med hvit bakgrunn', async () => {
    const { asFragment } = render(<PageFramework hasWhiteBg />, {
      hasLogin: true,
    })
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
    expect(asFragment()).toMatchSnapshot()
  })

  describe('Når feature-toggle for detaljert fane skrues av og på', () => {
    it('rendrer med hvit bakgrunn når feature toggle er på og hasToggleBg er true', async () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      const { store, asFragment } = render(<PageFramework hasToggleBg />, {
        hasLogin: true,
      })
      store.dispatch(
        apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
      )

      await waitFor(async () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'pageframework.title'
        )
      })
      expect(asFragment()).toMatchSnapshot()
    })
    it('rendrer uten hvit bakgrunn når feature toggle er på og hasToggleBg er false', async () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      const { store, asFragment } = render(<PageFramework />, {
        hasLogin: true,
      })
      store.dispatch(
        apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
      )
      await waitFor(async () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'pageframework.title'
        )
      })
      expect(asFragment()).toMatchSnapshot()
    })
    it('rendrer uten hvit bakgrunn når feature toggle er av', async () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: false },
      })
      const { store, asFragment } = render(<PageFramework hasToggleBg />, {
        hasLogin: true,
      })
      store.dispatch(
        apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
      )
      await waitFor(async () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'pageframework.title'
        )
      })
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal i full bredde', async () => {
    const { asFragment } = render(
      <PageFramework isFullWidth shouldShowLogo={false} />,
      {
        hasLogin: true,
      }
    )
    await waitFor(async () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'pageframework.title'
      )
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer slik den skal med logo', async () => {
    const { asFragment } = render(<PageFramework shouldShowLogo={true} />, {
      hasLogin: true,
    })
    await waitFor(async () => {
      expect(screen.getByTestId('framework-logo')).toBeInTheDocument()
    })
    expect(asFragment()).toMatchSnapshot()
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

    expect(await screen.findByTestId('redirect-element')).toBeVisible()
    expect(windowSpy).toHaveBeenCalledWith(
      'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
      '_self'
    )
  })
})
