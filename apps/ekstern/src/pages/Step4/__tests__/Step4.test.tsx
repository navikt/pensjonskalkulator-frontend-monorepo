import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

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
          ['getPerson(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getPerson',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              fornavn: 'Aprikos',
              sivilstand: 'UGIFT',
              foedselsdato: '1963-04-30',
            },
            fulfilledTimeStamp: 1688046412103,
          },
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

  it('har riktig sidetittel og viser loader mens inntekt og ekskludertStatus fetches', async () => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'rejected',
            endpointName: 'getInntekt',
            requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
            startedTimeStamp: 1714725265404,
            error: {
              status: 'FETCH_ERROR',
              error: 'TypeError: Failed to fetch',
            },
          },
          ['getEkskludertStatus(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getEkskludertStatus',
            requestId: 't1wLPiRKrfe_vchftk8s8',
            data: { ekskludert: false, aarsak: 'NONE' },
            startedTimeStamp: 1714725797072,
            fulfilledTimeStamp: 1714725797669,
          },
          ['getPerson(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getPerson',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              fornavn: 'Aprikos',
              sivilstand: 'UGIFT',
              foedselsdato: '1963-04-30',
            },
            fulfilledTimeStamp: 1688046412103,
          },
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
    expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygd)
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
          ['getTpoMedlemskap(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getTpoMedlemskap',
            requestId: 'bawyEKdq9139ubFwBmxyc',
            startedTimeStamp: 1714729167666,
            data: { harTjenestepensjonsforhold: true },
            fulfilledTimeStamp: 1714729167901,
          },
          ['getInntekt(undefined)']: {
            status: 'rejected',
            endpointName: 'getInntekt',
            requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
            startedTimeStamp: 1714725265404,
            error: {
              status: 'FETCH_ERROR',
              error: 'TypeError: Failed to fetch',
            },
          },
          ['getEkskludertStatus(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getEkskludertStatus',
            requestId: 't1wLPiRKrfe_vchftk8s8',
            data: { ekskludert: false, aarsak: 'NONE' },
            startedTimeStamp: 1714725797072,
            fulfilledTimeStamp: 1714725797669,
          },
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
