import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step6 } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 6', () => {
  it('har riktig sidetittel', () => {
    render(<Step6 />)
    expect(document.title).toBe('application.title.stegvisning.step6')
  })

  describe('Gitt at brukeren svarer Ja på spørsmål om samtykke til beregning av offentlig AFP', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step6 />, {})
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykkeOffentligAFP).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  describe('Gitt at brukeren svarer Nei på spørsmål om samtykke til beregning av offentlig AFP', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step6 />, {})
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykkeOffentligAFP).toBe(false)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 4 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step6 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykkeOffentligAFP: null },
      },
    })
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    expect(store.getState().userInput.samtykkeOffentligAFP).toBe(null)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step6 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykkeOffentligAFP: false },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykkeOffentligAFP).toBe(null)
  })
})
