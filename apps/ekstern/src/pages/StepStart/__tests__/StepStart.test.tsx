import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { RootState, store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepStart', () => {
  afterEach(() => {
    store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('har riktig sidetittel', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      expect(document.title).toBe('application.title.stegvisning.start')
    })
  })

  describe('Gitt at brukeren er innlogget', () => {
    it('henter personopplysninger og viser hilsen med navnet til brukeren når bruker er yngre enn 75 år', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })

      render(<RouterProvider router={router} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
            },
          },
        },
        hasRouter: false,
      })
      expect(await screen.findByText('stegvisning.start.ingress')).toBeVisible()
    })

    it('henter personopplysninger og viser at brukeren kan ikke beregne alderspensjon i kalkulatoren siden bruker har fyllt 75 år', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })

      mockResponse('/v4/person', {
        json: {
          navn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1948-10-02',
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

      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })

      expect(
        await screen.findByTestId('start-brukere-fyllt-75-title')
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren ikke har noe vedtak om alderspensjon eller AFP', () => {
    it('henter personopplysninger og viser hilsen med navnet til brukeren', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
        },
        hasRouter: false,
      })

      expect(await screen.findByText('stegvisning.start.ingress')).toBeVisible()
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })

    it('rendrer ikke siden når henting av personopplysninger feiler og redirigerer til /uventet-feil', async () => {
      mockErrorResponse('/v4/person')
      const mockedState: RootState = {
        // @ts-ignore
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      vi.spyOn(store, 'getState').mockImplementation(() => mockedState)

      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        preloadedState: {
          ...mockedState,
        },
        hasRouter: false,
      })

      expect(await screen.findByText('pageframework.title')).toBeVisible()
      expect(
        router.state.location.pathname.endsWith(paths.uventetFeil)
      ).toBeTruthy()
    })
  })

  describe('Gitt at brukeren har et vedtak om alderspensjon eller AFP', () => {
    it('viser informasjon om dagens alderspensjon og AFP i tillegg til hilsen med navnet til brukeren', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 0 },
        } satisfies LoependeVedtak,
      })

      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(() => {
        expect(
          screen.getByText('stegvisning.start.title Aprikos!')
        ).toBeVisible()
        expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
        expect(
          screen.getByText('50 % alderspensjon', { exact: false })
        ).toBeVisible()
      })
    })

    it('rendrer ikke siden når henting av loepende vedtak feiler og redirigerer til /uventet-feil', async () => {
      mockErrorResponse('/v4/vedtak/loepende-vedtak')
      const mockedState: RootState = {
        // @ts-ignore
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      vi.spyOn(store, 'getState').mockImplementation(() => mockedState)

      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        preloadedState: {
          ...mockedState,
        },
        hasRouter: false,
      })

      expect(await screen.findByText('pageframework.title')).toBeVisible()
      expect(
        router.state.location.pathname.endsWith(paths.uventetFeil)
      ).toBeTruthy()
    })
  })

  describe('Gitt at brukeren har et vedtak om pre2025OffentligAfp', () => {
    it('viser informasjon om gammel Afp, i tillegg til hilsen med navnet til brukeren', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          alderspensjon: {
            grad: 50,
            fom: '2025-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 0 },
          pre2025OffentligAfp: {
            fom: '2020-10-02',
          },
        } satisfies LoependeVedtak,
      })

      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(() => {
        expect(
          screen.getByText('stegvisning.start.title Aprikos!')
        ).toBeVisible()
        expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
        expect(
          screen.getByText('AFP i offentlig sektor', { exact: false })
        ).toBeVisible()
      })
    })
  })

  describe('Gitt at brukeren har et vedtak om 0 % alderspensjon og pre2025OffentligAfp', () => {
    it('viser informasjon om gammel Afp, i tillegg til hilsen med navnet til brukeren', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          alderspensjon: {
            grad: 0,
            fom: '2025-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 0 },
          pre2025OffentligAfp: {
            fom: '2020-10-02',
          },
        } satisfies LoependeVedtak,
      })

      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(() => {
        expect(
          screen.getByText('stegvisning.start.title Aprikos!')
        ).toBeVisible()
        expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
        expect(
          screen.getByText('0 % alderspensjon', { exact: false })
        ).toBeVisible()
        expect(
          screen.getByText('AFP i offentlig sektor', { exact: false })
        ).toBeVisible()
      })
    })
  })

  it('sender videre til neste steg når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetPerson,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
      },
      hasRouter: false,
    })
    await waitFor(async () => {
      const startButton = await screen.findByText('stegvisning.start.button')
      await user.click(startButton)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  it('sender videre til avansert beregning når brukeren klikker på neste, og har vedtak om 0 % alderspensjon og pre2025OffentligAfp', async () => {
    mockResponse('/v4/vedtak/loepende-vedtak', {
      status: 200,
      json: {
        alderspensjon: {
          grad: 0,
          fom: '2025-10-02',
          sivilstand: 'UGIFT',
        },
        ufoeretrygd: { grad: 0 },
        pre2025OffentligAfp: {
          fom: '2020-10-02',
        },
      } satisfies LoependeVedtak,
    })

    const user = userEvent.setup()

    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: [`${BASE_PATH}${paths.start}`],
    })
    render(<RouterProvider router={router} />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetPerson,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
      },
      hasRouter: false,
    })
    await waitFor(async () => {
      const startButton = await screen.findByText('stegvisning.start.button')
      await user.click(startButton)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
    })
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
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

      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })
})
