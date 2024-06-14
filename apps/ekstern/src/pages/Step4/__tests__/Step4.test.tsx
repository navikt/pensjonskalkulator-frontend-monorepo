import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import {
  fulfilledGetEkskludertStatus,
  fulfilledGetInntekt,
  fulfilledGetPerson,
  fulfilledGetTpoMedlemskap,
  rejectedGetInntekt,
} from '@/mocks/mockedRTKQueryApiCalls'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'

const initialGetState = store.getState

describe('Step 4', () => {
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

  it('har riktig sidetittel og viser loader mens loaderen fetcher data', async () => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...rejectedGetInntekt,
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
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(async () => {
      expect(await screen.findByTestId('step4-loader')).toBeVisible()
      expect(document.title).toBe('application.title.stegvisning.step4')
    })
  })

  it('rendrer Step 4 slik den skal', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('Når brukeren velger afp og klikker på Neste, registrerer afp og navigerer videre til step 5', async () => {
    const setAfpMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setAfp'
    )
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[0])

    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.neste'))

    expect(setAfpMock).toHaveBeenCalledWith('ja_offentlig')
    expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygdAFP)
  })

  it('sender tilbake til steg 2 når brukeren ikke har tpo-medlemskap og klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.tilbake'))
    })
    expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
  })

  it('sender tilbake til steg 3 når brukeren har tpo-medlemskap og klikker på Tilbake', async () => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...fulfilledGetTpoMedlemskap,
          ...fulfilledGetInntekt,
          ...fulfilledGetEkskludertStatus,
        },
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
        samtykke: true,
      },
    }))

    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
      hasRouter: false,
    })

    await waitFor(async () => {
      expect(document.title).toBe('application.title.stegvisning.step4')
      await user.click(await screen.findByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
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
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[0])

    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(flushMock).toHaveBeenCalled()
  })
})
