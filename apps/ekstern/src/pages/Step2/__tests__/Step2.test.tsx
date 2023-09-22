import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step2 } from '..'
import { paths } from '@/router'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 2', () => {
  it('har riktig sidetittel', () => {
    render(<Step2 />)
    expect(document.title).toBe('application.title.stegvisning.step2')
  })

  it('registrerer samtykke og navigerer videre til riktig side når brukeren samtykker og klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(store.getState().userInput.samtykke).toBe(true)
    expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
  })

  it('registrerer samtykke, tømmer storen og navigerer videre til riktig side når brukeren ikke samtykker og klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[1])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(store.getState().userInput.samtykke).toBe(false)
    expect(Object.keys(store.getState().api.queries).length).toEqual(0)
    expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 1 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: null },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()

    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
  })
})
