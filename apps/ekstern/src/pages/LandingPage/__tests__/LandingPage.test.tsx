// import * as ReactRouterUtils from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { LandingPage } from '..'
import { externalUrls } from '@/router/constants'
import {
  render,
  screen,
  userEvent,
  waitFor,
  RenderRouteWithOutletContext,
} from '@/test-utils'

describe('LandingPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('har riktig sidetittel', () => {
    render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: true }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )
    expect(document.title).toBe('application.title')
  })

  it('rendrer innlogget side', async () => {
    const { asFragment } = render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: true }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.detaljert_kalkulator')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer utlogget side', async () => {
    const { asFragment } = render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: false }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.detaljert_kalkulator_utlogget')
      expect(
        screen.getByTestId('landingside-uinnlogget-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.uinnlogget_kalkulator')

      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('går til detaljert kalkulator når brukeren klikker på detaljert kalkulator knappen', async () => {
    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: true }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
      ).toBeDefined()
    })

    await user.click(
      screen.getByTestId('landingside-detaljert-kalkulator-button')
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })

  it('går til enkel kalkulator når brukeren klikker på enkel kalkulator knappen', async () => {
    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: false }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )

    await waitFor(async () => {
      await user.click(
        screen.getByTestId('landingside-enkel-kalkulator-button')
      )
    })

    expect(open).toHaveBeenCalledWith('/pensjon/kalkulator/start', '_self')
  })

  it('går til detaljert kalkulator når brukeren klikker på knappen i det andre avsnittet', async () => {
    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: true }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )
    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-second-button')
      ).toBeDefined()
    })

    await user.click(
      screen.getByTestId('landingside-detaljert-kalkulator-second-button')
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })

  it('går til uinnlogget kalkulator når brukeren klikker på uinnlogget kalkulator knappen', async () => {
    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    render(
      <RenderRouteWithOutletContext context={{ isLoggedIn: false }}>
        <LandingPage />
      </RenderRouteWithOutletContext>,
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-uinnlogget-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.uinnlogget_kalkulator')
    })

    await waitFor(async () => {
      await user.click(
        screen.getByTestId('landingside-uinnlogget-kalkulator-button')
      )
    })

    expect(open).toHaveBeenCalledWith(
      externalUrls.uinnloggetKalkulator,
      '_self'
    )
  })
})
