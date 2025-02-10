import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, it, vi } from 'vitest'

import { fulfilledGetGrunnbelop } from '@/mocks/mockedRTKQueryApiCalls'
import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const initialGetState = store.getState

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepSivilstand', () => {
  beforeEach(() => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...fulfilledGetPerson,
          ...fulfilledGetGrunnbelop,
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
      expect(document.title).toBe('application.title.stegvisning.sivilstand')
    })
    await waitFor(async () => {
      expect(await screen.findByTestId('sivilstand-loader')).toBeVisible()
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
      expect(
        screen.getByRole('combobox', {
          name: /stegvisning.sivilstand.select_label/i,
        })
      ).toBeVisible()
    })
  })

  it('registrerer sivilstand og navigerer videre til neste steg når brukeren svarer og klikker på Neste', async () => {
    const user = userEvent.setup()
    const setSivilstandMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setSivilstand'
    )
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
      expect(
        screen.getByRole('combobox', {
          name: /stegvisning.sivilstand.select_label/i,
        })
      ).toBeVisible()
    })
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: /stegvisning.sivilstand.select_label/i,
      }),
      'UGIFT'
    )
    await user.click(screen.getByText('stegvisning.neste'))
    expect(setSivilstandMock).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
      })
      render(<RouterProvider router={router} />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '81549300',
          },
        },
        hasRouter: false,
      })

      expect(await screen.findAllByRole('button')).toHaveLength(2)
    })
  })
})
