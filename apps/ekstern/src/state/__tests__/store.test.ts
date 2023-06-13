import { describe, it } from 'vitest'

import { setupStore } from '../store'
import { UserInputState } from '../userInput/userInputReducer'

describe('store', () => {
  it('returnerer store med riktig slices og default state', () => {
    const store = setupStore()
    const initialState = store.getState()
    expect(initialState).toMatchSnapshot()
  })

  it('returnerer store med riktig state når setupStore kalles med parameter', () => {
    const state: UserInputState = {
      samtykke: true,
      afp: null,
      currentSimulation: {
        inntekt: 500000,
        uttaksalder: null,
        uttaksgrad: null,
      },
    }

    const store = setupStore({ api: undefined, userInput: state }, true)
    const initialState = store.getState()

    expect(initialState.userInput).toMatchObject(state)
  })
})
