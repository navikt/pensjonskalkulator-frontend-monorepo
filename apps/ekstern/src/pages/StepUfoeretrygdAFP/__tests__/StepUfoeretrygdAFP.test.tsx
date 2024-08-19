import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepUfoeretrygdAFP } from '..'
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

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      render(<StepUfoeretrygdAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '81549300',
          },
        },
      })
      expect(await screen.findAllByRole('button')).toHaveLength(3)
    })
  })
})
