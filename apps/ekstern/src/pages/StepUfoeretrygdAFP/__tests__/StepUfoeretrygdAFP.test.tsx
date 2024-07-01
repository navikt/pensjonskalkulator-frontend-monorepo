import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepUfoeretrygdAFP } from '..'
import { paths } from '@/router/constants'
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
})
