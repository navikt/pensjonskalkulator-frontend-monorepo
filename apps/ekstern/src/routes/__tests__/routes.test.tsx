import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, vi } from 'vitest'

import { ROUTER_BASE_URL, routes } from '..'
import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, swallowErrors, waitFor } from '@/test-utils'

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
  })

  describe('/pensjon/kalkulator/login', () => {
    it('viser landingssiden med lenke til pålogging (stegvisning start)', async () => {
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/login'],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Utlogget landingsside'
      )
      const links: HTMLAnchorElement[] = await screen.findAllByRole('link')
      expect(links[0].textContent).toEqual('Logg inn og test kalkulatoren')
      expect(links[0].href).toContain('/start')
    })
  })

  describe('/pensjon/kalkulator/', () => {
    it('redirigerer til /start', async () => {
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator'],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(
        await screen.findByText('stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  describe('/pensjon/kalkulator/start', () => {
    it('viser Steg 1', async () => {
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/start'],
      })
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(
        await screen.findByText('stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  describe('/pensjon/kalkulator/samtykke', () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/samtykke'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/samtykke'],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.samtykke.title')
      ).toBeInTheDocument()
    })
  })

  describe('/pensjon/kalkulator/offentlig-tp', () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/offentlig-tp'],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(async () => {
        expect(await screen.findByText('stegvisning.afp.title')).toBeVisible()
      })
    })
  })

  describe('/pensjon/kalkulator/afp', () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/afp'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/afp'],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.afp.title')
      ).toBeInTheDocument()
    })
  })

  describe('/pensjon/kalkulator/sivilstand', () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/sivilstand'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/sivilstand'],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('stegvisning.sivilstand.title')
      ).toBeInTheDocument()
    })
  })

  describe('/pensjon/kalkulator/beregning', () => {
    it('redirigerer til Step 1 når brukeren prøver å aksessere steget med direkte url', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {},
        userInput: { ...userInputInitialState },
      }))
      const router = createMemoryRouter(routes, {
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/beregning'],
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
        basename: ROUTER_BASE_URL,
        initialEntries: ['/pensjon/kalkulator/beregning'],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.findByText('Henter tidligste mulige uttaksalder')
      ).toBeInTheDocument()
    })
  })

  it('Uregistrerte url med path /pensjon/kalkulator sender til 404 siden', () => {
    const router = createMemoryRouter(routes, {
      basename: ROUTER_BASE_URL,
      initialEntries: ['/pensjon/kalkulator/abc'],
    })
    swallowErrors(() => {
      render(<RouterProvider router={router} />, { hasRouter: false })
      expect(screen.getByText('Denne siden finnes ikke')).toBeInTheDocument()
    })
  })
})
