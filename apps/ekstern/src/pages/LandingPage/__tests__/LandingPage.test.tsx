import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { BASE_PATH, externalUrls, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('LandingPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
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

  it('rendrer riktig innhold når brukeren er pålogget', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      // Viser TopSection uten fødselsårbegrensning
      expect(
        screen.getByText('landingsside.velge_mellom_detaljert_og_enkel')
      ).toBeVisible()
      // Viser riktig tekst på Enkel kalkulator knappen
      expect(
        screen.getByTestId('landingside-enkel-kalkulator-button').textContent
      ).toBe('landingsside.button.enkel_kalkulator')
      // Viser lenke til personopplysninger
      expect(
        screen.getByText('landingsside.link.personopplysninger')
      ).toBeVisible()
    })
  })

  it('rendrer riktig innhold når brukeren ikke er pålogget', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.login}`],
    })

    render(<RouterProvider router={router} />, {
      hasRouter: false,
      preloadedState: {
        session: { isLoggedIn: false },
      },
    })

    await waitFor(() => {
      // Viser TopSection med innloggingsprompt
      expect(
        screen.getByText('landingsside.for.deg.som.kan.logge.inn')
      ).toBeVisible()
      expect(
        screen.getByText('landingsside.velge_mellom_detaljert_og_enkel')
      ).toBeVisible()
      // Viser riktig tekst på Enkel kalkulator knappen
      expect(
        screen.getByTestId('landingside-enkel-kalkulator-button').textContent
      ).toBe('landingsside.button.enkel_kalkulator_utlogget')
      // Viser lenke til personopplysninger
      expect(
        screen.getByText('landingsside.link.personopplysninger')
      ).toBeVisible()
      // Viser info om Uinnlogget kalkulator
      expect(
        screen.getByText('landingsside.text.uinnlogget_kalkulator')
      ).toBeVisible()
      expect(
        screen.getByText('landingsside.body.uinnlogget_kalkulator')
      ).toBeVisible()
      // Viser riktig tekst på Uinnlogget kalkulator knappen
      expect(
        screen.getByTestId('landingside-uinnlogget-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.uinnlogget_kalkulator')
    })
  })

  it('går til enkel kalkulator når brukeren klikker på enkel kalkulator knappen', async () => {
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
      preloadedState: {
        session: { isLoggedIn: false },
      },
    })

    await waitFor(async () => {
      await user.click(
        screen.getByTestId('landingside-enkel-kalkulator-button')
      )
    })

    expect(navigateMock).toHaveBeenCalledWith(`${paths.start}`)
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
      preloadedState: {
        session: { isLoggedIn: false },
      },
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
