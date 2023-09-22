// import * as ReactRouterUtils from 'react-router'

import { describe, it } from 'vitest'

import { Step1Feil } from '..'
import { screen, render, userEvent, waitFor } from '@/test-utils'

const realLocation = window.location
describe('Step 1 Feil', () => {
  afterEach(() => {
    window.location = realLocation
  })

  it('rendrer Step 1 Feil slik den skal ', () => {
    render(<Step1Feil />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.utenlandsopphold.error.title'
    )
    expect(
      screen.getByText('stegvisning.utenlandsopphold.error.ingress')
    ).toBeVisible()
  })

  // it('redirigerer til xxx når brukeren klikker på primary knappen', async () => {
  //   const user = userEvent.setup()
  //   const navigateMock = vi.fn()
  //   vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
  //     () => navigateMock
  //   )
  //   const { store } = render(<Step5Feil />, {
  //     preloadedState: {
  //       userInput: {
  //         ...userInputInitialState,
  //         samtykke: true,
  //         afp: 'nei',
  //         samboer: true,
  //       },
  //     },
  //   })
  //   await user.click(await screen.findByText('error.global.button.secondary'))
  //   expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
  //   expect(store.getState().userInput.samtykke).toBe(null)
  //   expect(store.getState().userInput.afp).toBe(null)
  //   expect(store.getState().userInput.samboer).toBe(null)
  // })

  // it('redirigerer til xxx når brukeren klikker på secondary knappen', async () => {
  //   const user = userEvent.setup()
  //   const navigateMock = vi.fn()
  //   vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
  //     () => navigateMock
  //   )
  //   const { store } = render(<Step5Feil />, {
  //     preloadedState: {
  //       userInput: {
  //         ...userInputInitialState,
  //         samtykke: true,
  //         afp: 'nei',
  //         samboer: true,
  //       },
  //     },
  //   })
  //   await user.click(await screen.findByText('error.global.button.secondary'))
  //   expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
  //   expect(store.getState().userInput.samtykke).toBe(null)
  //   expect(store.getState().userInput.afp).toBe(null)
  //   expect(store.getState().userInput.samboer).toBe(null)
  // })
})
