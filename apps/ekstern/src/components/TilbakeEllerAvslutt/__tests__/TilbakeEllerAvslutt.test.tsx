import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { TilbakeEllerAvslutt } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('TilbakeEllerAvslutt', () => {
  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<TilbakeEllerAvslutt />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(asFragment()).toMatchSnapshot()
  })

  it('nullstiller input fra brukeren og redirigerer til første steg av stegvisning når brukeren klikker på Start ny beregning', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<TilbakeEllerAvslutt />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })

    await user.click(screen.getByText('stegvisning.tilbake_start'))
    expect(navigateMock).toHaveBeenCalledWith(paths.start)
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('redirigerer til Din Pensjon når brukeren klikker på Avslutt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<TilbakeEllerAvslutt />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })

    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
  })
})
