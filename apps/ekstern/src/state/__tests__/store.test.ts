import { describe, it } from 'vitest'

import { setupStore } from '../store'
import { UserInputState } from '../userInput/userInputReducer'

describe('store', () => {
  it.skip('returnerer store med riktig slices og default state', () => {
    const store = setupStore()
    const initialState = store.getState()
    expect(initialState).toMatchSnapshot()
  })

  it('returnerer store med riktig state når setupStore kalles med parameter', () => {
    const state: UserInputState = {
      veilderBorgerFnr: undefined,
      utenlandsopphold: true,
      samtykke: true,
      afp: null,
      samboer: null,
      currentSimulation: {
        formatertUttaksalderReadOnly: null,
        uttaksalder: null,
        aarligInntektFoerUttakBeloep: 500000,
        gradertUttaksperiode: null,
      },
    }

    const store = setupStore({ userInput: state }, true)
    const initialState = store.getState()

    expect(initialState.userInput).toMatchObject(state)
  })
})
