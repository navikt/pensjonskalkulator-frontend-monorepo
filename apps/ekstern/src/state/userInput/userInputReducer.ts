import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Simulation {
  inntekt: number | null
  uttaksalder: number | null
  uttaksgrad: number | null
  something?: string
  somethingElse?: string
  hasSomething?: boolean
}

export interface UserInputState {
  samtykke: boolean | null
  currentSimulation: Simulation
}

export const userInputInitialState: UserInputState = {
  samtykke: null,
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
    flush: (state) => {
      state.samtykke = null
    },
    setSomething: (state, action: PayloadAction<string>) => {
      state.currentSimulation.something = action.payload
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
