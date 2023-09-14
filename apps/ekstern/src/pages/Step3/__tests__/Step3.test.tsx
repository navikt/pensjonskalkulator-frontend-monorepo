import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { routes } from '@/router'
import { BASE_PATH, paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { screen, render, waitFor, userEvent } from '@/test-utils'

const initialGetState = store.getState

describe('Step 3', () => {
  afterEach(() => {
    store.dispatch(apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
    store.getState = initialGetState
  })

  beforeEach(() => {
    store.getState = vi.fn().mockImplementation(() => ({
      api: {
        queries: {},
      },
      userInput: {
        ...userInputReducerUtils.userInputInitialState,
        samtykke: true,
      },
    }))
  })

  describe('Gitt at kallet til /tpo-medlemskap er vellykket', async () => {
    it('har riktig sidetittel', async () => {
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      await waitFor(async () => {
        expect(document.title).toBe('application.title.stegvisning.step3')
      })
    })

    it('sender videre til steg 4 når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
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
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.tilbake'))
        expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
      })
    })

    it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
      const flushMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flush'
      )
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
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
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.avbryt'))
        expect(navigateMock).toHaveBeenCalledWith(paths.login)
        expect(flushMock).toHaveBeenCalled()
      })
    })
  })

  describe('Gitt at kallet til /tpo-medlemskap feiler', async () => {
    it('rendrer tekstene riktig', async () => {
      mockErrorResponse('/tpo-medlemskap')
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      waitFor(async () => {
        expect(
          screen.queryByText('stegvisning.offentligtp.title')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('stegvisning.offentligtp.error.title')
        ).toBeVisible()
        expect(
          await screen.findByText('stegvisning.offentligtp.error.ingress')
        ).toBeVisible()
        expect(await screen.findByText('stegvisning.neste')).toBeVisible()
        expect(await screen.findByText('stegvisning.tilbake')).toBeVisible()
        expect(await screen.findByText('stegvisning.avbryt')).toBeVisible()
      })
    })

    it('sender videre til steg 4 når brukeren klikker på Neste', async () => {
      mockErrorResponse('/tpo-medlemskap')
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.queryByText('stegvisning.offentligtp.title')
      ).not.toBeInTheDocument()
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.neste'))
        expect(navigateMock).toHaveBeenCalledWith(paths.afp)
      })
    })

    it('sender tilbake til steg 2 når brukeren klikker på Tilbake', async () => {
      mockErrorResponse('/tpo-medlemskap')
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const router = createMemoryRouter(routes, {
        basename: BASE_PATH,
        initialEntries: [`${BASE_PATH}${paths.offentligTp}`],
      })
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      expect(
        await screen.queryByText('stegvisning.offentligtp.title')
      ).not.toBeInTheDocument()
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.tilbake'))
        expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
      })
    })
  })
})
