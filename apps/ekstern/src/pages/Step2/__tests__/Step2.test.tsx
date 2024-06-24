import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step2 } from '..'
import { paths, henvisningUrlParams } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 2', () => {
  it('har riktig sidetittel', () => {
    render(<Step2 />)
    expect(document.title).toBe('application.title.stegvisning.step2')
  })

  it('Når brukeren svarer ja på utenlandsopphold, sendes brukeren videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step2 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(navigateMock).toHaveBeenCalledWith(
      `${paths.henvisning}/${henvisningUrlParams.utland}`
    )
  })

  it('Når brukeren svarer nei på utenlandsopphold, registreres det svaret og brukeren er sendt videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[1])
    await user.click(screen.getByText('stegvisning.neste'))

    expect(store.getState().userInput.utenlandsopphold).toBe(false)
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 1 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, utenlandsopphold: null },
      },
    })
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])

    expect(radioButtons[0]).toBeChecked()

    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(store.getState().userInput.utenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, utenlandsopphold: false },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(store.getState().userInput.utenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })
})
