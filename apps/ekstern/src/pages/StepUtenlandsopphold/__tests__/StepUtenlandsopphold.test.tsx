import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepUtenlandsopphold } from '..'
import { mockResponse } from '@/mocks/server'
import { paths, henvisningUrlParams } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('StepUtenlandsopphold', () => {
  it('har riktig sidetittel', () => {
    render(<StepUtenlandsopphold />)
    expect(document.title).toBe(
      'application.title.stegvisning.utenlandsopphold'
    )
  })

  it('Når brukeren svarer ja på utenlandsopphold, registreres det svaret og brukeren sendes videre til riktig side når hen klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<StepUtenlandsopphold />, {})
    const radioButtons = await screen.findAllByRole('radio')

    await user.click(radioButtons[0])
    await user.click(await screen.findByText('stegvisning.neste'))

    expect(store.getState().userInput.harUtenlandsopphold).toBe(true)
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
    const { store } = render(<StepUtenlandsopphold />, {})
    const radioButtons = await screen.findAllByRole('radio')

    await user.click(radioButtons[1])
    await user.click(await screen.findByText('stegvisning.neste'))

    expect(store.getState().userInput.harUtenlandsopphold).toBe(false)
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('Gitt at brukeren ikke har samboer, nullstiller input fra brukeren og navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<StepUtenlandsopphold />, {
      preloadedState: {
        userInput: { ...userInputInitialState, harUtenlandsopphold: null },
      },
    })
    const radioButtons = await screen.findAllByRole('radio')

    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()

    await user.click(await screen.findByText('stegvisning.tilbake'))

    expect(store.getState().userInput.harUtenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('nullstiller input fra brukeren og navigerer to steg tilbake når brukeren klikker på Tilbake', async () => {
    mockResponse('/v2/person', {
      status: 200,
      json: {
        navn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1963-04-30',
      },
    })

    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<StepUtenlandsopphold />, {
      preloadedState: {
        userInput: { ...userInputInitialState, harUtenlandsopphold: null },
      },
    })
    store.dispatch(apiSlice.endpoints.getPerson.initiate())
    const radioButtons = await screen.findAllByRole('radio')
    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    await user.click(await screen.findByText('stegvisning.tilbake'))
    expect(store.getState().userInput.harUtenlandsopphold).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith(-2)
  })
})
