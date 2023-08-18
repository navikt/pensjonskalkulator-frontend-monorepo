import { AfpRadio } from '@/components/stegvisning/AFP'
import { RootState } from '@/state/store'
import { Simulation } from '@/state/userInput/userInputReducer'

export const selectSamtykke = (state: RootState): boolean | null =>
  state.userInput.samtykke

export const selectAfp = (state: RootState): AfpRadio | null =>
  state.userInput.afp

export const selectSamboer = (state: RootState): boolean | null =>
  state.userInput.samboer

export const selectFormatertUttaksalder = (state: RootState): string | null =>
  state.userInput.formatertUttaksalder

export const selectCurrentSimulation = (state: RootState): Simulation =>
  state.userInput.currentSimulation
