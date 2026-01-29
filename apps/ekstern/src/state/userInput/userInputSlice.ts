import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { formatInntekt } from '@/utils/inntekt'

export interface Simulation {
  uttaksalder: Alder | null // valgt uttaksalder for 100% alderspensjon (alder perioden gjelder FRA) - aar heltall, maaneder heltall mellom 0-11
  aarligInntektFoerUttakBeloep: string | null // inntekt før uttak av pensjon - formatert string i nok - overskriver beløp fra Skatteetaten
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  gradertUttaksperiode: GradertUttak | null
  beregningsvalg: Beregningsvalg | null
}

export interface UserInputState {
  veilederBorgerFnr?: string
  veilederBorgerEncryptedFnr?: string
  harUtenlandsopphold: boolean | null
  utenlandsperioder: Utenlandsperiode[]
  samtykke: boolean | null
  samtykkeOffentligAFP: boolean | null
  afp: AfpRadio | null
  afpUtregningValg: AfpUtregningValg
  sivilstand: Sivilstand | null
  epsHarPensjon: boolean | null
  epsHarInntektOver2G: boolean | null
  afpInntektMaanedFoerUttak: boolean | null
  stillingsprosentVsaPensjon: number | null
  stillingsprosentVsaGradertPensjon: number | null
  currentSimulation: Simulation
  xAxis: string[]
}

export const userInputInitialState: UserInputState = {
  veilederBorgerFnr: undefined,
  veilederBorgerEncryptedFnr: undefined,
  harUtenlandsopphold: null,
  utenlandsperioder: [],
  samtykke: null,
  samtykkeOffentligAFP: null,
  afp: null,
  afpUtregningValg: null,
  sivilstand: null,
  epsHarInntektOver2G: null,
  epsHarPensjon: null,
  afpInntektMaanedFoerUttak: null,
  stillingsprosentVsaPensjon: null,
  stillingsprosentVsaGradertPensjon: null,
  currentSimulation: {
    beregningsvalg: null,
    uttaksalder: null,
    aarligInntektFoerUttakBeloep: null,
    gradertUttaksperiode: null,
  },
  xAxis: [],
}

export const userInputSlice = createSlice({
  name: 'userInputSlice',
  initialState: userInputInitialState,
  reducers: {
    setVeilederBorgerFnr: (
      state,
      action: PayloadAction<{ fnr: string; encryptedFnr: string }>
    ) => {
      state.veilederBorgerFnr = action.payload.fnr
      state.veilederBorgerEncryptedFnr = action.payload.encryptedFnr
    },
    setHarUtenlandsopphold: (state, action: PayloadAction<boolean>) => {
      state.harUtenlandsopphold = action.payload
    },
    setUtenlandsperiode: (state, action: PayloadAction<Utenlandsperiode>) => {
      const index = state.utenlandsperioder.findIndex(
        (item) => item.id === action.payload.id
      )
      if (index !== -1) {
        // Update the existing object
        state.utenlandsperioder[index] = action.payload
      } else {
        // Add the new object
        state.utenlandsperioder.push(action.payload)
      }
    },
    deleteUtenlandsperiode: (state, action: PayloadAction<string>) => {
      state.utenlandsperioder = state.utenlandsperioder.filter(
        (utenlandsperiode) => utenlandsperiode.id !== action.payload
      )
    },
    flushUtenlandsperioder: (state) => {
      state.utenlandsperioder = []
    },
    setSamtykke: (state, action: PayloadAction<boolean>) => {
      state.samtykke = action.payload
    },
    setSamtykkeOffentligAFP: (state, action: PayloadAction<boolean>) => {
      state.samtykkeOffentligAFP = action.payload
    },
    setAfp: (state, action: PayloadAction<AfpRadio>) => {
      state.afp = action.payload
    },
    setAfpUtregningValg: (state, action: PayloadAction<AfpUtregningValg>) => {
      state.afpUtregningValg = action.payload
    },
    setAfpInntektMaanedFoerUttak: (
      state,
      action: PayloadAction<boolean | null>
    ) => {
      state.afpInntektMaanedFoerUttak = action.payload
    },
    setStillingsprosentVsaPensjon: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.stillingsprosentVsaPensjon = action.payload
    },
    setStillingsprosentVsaGradertPensjon: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.stillingsprosentVsaGradertPensjon = action.payload
    },
    setSivilstand: (
      state,
      action: PayloadAction<{
        sivilstand: Sivilstand
        epsHarPensjon: boolean | null
        epsHarInntektOver2G: boolean | null
      }>
    ) => {
      state.sivilstand = action.payload.sivilstand
      state.epsHarInntektOver2G = action.payload.epsHarInntektOver2G
      state.epsHarPensjon = action.payload.epsHarPensjon
    },
    setCurrentSimulationBeregningsvalg: (
      state,
      action: PayloadAction<Beregningsvalg | null>
    ) => {
      state.currentSimulation.beregningsvalg = action.payload ?? null
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
      state.currentSimulation.aarligInntektVsaHelPensjon = action.payload
        ?.beloep
        ? {
            ...action.payload,
            beloep: formatInntekt(action.payload.beloep),
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
    setXAxis: (state, action: PayloadAction<string[]>) => {
      state.xAxis = action.payload
    },
    flush: (state) => {
      state.harUtenlandsopphold = null
      state.utenlandsperioder = []
      state.samtykke = null
      state.samtykkeOffentligAFP = null
      state.afp = null
      state.sivilstand = null
      state.epsHarPensjon = null
      state.epsHarInntektOver2G = null
      state.afpUtregningValg = null
      state.afpInntektMaanedFoerUttak = null
      state.currentSimulation = { ...userInputInitialState.currentSimulation }
      state.xAxis = []
      state.stillingsprosentVsaPensjon = null
      state.stillingsprosentVsaGradertPensjon = null
    },
    flushCurrentSimulation: (state) => {
      state.currentSimulation = userInputInitialState.currentSimulation
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
