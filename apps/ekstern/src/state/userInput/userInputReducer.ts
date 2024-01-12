import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Simulation {
  formatertUttaksalderReadOnly: string | null // (!) Obs READONLY - string i format "YY alder.aar string.og M alder.maaneder" - oppdateres automatisk basert på startAlder - se uttaksalderListener
  startAlder: Alder | null // valgt uttaksalder for 100% alderspensjon (alder perioden gjelder FRA) - aar heltall, maaneder heltall mellom 0-11
  aarligInntektFoerUttak: number | null // inntekt før uttak av pensjon - heltall beløp i nok - overskriver beløp fra Skatteetaten
  aarligInntektVsaPensjon?: number // optional: heltall beløp i nok - inntekt vsa. pensjon
  gradertUttaksperiode: GradertUttaksperiode | null
}

export interface UserInputState {
  utenlandsopphold: boolean | null
  samtykke: boolean | null
  afp: AfpRadio | null
  samboer: boolean | null
  currentSimulation: Simulation
}

export const userInputInitialState: UserInputState = {
  utenlandsopphold: null,
  samtykke: null,
  afp: null,
  samboer: null,
  currentSimulation: {
    formatertUttaksalderReadOnly: null,
    startAlder: null,
    aarligInntektFoerUttak: null,
    gradertUttaksperiode: null,
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
    // TODO utvide test til å støtte null
    setCurrentSimulationStartAlder: (
      state,
      action: PayloadAction<{
        aar: number
        maaneder: number
      } | null>
    ) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        startAlder: action.payload ? { ...action.payload } : null,
      }
    },
    setCurrentSimulationAarligInntektFoerUttak: (
      state,
      action: PayloadAction<number>
    ) => {
      state.currentSimulation.aarligInntektFoerUttak = action.payload
    },
    setCurrentSimulationAarligInntektVsaPensjon: (
      state,
      action: PayloadAction<number | undefined>
    ) => {
      state.currentSimulation.aarligInntektVsaPensjon = action.payload
    },
    setCurrentSimulationGradertuttaksperiode: (
      state,
      action: PayloadAction<GradertUttaksperiode | null>
    ) => {
      state.currentSimulation.gradertUttaksperiode = action.payload
    },
    syncCurrentSimulationFormatertUttaksalderReadOnly: (
      state,
      action: PayloadAction<string>
    ) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        formatertUttaksalderReadOnly: action.payload,
      }
    },
    flush: (state) => {
      state.utenlandsopphold = null
      state.samtykke = null
      state.afp = null
      state.samboer = null
      state.currentSimulation = { ...userInputInitialState.currentSimulation }
    },
    flushCurrentSimulation: (state) => {
      state.currentSimulation = { ...userInputInitialState.currentSimulation }
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
