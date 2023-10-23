import { describe, it, vi } from 'vitest'

import { tpoMedlemskapAccessGuard } from '../loaders'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'

// TODO skrive tester for de andre loaders
describe('Loaders', () => {
  describe('Loaders', () => {
    it('kaller redirect til /start location når samtykke er null', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
    })

    it('kaller redirect til /afp location når samtykke er oppgitt til false', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: false },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
    })

    it('kaller tp-registret når samtykke er oppgitt til true', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: true },
      }
      store.getState = vi.fn().mockImplementationOnce(() => {
        return mockedState
      })

      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
      expect(initiateMock).toHaveBeenCalled()
    })
  })
})
