import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Simulation {
  startAar: number | null
  startMaaned: number | null
  aarligInntektFoerUttak: number | null // inntekt før uttak av pensjon - overskriver beløp fra Skatteetaten
  uttaksgrad?: number // optional: ikke i bruk - hardkodet til 100 fordi brukeren ikke kan velge gradert pensjon
  aarligInntekt?: number // optional: ikke i bruk - hardkodet til 0 fordi brukeren ikke kan legge til inntekt vsa. pensjon
}

export interface UserInputState {
  utenlandsopphold: boolean | null
  samtykke: boolean | null
  afp: AfpRadio | null
  samboer: boolean | null
  formatertUttaksalder: string | null
  currentSimulation: Simulation
}

export const userInputInitialState: UserInputState = {
  utenlandsopphold: null,
  samtykke: null,
  afp: null,
  samboer: null,
  formatertUttaksalder: null,
  currentSimulation: {
    startAar: null,
    startMaaned: null,
    aarligInntektFoerUttak: null,
    // uttaksgrad: 100,
    // aarligInntekt: 0,
  },
}

export const userInputSlice = createSlice({
  name: 'userInputSlice',
  initialState: userInputInitialState,
  reducers: {
    setUtenlandsopphold: (state, action: PayloadAction<boolean>) => {
      state.utenlandsopphold = action.payload
    },
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
        startAar?: number
        startMaaned?: number
        aarligInntektFoerUttak?: number
      }>
    ) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        ...action.payload,
      }
    },
    flush: (state) => {
      state.utenlandsopphold = null
      state.samtykke = null
      state.afp = null
      state.samboer = null
      state.formatertUttaksalder = null
      state.currentSimulation.startAar = null
      state.currentSimulation.startMaaned = null
      state.currentSimulation.aarligInntektFoerUttak = null
    },
    flushCurrentSimulation: (state) => {
      state.currentSimulation.startAar = null
      state.currentSimulation.startMaaned = null
      state.currentSimulation.aarligInntektFoerUttak = null
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
