import { describe, it } from 'vitest'

import { VeilederInput } from '../'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, waitFor } from '@/test-utils'

describe('VeilederInput', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })
  it('viser input når borger ikke er valgt', () => {
    render(<VeilederInput />, { hasRouter: false })
    expect(screen.getByTestId('borger-fnr-input')).toBeInTheDocument()
  })

  it('viser kalkulator når borger er valgt', async () => {
    render(<VeilederInput />, {
      hasRouter: false,
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          veilderBorgerFnr: '12345678901',
        },
      },
    })
    await waitFor(async () => {
      expect(screen.queryByTestId('borger-fnr-input')).not.toBeInTheDocument()
    })
  })

  it('viser inaktivet alert', async () => {
    vi.spyOn(URLSearchParams.prototype, 'has').mockImplementation(() => true)
    render(<VeilederInput />, {
      hasRouter: false,
    })
    await waitFor(async () => {
      expect(screen.getByTestId('inaktiv-alert')).toBeInTheDocument()
    })
  })
})
