import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepUfoeretrygdAFP } from '..'
import * as stegvisningUtils from '@/components/stegvisning/stegvisning-utils'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('StepUfoeretrygdAFP', () => {
  it('har riktig sidetittel', () => {
    render(<StepUfoeretrygdAFP />)
    expect(document.title).toBe('application.title.stegvisning.ufoeretryg_AFP')
  })

  it('sender til neste steg når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<StepUfoeretrygdAFP />)
    await user.click(await screen.findByText('stegvisning.neste'))
    expect(navigateMock).toHaveBeenCalledWith(paths.samtykkeOffentligAFP)
  })

  it('navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<StepUfoeretrygdAFP />)
    await user.click(await screen.findByText('stegvisning.tilbake'))
    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('kaller onStegvisningCancel når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const onStegvisningCancelMock = vi
      .spyOn(stegvisningUtils, 'onStegvisningCancel')
      .mockImplementation(vi.fn())
    render(<StepUfoeretrygdAFP />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          afp: 'ja_privat',
        },
      },
    })
    await user.click(await screen.findByText('stegvisning.avbryt'))
    expect(onStegvisningCancelMock).toHaveBeenCalled()
  })
})
