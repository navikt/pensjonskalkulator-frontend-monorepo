import { createSelector } from '@reduxjs/toolkit'

import { apiSlice } from '@/state/api/apiSlice'
import { RootState } from '@/state/store'
import { Simulation } from '@/state/userInput/userInputReducer'
import { checkHarSamboer } from '@/utils/sivilstand'

export const selectUtenlandsopphold = (state: RootState): boolean | null =>
  state.userInput.utenlandsopphold

export const selectSamtykke = (state: RootState): boolean | null =>
  state.userInput.samtykke

export const selectAfp = (state: RootState): AfpRadio | null =>
  state.userInput.afp

export const selectSamboerFraBrukerInput = (state: RootState): boolean | null =>
  state.userInput.samboer

export const selectSivilstand = createSelector(
  [(state) => state, (_, params = undefined) => params],
  (state) => {
    return apiSlice.endpoints.getPerson.select(undefined)(state)?.data
      ?.sivilstand
  }
)

export const selectSamboerFraSivilstand = createSelector(
  [(state) => state, (_, params = undefined) => params],
  (state) => {
    const sivilstand =
      apiSlice.endpoints.getPerson.select(undefined)(state)?.data?.sivilstand
    return sivilstand ? checkHarSamboer(sivilstand) : null
  }
)

export const selectSamboer = (state: RootState): boolean | null => {
  const samboerSkapFraBrukerInput = selectSamboerFraBrukerInput(state)
  if (samboerSkapFraBrukerInput === null) {
    return selectSamboerFraSivilstand(state, undefined)
  }
  return samboerSkapFraBrukerInput
}

// TODO PEK-149 skrive tester
export const selectInntekt = createSelector(
  [(state) => state, (_, params = undefined) => params],
  (state) => {
    return apiSlice.endpoints.getInntekt.select(undefined)(state)?.data
  }
)

export const selectFormatertUttaksalder = (state: RootState): string | null =>
  state.userInput.formatertUttaksalder

export const selectCurrentSimulation = (state: RootState): Simulation =>
  state.userInput.currentSimulation
