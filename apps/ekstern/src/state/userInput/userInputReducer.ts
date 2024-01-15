import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Simulation {
  formatertUttaksalderReadOnly: string | null // (!) Obs READONLY - string i format "YY alder.aar string.og M alder.maaneder" - oppdateres automatisk basert på uttaksalder - se uttaksalderListener
  uttaksalder: Alder | null // valgt uttaksalder for 100% alderspensjon (alder perioden gjelder FRA) - aar heltall, maaneder heltall mellom 0-11
  aarligInntektFoerUttak: number | null // inntekt før uttak av pensjon - heltall beløp i nok - overskriver beløp fra Skatteetaten
  aarligInntektVsaHelPensjon?: {
    // optional
    beloep: number // heltall beløp i nok - inntekt vsa. pensjon
    sluttAlder: Alder // alder inntekt vsa. pensjon tar slutt
  }
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
    uttaksalder: null,
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
    setCurrentSimulationUttaksalder: (
      state,
      action: PayloadAction<{
        aar: number
        maaneder: number
      } | null>
    ) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        uttaksalder: action.payload ? { ...action.payload } : null,
      }
    },
    setCurrentSimulationAarligInntektFoerUttak: (
      state,
      action: PayloadAction<number>
    ) => {
      state.currentSimulation.aarligInntektFoerUttak = action.payload
    },
    setCurrentSimulationAarligInntektVsaHelPensjon: (
      state,
      action: PayloadAction<{ beloep: number; sluttAlder: Alder } | undefined>
    ) => {
      state.currentSimulation.aarligInntektVsaHelPensjon = action.payload
    },
    setCurrentSimulationGradertuttaksperiode: (
      state,
      action: PayloadAction<GradertUttaksperiode | null>
    ) => {
      state.currentSimulation.gradertUttaksperiode = action.payload
    },
    syncCurrentSimulationFormatertUttaksalderReadOnly: (
      state,
      action: PayloadAction<string | null>
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
