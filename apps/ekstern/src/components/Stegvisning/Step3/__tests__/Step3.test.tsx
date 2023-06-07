import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step3 } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step 3', () => {
  it('rendrer slik den skal', async () => {
    const result = render(<Step3 />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.steg3.title'
    )
    await waitFor(() => {
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('sender videre til steg 4 når brukeren klikker på Neste', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />)
    fireEvent.click(screen.getByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith('/beregning')
  })

  it('sender tilbake til steg 2 når brukeren klikker på Tilbake', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step3 />)

    fireEvent.click(screen.getByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/2')
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step3 />, {
      preloadedState: { userInput: { samtykke: false } } as RootState,
    })

    fireEvent.click(screen.getByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith('/')
    expect(store.getState().userInput.samtykke).toBe(null)
  })
})
