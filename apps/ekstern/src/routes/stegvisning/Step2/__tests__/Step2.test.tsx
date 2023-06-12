import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step2 } from '..'
import { RootState } from '@/state/store'
import { act, screen, render, fireEvent } from '@/test-utils'

describe('Step 2', () => {
  it('registrerer samtykke, henter pensjonsavtaler og navigerer videre til riktig side når brukeren samtykker og klikker på Neste', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const { store } = render(<Step2 />, {})

    const radioButtons = screen.getAllByRole('radio')

    act(() => {
      fireEvent.click(radioButtons[0])
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })

    expect(store.getState().api.queries).toHaveProperty(
      'getPensjonsavtaler(undefined)'
    )
    expect(store.getState().userInput.samtykke).toBe(true)
    expect(navigateMock).toHaveBeenCalledWith('/offentlig-tp')
  })

  it('registrerer samtykke, tømmer storen og navigerer videre til riktig side når brukeren ikke samtykker og klikker på Neste', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const { store } = render(<Step2 />, {})

    const radioButtons = screen.getAllByRole('radio')

    act(() => {
      fireEvent.click(radioButtons[1])
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })

    expect(store.getState().userInput.samtykke).toBe(false)
    expect(Object.keys(store.getState().api.queries).length).toEqual(0)
    expect(navigateMock).toHaveBeenCalledWith('/afp')
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 1 når brukeren klikker på Tilbake', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[0]).toBeChecked()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.tilbake'))
    })

    expect(navigateMock).toHaveBeenCalledWith('/start')
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: { userInput: { samtykke: false } } as RootState,
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.avbryt'))
    })

    expect(store.getState().userInput.samtykke).toBe(null)
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
