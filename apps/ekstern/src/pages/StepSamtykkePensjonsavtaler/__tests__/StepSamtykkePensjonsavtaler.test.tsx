import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepSamtykkePensjonsavtaler } from '..'
import {
  fulfilledGetTpoMedlemskap,
  fulfilledGetUfoeregrad,
  fulfilledPensjonsavtaler,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { selectHarHentetTpoMedlemskap } from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'

describe('StepSamtykkePensjonsavtaler', () => {
  it('har riktig sidetittel', async () => {
    render(<StepSamtykkePensjonsavtaler />)
    expect(document.title).toBe('application.title.stegvisning.samtykke')
  })

  describe('Gitt at brukeren svarer Ja på spørsmål om samtykke', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()

      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(<StepSamtykkePensjonsavtaler />)
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.beregn'))

      expect(store.getState().userInput.samtykke).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  describe('Gitt at brukeren svarer Nei på spørsmål om samtykke', async () => {
    it('invaliderer cache for tpo-medlemskap og pensjonsavtaler i storen (for å fjerne evt. data som ble hentet pga en tidligere samtykke). Navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const invalidateMock = vi.spyOn(
        apiSliceUtils.apiSlice.util.invalidateTags,
        'match'
      )
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const user = userEvent.setup()

      const { store } = render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetTpoMedlemskap,
              ...fulfilledPensjonsavtaler,
              ...fulfilledGetUfoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap.initiate()
      )
      expect(Object.keys(store.getState().api.queries).length).toEqual(3)

      expect(selectHarHentetTpoMedlemskap(store.getState())).toBe(true)

      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.beregn'))

      expect(store.getState().userInput.samtykke).toBe(false)
      expect(invalidateMock).toHaveBeenCalledTimes(2)

      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  it('nullstiller input fra brukeren og navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const { store } = render(<StepSamtykkePensjonsavtaler />, {
      preloadedState: {
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      },
      hasRouter: false,
    })
    await store.dispatch(
      apiSliceUtils.apiSlice.endpoints.getUfoeregrad.initiate()
    )
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.tilbake'))
      expect(navigateMock).toHaveBeenCalledWith(-1)
    })
  })
})
