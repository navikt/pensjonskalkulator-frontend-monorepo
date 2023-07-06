import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { Step3 } from '..'
import { step3loader } from '../utils'
import { BASE_PATH, paths } from '@/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store, RootState } from '@/state/store'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('Step 3', () => {
  afterEach(() => {
    store.dispatch(apiSlice.util.resetApiState())
  })

  const mockedState = {
    api: { queries: {} },
    userInput: {
      ...userInputReducerUtils.userInputInitialState,
      samtykke: true,
    },
  }
  store.getState = vi.fn().mockImplementation(() => {
    return mockedState
  })
  const router = createMemoryRouter(
    [
      {
        path: paths.offentligTp,
        loader: step3loader,
        element: <Step3 />,
      },
    ],
    {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
    }
  )

  it('sender videre til steg 4 når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<RouterProvider router={router} />, {
      preloadedState: mockedState as RootState,
      hasRouter: false,
    })
    expect(
      await screen.findByText('stegvisning.offentligtp.title')
    ).toBeVisible()
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.neste'))
      expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    })
  })

  it('sender tilbake til steg 2 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<RouterProvider router={router} />, {
      preloadedState: mockedState as RootState,
      hasRouter: false,
    })
    expect(
      await screen.findByText('stegvisning.offentligtp.title')
    ).toBeVisible()
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const flushMock = vi.spyOn(userInputReducerUtils.userInputActions, 'flush')
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<RouterProvider router={router} />, {
      preloadedState: mockedState as RootState,
      hasRouter: false,
    })
    expect(
      await screen.findByText('stegvisning.offentligtp.title')
    ).toBeVisible()
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.root)
      expect(flushMock).toHaveBeenCalled()
    })
  })
})
