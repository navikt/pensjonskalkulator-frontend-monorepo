import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { rejectedGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'
const initialGetState = store.getState

describe('StepSivilstand', () => {
  beforeEach(() => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...rejectedGetPerson,
        },
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
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
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      expect(await screen.findByTestId('sivilstand-loader')).toBeVisible()
      expect(document.title).toBe('application.title.stegvisning.sivilstand')
    })
  })

  it('rendrer StepSivilstand slik den skal', async () => {
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

  it('registrerer sivilstand og navigerer videre til neste steg når brukeren svarer og klikker på Neste', async () => {
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
    await user.click(screen.getByText('stegvisning.neste'))
    expect(setSamboerMock).toHaveBeenCalledWith(true)
    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
  })

  it('nullstiller input fra brukeren og navigerer tilbake når brukeren klikker på Tilbake', async () => {
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
      preloadedState: {
        api: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          queries: {
            ...rejectedGetPerson,
          },
        },
        userInput: {
          ...userInputReducerUtils.userInputInitialState,
          samboer: true,
        },
      },
    })
    const radioButtons = await screen.findAllByRole('radio')

    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(navigateMock).toHaveBeenCalledWith(-1)
    expect(store.getState().userInput.samboer).toBe(null)
  })
})
