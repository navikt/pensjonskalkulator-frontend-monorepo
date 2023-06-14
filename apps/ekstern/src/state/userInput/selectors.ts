import { AfpRadio } from '@/components/stegvisning/AFP'
import { RootState } from '@/state/store'

export const selectSamtykke = (state: RootState): boolean | null =>
  state.userInput.samtykke

export const selectAfp = (state: RootState): AfpRadio | null =>
  state.userInput.afp

export const selectSamboer = (state: RootState): boolean | null =>
  state.userInput.samboer

export const selectSomething = (state: RootState): string | undefined =>
  state.userInput.currentSimulation?.something
