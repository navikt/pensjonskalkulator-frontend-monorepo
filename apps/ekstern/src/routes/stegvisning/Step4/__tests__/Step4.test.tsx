import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step4 } from '..'
import { mockResponse } from '@/mocks/server'
import { RootState } from '@/state/store'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step 4', () => {
  it('redirigerer til Step 2 når brukeren ikke har svart på spørsmålet om samtykke, ', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />, {
      preloadedState: { userInput: { samtykke: null } } as RootState,
    })
    expect(navigateMock).toHaveBeenCalledWith('/samtykke')
  })

  it('rendrer Step 4 slik den skal når brukeren ikke har samtykket,', async () => {
    render(<Step4 />, {
      preloadedState: { userInput: { samtykke: false } } as RootState,
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.afp.title'
      )
      expect(screen.getAllByRole('radio')).toHaveLength(4)
    })
  })

  it('rendrer Step 4 slik den skal når brukeren har samtykket og har tpo medlemskap, ', async () => {
    render(<Step4 />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.afp.title'
      )
      expect(screen.getAllByRole('radio')).toHaveLength(4)
    })
  })

  it('registrerer afp og navigerer videre til steg 5 når brukeren velger afp og klikker på Neste', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step4 />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })
    await waitFor(() => {
      const radioButtons = screen.getAllByRole('radio')
      // act(() => {
      fireEvent.click(radioButtons[0])
      fireEvent.click(screen.getByText('stegvisning.neste'))
      // })
      expect(store.getState().userInput.afp).toBe('ja_offentlig')
      expect(navigateMock).toHaveBeenCalledWith('/beregning')
    })
  })

  it('sender tilbake til steg 2 når brukeren ikke har tpo-medlemskap og klikker på Tilbake', async () => {
    mockResponse('/tpo-medlemskap', {
      status: 200,
      json: { harTjenestepensjonsforhold: false },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />)
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith('/samtykke')
    })
  })

  it('sender tilbake til steg 3 når brukeren har tpo medlemskap og klikker på Tilbake', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith('/offentlig-tp')
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step4 />, {
      preloadedState: {
        userInput: { samtykke: true, afp: 'nei' },
      } as RootState,
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith('/')
      expect(store.getState().userInput.samtykke).toBe(null)
      expect(store.getState().userInput.afp).toBe(null)
    })
  })
})
