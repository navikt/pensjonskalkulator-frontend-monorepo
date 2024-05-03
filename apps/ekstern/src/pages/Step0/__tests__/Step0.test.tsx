import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { BASE_PATH, paths, henvisningUrlParams } from '@/router/constants'
import { routes } from '@/router/routes'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userEvent, render, screen, waitFor } from '@/test-utils'

const initialGetState = store.getState

describe('Step 0', () => {
  afterEach(() => {
    store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
    store.getState = initialGetState
  })

  it('har riktig sidetittel og viser loader mens person, inntekt og ekskludertStatus fetches', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      expect(document.title).toBe('application.title.stegvisning.step0')
    })
    expect(screen.getByTestId('step0-loader')).toBeVisible()
  })

  it('henter personopplysninger og viser hilsen med fornavnet til brukeren', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })
  })

  it('rendrer hilsen uten fornavn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/v1/person')
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title!')).toBeVisible()
    })
  })

  it('sender videre til steg 1 når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
    })
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.login)
    })
  })

  it('rendrer steget som vanlig dersom bruker har uføretrygd og feature-toggle er av', async () => {
    mockResponse('/feature/pensjonskalkulator.enable-ufoere', {
      status: 200,
      json: { enabled: true },
    })
    mockResponse('/v1/ekskludert', {
      json: {
        ekskludert: true,
        aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
      },
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
      expect(screen.getByText('stegvisning.start.button')).toBeVisible()
      expect(screen.getByText('stegvisning.avbryt')).toBeVisible()
    })
  })

  it('redirigerer til feilside dersom bruker har uføretrygd og feature-toggle er av', async () => {
    mockResponse('/feature/pensjonskalkulator.enable-ufoere', {
      status: 200,
      json: { enabled: false },
    })
    mockResponse('/v1/ekskludert', {
      json: {
        ekskludert: true,
        aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(async () => {
      expect(navigateMock).toHaveBeenCalledWith(
        `${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`
      )
    })
  })
})
