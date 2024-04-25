import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step6 } from '..'
import { mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Step 6', () => {
  it('har riktig sidetittel', async () => {
    render(<Step6 />)
    await waitFor(() => {
      expect(document.title).toBe('application.title.stegvisning.step6')
    })
  })

  it('rendrer Step 6 slik den skal når brukeren har svart på spørsmålet om samtykke,', async () => {
    render(<Step6 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.sivilstand.title'
      )
      expect(screen.getAllByRole('radio')).toHaveLength(2)
    })
  })

  it('registrerer sivilstand og navigerer videre til beregning når brukeren svarer og klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step6 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    const radioButtons = await screen.findAllByRole('radio')
    expect(radioButtons[0]).not.toBeChecked()
    expect(radioButtons[1]).not.toBeChecked()
    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.beregn'))
    expect(store.getState().userInput.samboer).toBe(true)
    expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
  })

  it('sender tilbake til steg 5 når brukeren som mottar uføretrygd klikker på Tilbake', async () => {
    const user = userEvent.setup()
    mockResponse('/v1/ekskludert', {
      status: 200,
      json: {
        ekskludert: true,
        aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const { store } = render(<Step6 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      },
    })
    store.dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygd)
    })
  })

  it('sender tilbake til steg 4 når brukeren som ikke mottar uføretrygd klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step6 />)

    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(paths.afp)
    })
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step6 />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          afp: 'nei',
          samboer: true,
        },
      },
    })
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.login)
      expect(store.getState().userInput.samtykke).toBe(null)
      expect(store.getState().userInput.afp).toBe(null)
      expect(store.getState().userInput.samboer).toBe(null)
    })
  })
})
