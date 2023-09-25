import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, vi } from 'vitest'

import { BASE_PATH, paths, routes } from '..'
import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, swallowErrors, waitFor } from '@/test-utils'

const initialGetState = store.getState

const fakeApiCalls = {
  queries: {
    ['tulleQuery(undefined)']: {
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
}
describe('routes', () => {
  afterEach(() => {
    store.dispatch(apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
    store.getState = initialGetState
  })

  describe(`${BASE_PATH}${paths.login}`, () => {
    it('viser landingssiden med lenke til pålogging (stegvisning start)', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.login}`],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(router.state.location.pathname).toBe(`${BASE_PATH}/login`)
    })
  })

  describe(`${BASE_PATH}${paths.root}`, () => {
    it('redirigerer til /start', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.root}`],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(
        await screen.findByText('stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  describe(`${BASE_PATH}${paths.start}`, () => {
    it('viser Steg 1', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.start}`],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(
        await screen.findByText('stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  describe(`${BASE_PATH}${paths.samtykke}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.samtykke}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser Steg 2 når brukeren kommer til steget gjennom stegvisningen', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.samtykke}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.samtykke.title')
      ).toBeInTheDocument()
    })
  })

  describe(`${BASE_PATH}${paths.offentligTp}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser Steg 3 når brukeren kommer til steget gjennom stegvisningen og har tpo-medlemskap', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.offentligtp.title')
      ).toBeVisible()
    })

    it('redirigerer til Step 4 når brukeren har svart nei på spørsmålet om samtykke', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: false },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(await screen.findByText('stegvisning.afp.title')).toBeVisible()
    })

    it('redirigerer til Step 4 når brukeren har samtykket og ikke har noe offentlig tjenestepensjonsforhold', async () => {
      mockResponse('/tpo-medlemskap', {
        status: 200,
        json: { harTjenestepensjonsforhold: false },
      })
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(async () => {
        expect(await screen.findByText('stegvisning.afp.title')).toBeVisible()
      })
    })
  })

  describe(`${BASE_PATH}${paths.afp}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.afp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser Steg 4 når brukeren kommer til steget gjennom stegvisningen og har tpo medlemskap', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.afp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.afp.title')
      ).toBeInTheDocument()
    })
  })

  describe(`${BASE_PATH}${paths.sivilstand}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser Steg 5 når brukeren kommer til steget gjennom stegvisningen', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.sivilstand.title')
      ).toBeInTheDocument()
    })
  })

  describe(`${BASE_PATH}${paths.beregning}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.beregning}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser beregningen når brukeren kommer til steget gjennom stegvisningen', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.beregning}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText(
          'Et øyeblikk, vi henter tidligste mulige uttaksalder'
        )
      ).toBeInTheDocument()
    })
  })

  describe(`${BASE_PATH}${paths.forbehold}`, () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.forbehold}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.start.start')
      ).toBeInTheDocument()
    })

    it('viser forbehold siden når brukeren kommer til steget gjennom stegvisningen', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }))
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.forbehold}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(await screen.findByText('Forbehold')).toBeInTheDocument()
    })
  })

  it('Uregistrerte url med path /pensjon/kalkulator sender til 404 siden', () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: ['/pensjon/kalkulator/abc'],
    })
    swallowErrors(() => {
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(screen.queryByTestId('error-page-404')).toBeInTheDocument()
    })
  })
})
