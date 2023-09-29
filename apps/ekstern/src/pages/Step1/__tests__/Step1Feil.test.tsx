import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1Feil } from '..'
import { externalUrls } from '@/router'
import { paths } from '@/router/routes'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 1 Feil', () => {
  it('har riktig sidetittel', () => {
    render(<Step1Feil />)
    expect(document.title).toBe('application.title.stegvisning.step1.feil')
  })

  it('rendrer Step 1 Feil slik den skal', () => {
    render(<Step1Feil />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.utenlandsopphold.error.title'
    )
    expect(
      screen.getByText('stegvisning.utenlandsopphold.error.ingress')
    ).toBeVisible()
  })

  it('redirigerer til detaljert kalkulator når brukeren klikker på primary knappen', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)

    const user = userEvent.setup()

    render(<Step1Feil />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          utenlandsopphold: true,
        },
      },
    })
    await user.click(
      await screen.findByText(
        'stegvisning.utenlandsopphold.error.button.primary'
      )
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })

  it('redirigerer til login siden når brukeren klikker på secondary knappen', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step1Feil />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          utenlandsopphold: false,
        },
      },
    })
    await user.click(await screen.findByText('error.global.button'))
    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
    expect(store.getState().userInput.utenlandsopphold).toBe(null)
  })
})
