import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step2 } from '..'
import { RootState } from '@/state/store'
import { act, screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step 2', () => {
  it('rendrer slik den skal', async () => {
    const result = render(<Step2 />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.steg2.title'
    )
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og navigerer videre når brukeren klikker på Neste', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    render(<Step2 />)
    const radioButtons = screen.getAllByRole('radio')
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })
    waitFor(() => {
      expect(
        screen.getByText('stegvisning.steg2.validation_error')
      ).toBeInTheDocument()
    })
    act(() => {
      fireEvent.click(radioButtons[0])
    })
    expect(
      screen.queryByText('stegvisning.steg2.validation_error')
    ).not.toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByText('stegvisning.neste'))
    })
    waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/stegvisning/3')
    })
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
    fireEvent.click(screen.getByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/1')
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

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith('/')
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('brukeren lagrer samtykke ved å klikke på radio knappene', async () => {
    const { store } = render(<Step2 />)
    const radioButtons = screen.getAllByRole('radio')
    await fireEvent.click(radioButtons[0])
    expect(store.getState().userInput.samtykke).toBe(true)
    await fireEvent.click(radioButtons[1])
    expect(store.getState().userInput.samtykke).toBe(false)
  })
})
