import {
  selectSamtykke,
  selectAfp,
  selectSamboer,
  selectFormatertUttaksalder,
  selectCurrentSimulation,
} from '../selectors'
import { store, RootState } from '@/state/store'

describe('userInput selectors', () => {
  const initialState = store.getState()

  it('selectSamtykke', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        samtykke: true,
      },
    }
    expect(selectSamtykke(state)).toBe(true)
  })

  it('selectAfp', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        afp: 'nei',
      },
    }
    expect(selectAfp(state)).toBe('nei')
  })

  it('selectSamboer', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        samboer: true,
      },
    }
    expect(selectSamboer(state)).toBe(true)
  })

  it('selectFormatertUttaksalder', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        formatertUttaksalder: '62 år og 5 måneder',
      },
    }
    expect(selectFormatertUttaksalder(state)).toBe('62 år og 5 måneder')
  })

  it('selectCurrentSimulation', () => {
    const currentSimulation = {
      startAlder: 62,
      startMaaned: 5,
      uttaksgrad: 100,
      aarligInntekt: 0,
    }
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: { ...currentSimulation },
      },
    }
    expect(selectCurrentSimulation(state)).toEqual(currentSimulation)
  })
})
