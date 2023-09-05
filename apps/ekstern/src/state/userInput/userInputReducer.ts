import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Simulation {
  startAlder: number | null
  startMaaned: number | null
  uttaksgrad?: number | null
  aarligInntekt: number | null
}

export interface UserInputState {
  samtykke: boolean | null
  afp: AfpRadio | null
  samboer: boolean | null
  formatertUttaksalder: string | null
  currentSimulation: Simulation
}

export const userInputInitialState: UserInputState = {
  samtykke: null,
  afp: null,
  samboer: null,
  formatertUttaksalder: null,
  currentSimulation: {
    startAlder: null,
    startMaaned: null,
    uttaksgrad: 100, // Hardkodet til 100 for nå - brukeren kan ikke velge gradert pensjon
    aarligInntekt: 0, // Hardkodet til 0 for nå - brukeren kan ikke legge til inntekt vsa. pensjon
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
    setSamboer: (state, action: PayloadAction<boolean>) => {
      state.samboer = action.payload
    },
    setFormatertUttaksalder: (state, action: PayloadAction<string>) => {
      state.formatertUttaksalder = action.payload
    },
    updateCurrentSimulation: (
      state,
      action: PayloadAction<{
        startAlder?: number
        startMaaned?: number
      }>
    ) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        ...action.payload,
      }
    },
    flush: (state) => {
      state.samtykke = null
      state.afp = null
      state.samboer = null
      state.formatertUttaksalder = null
      state.currentSimulation.startAlder = null
      state.currentSimulation.startMaaned = null
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
