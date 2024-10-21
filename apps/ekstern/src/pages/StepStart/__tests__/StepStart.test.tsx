import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import {
  fulfilledGetPerson,
  fulfilledGetLoependeVedtak0Ufoeregrad,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { BASE_PATH, paths } from '@/router/constants'
import { routes } from '@/router/routes'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { userEvent, render, screen, waitFor } from '@/test-utils'

const initialGetState = store.getState

describe('StepStart', () => {
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
      expect(document.title).toBe('application.title.stegvisning.start')
    })
    expect(screen.getByTestId('start-loader')).toBeVisible()
  })

  describe('Gitt at brukeren ikke har noe vedtak om alderspensjon eller AFP', () => {
    it('henter personopplysninger og viser hilsen med navnet til brukeren', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(await screen.findByText('stegvisning.start.ingress')).toBeVisible()
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })

    it('rendrer ikke siden når henting av personopplysninger feiler', async () => {
      mockErrorResponse('/v2/person')
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(() => {
        expect(screen.getByText('error.global.title')).toBeVisible()
      })
    })
  })
  describe('Gitt at brukeren har et vedtak om alderspensjon eller AFP', () => {
    it('viser informasjon om dagens alderspensjon og AFP i tillegg til hilsen med navnet til brukeren', async () => {
      mockResponse('/v2/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
          },
          ufoeretrygd: {
            grad: 0,
          },
          harFremtidigLoependeVedtak: false,
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
        expect(
          screen.getByText('stegvisning.start.title Aprikos!')
        ).toBeVisible()
        expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
        expect(
          screen.getByText('50 % alderspensjon', { exact: false })
        ).toBeVisible()
      })
    })
    it('viser vanlig startsisde når henting av vedtak feiler', async () => {
      mockErrorResponse('/v2/vedtak/loepende-vedtak')
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
        expect(screen.getByText('stegvisning.start.ingress')).toBeVisible()
      })
    })
  })

  it('sender videre til neste steg når brukeren klikker på Neste', async () => {
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
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
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

      expect(await screen.findAllByRole('button')).toHaveLength(1)
    })
  })
})
