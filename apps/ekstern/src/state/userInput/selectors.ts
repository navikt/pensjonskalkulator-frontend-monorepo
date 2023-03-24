import { RootState } from '../store'

export const selectSamtykke = (state: RootState): boolean | null =>
  state.userInput.samtykke

export const selectSomething = (state: RootState): string | undefined =>
  state.userInput.currentSimulation.something
