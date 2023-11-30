import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { ErrorPageUnexpected } from '../ErrorPageUnexpected'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('ErrorPageUnexpected', () => {
  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<ErrorPageUnexpected />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(asFragment()).toMatchSnapshot()
  })

  it('sender brukeren til landingside og tømmer storen når brukeren klikker på knappen', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<ErrorPageUnexpected />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
        },
      },
    })
    await user.click(screen.getByText('error.global.button'))
    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
  })
})
