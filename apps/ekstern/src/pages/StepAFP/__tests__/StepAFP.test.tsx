import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetPerson,
  fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
  rejectedGetInntekt,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { screen, render, userEvent, waitFor } from '@/test-utils'

const initialGetState = store.getState

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepAFP', () => {
  beforeEach(() => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
          ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
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

  it('har riktig sidetittel', async () => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {
          ...rejectedGetInntekt,
          ...fulfilledGetPerson,
          ...fulfilledGetLoependeVedtak0Ufoeregrad,
        },
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
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
      expect(document.title).toBe('application.title.stegvisning.afp')
    })
  })

  it('rendrer StepAFP slik den skal', async () => {
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

  it('rendrer AFPPrivat når personen enten er født før 1963 og har vedtak om alderspensjon, eller når personen er født før 1963 og fylt 67 år', async () => {
    mockResponse('/v4/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1960-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: {
            aar: 67,
            maaneder: 0,
          },
          nedreAldersgrense: {
            aar: 62,
            maaneder: 0,
          },
        },
      },
    })

    mockResponse('/v4/vedtak/loepende-vedtak', {
      json: {
        alderspensjon: {
          grad: 100,
          fom: '2020-10-02',
          sivilstand: 'UGIFT',
        },
        ufoeretrygd: {
          grad: 0,
        },
      },
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      expect(screen.getByTestId('afp-privat')).toBeInTheDocument()
    })
  })

  it('rendrer AFPOvergangskullUtenAP når personen er født mellom 1954-1962 (overgangskull) og ikke har vedtak alderspensjon', async () => {
    mockResponse('/v4/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1960-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: {
            aar: 67,
            maaneder: 0,
          },
          nedreAldersgrense: {
            aar: 62,
            maaneder: 0,
          },
        },
      },
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      expect(screen.getByTestId('afp-overganskull')).toBeInTheDocument()
    })
  })

  it('rendrer AFP når personen er født etter 1963 med og uten vedtak om alderspensjon', async () => {
    mockResponse('/v4/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1964-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: {
            aar: 67,
            maaneder: 0,
          },
          nedreAldersgrense: {
            aar: 62,
            maaneder: 0,
          },
        },
      },
    })

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    await waitFor(() => {
      expect(screen.getByTestId('afp-etter-1963')).toBeInTheDocument()
    })
  })

  it('Når brukeren som er i overgangskullet uten vedtak om alderspensjon velger afp og klikker på Neste, registrerer afp og skalBeregneAfp, og navigerer videre til neste steg', async () => {
    mockResponse('/v4/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1960-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: {
            aar: 67,
            maaneder: 0,
          },
          nedreAldersgrense: {
            aar: 62,
            maaneder: 0,
          },
        },
      },
    })

    const setAfpMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setAfp'
    )
    const setSkalBeregneAfpMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setSkalBeregneAfp'
    )
    const user = userEvent.setup()

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
      },
      hasRouter: false,
    })

    const radioButtonsAfp = await screen.findAllByRole('radio')
    await user.click(radioButtonsAfp[0])
    const radioButtonsSkalBeregneAfp = await screen.findAllByRole('radio')
    await user.click(radioButtonsSkalBeregneAfp[4])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(setAfpMock).toHaveBeenCalledWith('ja_offentlig')
    expect(setSkalBeregneAfpMock).toHaveBeenCalledWith(true)
    expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygdAFP)
  })

  it('Når brukeren født etter 1963 velger afp og klikker på Neste, registrerer afp og navigerer videre til neste steg', async () => {
    mockResponse('/v4/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1964-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: {
            aar: 67,
            maaneder: 0,
          },
          nedreAldersgrense: {
            aar: 62,
            maaneder: 0,
          },
        },
      },
    })
    const setAfpMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'setAfp'
    )
    const user = userEvent.setup()

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.afp}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(setAfpMock).toHaveBeenCalledWith('ja_offentlig')
    expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygdAFP)
  })

  it('navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

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
    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.afp}`],
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

      expect(await screen.findAllByRole('button')).toHaveLength(4)
    })
  })
})
