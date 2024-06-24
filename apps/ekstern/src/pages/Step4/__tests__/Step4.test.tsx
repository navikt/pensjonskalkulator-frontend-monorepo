import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step4 } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 4', () => {
  it('har riktig sidetittel', () => {
    render(<Step4 />)
    expect(document.title).toBe('application.title.stegvisning.step4')
  })

  it('sender til Steg 6 når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />)
    await user.click(await screen.findByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
  })

  it('sender tilbake til Steg 3 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />)
    await user.click(await screen.findByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step4 />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          afp: 'ja_privat',
        },
      },
    })

    await user.click(await screen.findByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.afp).toBe(null)
  })
})
