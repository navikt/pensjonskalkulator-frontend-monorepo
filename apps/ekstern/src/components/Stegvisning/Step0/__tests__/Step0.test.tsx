import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step0 } from '..'
import { render, screen, waitFor, fireEvent } from '@/test-utils'

describe('Step', () => {
  it('rendrer slik den skal, med riktig heading, bilde, tekst og knapper', async () => {
    const result = render(<Step0 />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.steg0.title'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('sender videre til steg 1 når brukeren klikker på Neste', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)
    fireEvent.click(screen.getByText('stegvisning.steg0.neste_button'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/1')
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)
    fireEvent.click(screen.getByText('stegvisning.steg0.avbryt_button'))
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
