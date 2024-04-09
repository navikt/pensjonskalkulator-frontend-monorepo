import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { formatInntekt } from '../../utils/inntekt'

export interface Simulation {
  formatertUttaksalderReadOnly: string | null // (!) Obs READONLY - string i format "YY alder.aar string.og M alder.maaneder" - oppdateres automatisk basert på uttaksalder - se uttaksalderListener
  uttaksalder: Alder | null // valgt uttaksalder for 100% alderspensjon (alder perioden gjelder FRA) - aar heltall, maaneder heltall mellom 0-11
  aarligInntektFoerUttakBeloep: string | null // inntekt før uttak av pensjon - formatert string i nok - overskriver beløp fra Skatteetaten
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  gradertUttaksperiode: GradertUttak | null
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
    aarligInntektFoerUttakBeloep: null,
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
    setCurrentSimulationAarligInntektFoerUttakBeloep: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.currentSimulation.aarligInntektFoerUttakBeloep =
        action.payload !== null ? formatInntekt(action.payload) : null
    },
    setCurrentSimulationAarligInntektVsaHelPensjon: (
      state,
      action: PayloadAction<AarligInntektVsaPensjon | undefined>
    ) => {
      state.currentSimulation.aarligInntektVsaHelPensjon =
        action.payload && action.payload.beloep
          ? {
              ...action.payload,
              beloep: formatInntekt(action.payload?.beloep),
            }
          : undefined
    },
    setCurrentSimulationGradertUttaksperiode: (
      state,
      action: PayloadAction<GradertUttak | null>
    ) => {
      state.currentSimulation.gradertUttaksperiode = action.payload
        ? {
            ...action.payload,
            aarligInntektVsaPensjonBeloep: action.payload
              ? formatInntekt(action.payload.aarligInntektVsaPensjonBeloep)
              : undefined,
          }
        : null
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
