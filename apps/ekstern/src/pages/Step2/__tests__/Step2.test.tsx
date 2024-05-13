import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step2 } from '..'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { selectHarHentetTpoMedlemskap } from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent } from '@/test-utils'

describe('Step 2', () => {
  it('har riktig sidetittel', () => {
    render(<Step2 />)
    expect(document.title).toBe('application.title.stegvisning.step2')
  })

  describe('Gitt at brukeren svarer Ja på spørsmål om samtykke', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step2 />, {})
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykke).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
    })
  })

  describe('Gitt at brukeren svarer Nei på spørsmål om samtykke', async () => {
    it('invaliderer cache for tpo-medlemskap og pensjonsavtaler i storen (for å fjerne evt. data som ble hentet pga en tidligere samtykke). Navigerer videre til riktig side når brukerenklikker på Neste', async () => {
      const fakeApiCalls = {
        queries: {
          ['getTpoMedlemskap(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getTpoMedlemskap',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              harTjenestePensjonsforhold: true,
            },
            fulfilledTimeStamp: 1688046412103,
          },
          ['pensjonsavtaler(undefined)']: {
            status: 'fulfilled',
            endpointName: 'pensjonsavtaler',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              avtaler: [],
              partialResponse: false,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }

      const invalidateMock = vi.spyOn(
        apiSliceUtils.apiSlice.util.invalidateTags,
        'match'
      )

      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(<Step2 />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap.initiate()
      )
      expect(Object.keys(store.getState().api.queries).length).toEqual(2)

      expect(selectHarHentetTpoMedlemskap(store.getState())).toBe(true)

      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykke).toBe(false)
      expect(invalidateMock).toHaveBeenCalledTimes(2)

      expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
    })
  })

  it('nullstiller input fra brukeren og sender tilbake til steg 1 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: null },
      },
    })
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step2 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
  })
})
