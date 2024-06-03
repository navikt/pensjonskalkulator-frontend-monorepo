import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const initialGetState = store.getState

describe('Step 6', () => {
  beforeEach(() => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...fulfilledGetPerson,
        },
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
        samtykke: true,
      },
    }))
  })

  afterEach(() => {
    store.dispatch(apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
    store.getState = initialGetState
  })

  it('har riktig sidetittel og viser loader mens person fetches', async () => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...fulfilledGetPerson,
        },
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
        samtykke: true,
      },
    }))

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(async () => {
      expect(await screen.findByTestId('step6-loader')).toBeVisible()
      expect(document.title).toBe('application.title.stegvisning.step6')
    })
  })

  it('rendrer Step 6 slik den skal,', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.sivilstand.title'
      )
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })
  })

  it('registrerer sivilstand og navigerer videre til beregning når brukeren svarer og klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    const setSamboerMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setSamboer'
    )
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    const radioButtons = await screen.findAllByRole('radio')
    expect(radioButtons[0]).not.toBeChecked()
    expect(radioButtons[1]).not.toBeChecked()
    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.beregn'))
    expect(setSamboerMock).toHaveBeenCalledWith(true)
    expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
  })

  it('sender tilbake til steg 5 når brukeren som mottar uføretrygd og som har valgt afp klikker på Tilbake', async () => {
    const user = userEvent.setup()
    mockResponse('/v1/ufoeregrad', {
      status: 200,
      json: {
        ufoeregrad: 100,
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      },
      hasRouter: false,
    })

    store.dispatch(apiSlice.endpoints.getUfoeregrad.initiate())

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygd)
    })
  })

  it('sender tilbake til steg 4 når brukeren som mottar uføretrygd og har ikke valgt afp og klikker på Tilbake', async () => {
    const user = userEvent.setup()
    mockResponse('/v1/ufoeregrad', {
      status: 200,
      json: {
        ufoeregrad: 100,
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        userInput: { ...userInputInitialState, afp: 'nei' },
      },
      hasRouter: false,
    })

    store.dispatch(apiSlice.endpoints.getUfoeregrad.initiate())

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    })
  })

  it('sender tilbake til steg 4 når brukeren som ikke mottar uføretrygd klikker på Tilbake', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      },
      hasRouter: false,
    })

    store.dispatch(apiSlice.endpoints.getUfoeregrad.initiate())

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const flushMock = vi.spyOn(userInputReducerUtils.userInputActions, 'flush')
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.login)
      expect(flushMock).toHaveBeenCalledWith()
    })
  })
})
