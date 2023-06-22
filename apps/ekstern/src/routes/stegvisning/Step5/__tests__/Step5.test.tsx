import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step5 } from '..'
import { RootState } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('Step 4', () => {
  it('redirigerer til Step 2 når brukeren ikke har svart på spørsmålet om samtykke, ', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step5 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: null },
      } as RootState,
    })
    expect(navigateMock).toHaveBeenCalledWith('/samtykke')
  })

  it('rendrer Step 5 slik den skal når brukeren har samtykket,', async () => {
    render(<Step5 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      } as RootState,
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.sivilstand.title'
      )
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })
  })

  it('registrerer sivilstand og navigerer videre til beregning når brukeren svarer og klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step5 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      } as RootState,
    })
    await waitFor(async () => {
      const radioButtons = screen.getAllByRole('radio')
      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.beregn'))
      expect(store.getState().userInput.samboer).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith('/beregning')
    })
  })

  it('sender tilbake til steg 4 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step5 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith('/afp')
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step5 />, {
      preloadedState: {
        userInput: { samtykke: true, afp: 'nei', samboer: true },
      } as RootState,
    })
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith('/')
      expect(store.getState().userInput.samtykke).toBe(null)
      expect(store.getState().userInput.afp).toBe(null)
      expect(store.getState().userInput.samboer).toBe(null)
    })
  })
})
