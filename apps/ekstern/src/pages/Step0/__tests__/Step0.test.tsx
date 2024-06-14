import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { BASE_PATH, paths } from '@/router/constants'
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

  it('har riktig sidetittel og viser loader mens loaderen fetcher data', async () => {
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

  it('henter personopplysninger og viser hilsen med navnet til brukeren', async () => {
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

  it('rendrer hilsen uten navn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/v2/person')
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
      await waitFor(async () => {
        expect(screen.queryByTestId('step0-loader')).not.toBeInTheDocument()
      })
    })
    await user.click(await screen.findByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })
})
