import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step 1', () => {
  it('rendrer slik den skal', async () => {
    const result = render(<Step1 />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.steg1.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(radioButtons[0]).not.toBeChecked()
    expect(radioButtons[1]).not.toBeChecked()
    await waitFor(() => {
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('sender videre til steg 2 når brukeren klikker på Neste', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    fireEvent.click(screen.getByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith('/beregning')
  })

  it('nullstiller input fra brukeren og  sender tilbake til steg 0 når brukeren klikker på Tilbake', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1 />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[0]).toBeChecked()
    fireEvent.click(screen.getByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/0')
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1 />, {
      preloadedState: { userInput: { samtykke: false } } as RootState,
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith('/')
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('brukeren lagrer samtykke ved å klikke på radio knappene', async () => {
    const { store } = render(<Step1 />)
    const radioButtons = screen.getAllByRole('radio')
    await fireEvent.click(radioButtons[0])
    expect(store.getState().userInput.samtykke).toBe(true)
    await fireEvent.click(radioButtons[1])
    expect(store.getState().userInput.samtykke).toBe(false)
  })
})
