import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { formatInntekt } from '@/utils/inntekt'

export interface Simulation {
  utenlandsperioder: Utenlandsperiode[]
  formatertUttaksalderReadOnly: string | null // (!) Obs READONLY - string i format "YY alder.aar string.og M alder.maaneder" - oppdateres automatisk basert på uttaksalder - se uttaksalderListener
  uttaksalder: Alder | null // valgt uttaksalder for 100% alderspensjon (alder perioden gjelder FRA) - aar heltall, maaneder heltall mellom 0-11
  aarligInntektFoerUttakBeloep: string | null // inntekt før uttak av pensjon - formatert string i nok - overskriver beløp fra Skatteetaten
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  gradertUttaksperiode: GradertUttak | null
}

export interface UserInputState {
  veilederBorgerFnr?: string
  veilederBorgerEncryptedFnr?: string
  harUtenlandsopphold: boolean | null
  samtykke: boolean | null
  samtykkeOffentligAFP: boolean | null
  afp: AfpRadio | null
  sivilstand: Sivilstand | null
  epsHarPensjon: boolean | null
  epsHarInntektOver2G: boolean | null
  currentSimulation: Simulation
}

export const userInputInitialState: UserInputState = {
  veilederBorgerFnr: undefined,
  veilederBorgerEncryptedFnr: undefined,
  harUtenlandsopphold: null,
  samtykke: null,
  samtykkeOffentligAFP: null,
  afp: null,
  sivilstand: null,
  epsHarInntektOver2G: null,
  epsHarPensjon: null,
  currentSimulation: {
    utenlandsperioder: [],
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
    setSamtykke: (state, action: PayloadAction<boolean>) => {
      state.samtykke = action.payload
    },
    setSamtykkeOffentligAFP: (state, action: PayloadAction<boolean>) => {
      state.samtykkeOffentligAFP = action.payload
    },
    setAfp: (state, action: PayloadAction<AfpRadio>) => {
      state.afp = action.payload
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
    setCurrentSimulationUtenlandsperiode: (
      state,
      action: PayloadAction<Utenlandsperiode>
    ) => {
      const previousUtenlandsperioderArray =
        state.currentSimulation.utenlandsperioder
      const index = previousUtenlandsperioderArray.findIndex(
        (item) => item.id === action.payload.id
      )
      if (index !== -1) {
        // Update the existing object
        previousUtenlandsperioderArray[index] = action.payload
      } else {
        // Add the new object
        previousUtenlandsperioderArray.push(action.payload)
      }
      state.currentSimulation = {
        ...state.currentSimulation,
        utenlandsperioder: previousUtenlandsperioderArray,
      }
    },
    deleteCurrentSimulationUtenlandsperiode: (
      state,
      action: PayloadAction<string>
    ) => {
      const updatedUtenlandsperioderArray =
        state.currentSimulation.utenlandsperioder.filter(
          (utenlandsperiode) => utenlandsperiode.id !== action.payload
        )
      state.currentSimulation = {
        ...state.currentSimulation,
        utenlandsperioder: updatedUtenlandsperioderArray,
      }
    },
    deleteCurrentSimulationAlleUtenlandsperioder: (state) => {
      state.currentSimulation = {
        ...state.currentSimulation,
        utenlandsperioder: [],
      }
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
      state.harUtenlandsopphold = null
      state.samtykke = null
      state.samtykkeOffentligAFP = null
      state.afp = null
      state.sivilstand = null
      state.epsHarPensjon = null
      state.epsHarInntektOver2G = null
      state.currentSimulation = { ...userInputInitialState.currentSimulation }
    },
    flushCurrentSimulationUtenomUtenlandsperioder: (state) => {
      const utenlandsperioder = state.currentSimulation.utenlandsperioder
      state.currentSimulation = {
        ...userInputInitialState.currentSimulation,
        utenlandsperioder,
      }
    },
  },
})

export default userInputSlice.reducer

export const userInputActions = userInputSlice.actions

export type UserInputSlice = {
  [userInputSlice.name]: ReturnType<(typeof userInputSlice)['reducer']>
}
