import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step3 } from '..'
import { mockResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step 3', () => {
  it('redirigerer til Step 1 når brukeren prøver å aksessere steget direkte uten å ha svart på spørsmålet om samtykke,', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: null },
      },
    })
    expect(navigateMock).toHaveBeenCalledWith('/start')
  })

  it('redirigerer til Step 4 når brukeren har svart nei på spørsmålet om samtykke,', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })
    expect(navigateMock).toHaveBeenCalledWith('/afp')
  })

  it('redirigerer til Step 4 når brukeren har samtykket og har ikke noe tpo medlemskap,', async () => {
    mockResponse('/tpo-medlemskap', {
      status: 200,
      json: { harTjenestepensjonsforhold: false },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/afp')
    })
  })

  it('rendrer Step 3 slik den skal når brukeren har samtykket og har tpo medlemskap,', async () => {
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.offentligtp.title'
      )
    })
  })

  it('sender videre til steg 4 når brukeren klikker på Neste', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.neste'))
      expect(navigateMock).toHaveBeenCalledWith('/afp')
    })
  })

  it('sender tilbake til steg 2 når brukeren klikker på Tilbake', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith('/samtykke')
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step3 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith('/')
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })
})
