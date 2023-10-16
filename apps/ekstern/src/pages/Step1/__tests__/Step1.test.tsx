import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { paths } from '@/router'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { act, screen, render, userEvent } from '@/test-utils'

describe('Step 1', () => {
  it('har riktig sidetittel', () => {
    render(<Step1 />)
    expect(document.title).toBe('application.title.stegvisning.step1')
  })

  it('Når brukeren svarer ja på utenlandsopphold, sendes brukeren videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await act(async () => {
      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))
    })

    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsoppholdFeil)
  })

  it('Når brukeren svarer nei på utenlandsopphold, registreres det svaret og brukeren er sendt videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1 />, {})
    const radioButtons = screen.getAllByRole('radio')

    await act(async () => {
      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))
    })

    expect(store.getState().userInput.utenlandsopphold).toBe(false)
    expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 1 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, utenlandsopphold: null },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    await act(async () => {
      await user.click(radioButtons[0])
    })

    expect(radioButtons[0]).toBeChecked()

    await act(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
    })

    expect(store.getState().userInput.utenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(paths.start)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, utenlandsopphold: false },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    await act(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
    })

    expect(store.getState().userInput.utenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })
})
