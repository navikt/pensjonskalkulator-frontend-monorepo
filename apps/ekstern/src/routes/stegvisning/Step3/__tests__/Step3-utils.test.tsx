import { describe, it, vi } from 'vitest'

import { step3loader } from '../utils'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'

describe('Step 3 - utils', () => {
  it('kaller redirect til /start location når samtykke er null', async () => {
    const mockedState = {
      userInput: { ...userInputInitialState, samtykke: null },
    }
    store.getState = vi.fn().mockImplementation(() => {
      return mockedState
    })
    expect(await step3loader()).toMatchSnapshot()
  })

  it('kaller redirect til /afp location når samtykke er oppgitt til false', async () => {
    const mockedState = {
      userInput: { ...userInputInitialState, samtykke: false },
    }
    store.getState = vi.fn().mockImplementation(() => {
      return mockedState
    })
    expect(await step3loader()).toMatchSnapshot()
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

    expect(await step3loader()).toMatchSnapshot()
    expect(initiateMock).toHaveBeenCalled()
  })
})
