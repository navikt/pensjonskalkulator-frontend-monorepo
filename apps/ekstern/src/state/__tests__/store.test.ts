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
      utenlandsopphold: true,
      samtykke: true,
      afp: null,
      samboer: null,
      formatertUttaksalder: null,
      currentSimulation: {
        startAar: null,
        startMaaned: null,
        aarligInntekt: 500000,
        uttaksgrad: 0,
      },
    }

    const store = setupStore({ userInput: state }, true)
    const initialState = store.getState()

    expect(initialState.userInput).toMatchObject(state)
  })
})
