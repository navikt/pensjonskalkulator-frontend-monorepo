import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { mockErrorResponse } from '@/mocks/server'
import { fireEvent, render, screen, waitFor } from '@/test-utils'

describe('Step 1', () => {
  it('henter personopplysninger og viser hilsen med fornavnet til brukeren', async () => {
    render(<Step1 />)
    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.stegvisning.start.title Aprikos!')
      ).toBeVisible()
    })
  })

  it('render uten og feile og viser tittel uten fornavn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/person')
    render(<Step1 />)

    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.stegvisning.start.title!')
      ).toBeVisible()
    })
  })

  it('sender videre til steg 2 når brukeren klikker på Neste', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    fireEvent.click(screen.getByText('stegvisning.stegvisning.start.start'))
    expect(navigateMock).toHaveBeenCalledWith('/samtykke')
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
