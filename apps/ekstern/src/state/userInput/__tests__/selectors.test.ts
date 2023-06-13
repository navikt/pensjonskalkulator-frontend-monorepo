import { selectSamtykke, selectAfp, selectSomething } from '../selectors'
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

  it('selectSomething', () => {
    const somethingString = 'lorem ipsum dolor sit amet'
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: {
          ...initialState.userInput.currentSimulation,
          something: somethingString,
        },
      },
    }
    expect(selectSomething(state)).toBe(somethingString)
  })
})
