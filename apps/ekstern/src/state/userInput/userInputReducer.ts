import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { AfpRadio } from '@/components/stegvisning/AFP'

export interface Simulation {
  inntekt?: number | null
  uttaksalder?: number | null
  uttaksgrad?: number | null
  something?: string
  somethingElse?: string
  hasSomething?: boolean
}

export interface UserInputState {
  samtykke: boolean | null
  afp: AfpRadio | null
  currentSimulation?: Simulation
}

export const userInputInitialState: UserInputState = {
  samtykke: null,
  afp: null,
  currentSimulation: {
    inntekt: null,
    uttaksalder: null,
    uttaksgrad: null,
  },
}

export const userInputSlice = createSlice({
  name: 'userInputSlice',
  initialState: userInputInitialState,
  reducers: {
    setSamtykke: (state, action: PayloadAction<boolean>) => {
      state.samtykke = action.payload
    },
    setAfp: (state, action: PayloadAction<AfpRadio>) => {
      state.afp = action.payload
    },
    flush: (state) => {
      state.samtykke = null
      state.afp = null
    },
    setSomething: (state, action: PayloadAction<string>) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        something: action.payload,
      }
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
