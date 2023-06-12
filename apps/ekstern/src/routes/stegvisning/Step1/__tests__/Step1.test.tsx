import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { render, screen, fireEvent } from '@/test-utils'

describe('Step 1', () => {
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
