import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { screen, render, waitFor, fireEvent } from '@/test-utils'

describe('Step', () => {
  it('rendrer slik den skal', async () => {
    const result = render(<Step1 />)

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
    fireEvent.click(screen.getByText('Gå til Beregningen'))
    expect(navigateMock).toHaveBeenCalledWith('/beregning')
  })

  it('sender videre til beregningen når brukeren klikker på Avbryt', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    fireEvent.click(screen.getByText('Tilbake'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/0')
  })
})
