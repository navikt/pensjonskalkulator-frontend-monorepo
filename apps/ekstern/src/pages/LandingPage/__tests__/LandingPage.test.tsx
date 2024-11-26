import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { BASE_PATH, paths } from '@/router/constants'
import { externalUrls } from '@/router/constants'
import { routes } from '@/router/routes'
import { store } from '@/state/store'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const initialGetState = store.getState

describe('LandingPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    store.getState = initialGetState
  })

  it('har riktig sidetittel', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      expect(document.title).toBe('application.title')
    })
  })

  it('rendrer innlogget side', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.detaljert_kalkulator')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer utlogget side', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })

    const { asFragment } = render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

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

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

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
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const open = vi.fn()
    vi.stubGlobal('open', open)

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(async () => {
      await user.click(
        screen.getByTestId('landingside-enkel-kalkulator-button')
      )
    })

    expect(navigateMock).toHaveBeenCalledWith(`${paths.start}`)
  })

  it('går til detaljert kalkulator når brukeren klikker på knappen i det andre avsnittet', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

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
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const user = userEvent.setup()

    const open = vi.fn()
    vi.stubGlobal('open', open)

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

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
