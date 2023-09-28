import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { Step0 } from '..'
import { mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userEvent, render, screen, waitFor } from '@/test-utils'

describe('Step 0', () => {
  it('har riktig sidetittel', () => {
    render(<Step0 />)
    expect(document.title).toBe('application.title.stegvisning.step0')
  })

  it('henter personopplysninger og viser hilsen med fornavnet til brukeren', async () => {
    render(<Step0 />)
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })
  })

  it('rendrer hilsen uten fornavn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/person')
    render(<Step0 />)
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title!')).toBeVisible()
    })
  })

  it('sender videre til steg 2 når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
    })
  })

  it('nullstiller cachen for /person kall når brukeren klikker på Neste og at kallet har feilet', async () => {
    mockErrorResponse('/person')
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    let invalidateTagsMock = vi
      .spyOn(apiSliceUtils.apiSlice.util, 'invalidateTags')
      .mockReturnValue({
        type: 'something',
        payload: ['Person'],
      })
    invalidateTagsMock = Object.assign(invalidateTagsMock, { match: vi.fn() })

    render(<Step0 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
      expect(invalidateTagsMock).toHaveBeenCalledWith(['Person'])
    })
  })

  it('kaller /inntekt, og viser ErrorPageUnexpected når inntekt feiler', async () => {
    const cache = console.error
    console.error = () => {}

    mockErrorResponse('/inntekt')
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Step0 />,
        ErrorBoundary: RouteErrorBoundary,
      },
    ])
    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })

    expect(await screen.findByText('error.global.title')).toBeVisible()
    expect(await screen.findByText('error.global.ingress')).toBeVisible()

    console.error = cache
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.login)
    })
  })
})
