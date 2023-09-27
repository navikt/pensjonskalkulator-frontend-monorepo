import {
  selectUtenlandsopphold,
  selectSamtykke,
  selectAfp,
  selectSamboerFraBrukerInput,
  selectSamboerFraSivilstand,
  selectSamboer,
  selectFormatertUttaksalder,
  selectCurrentSimulation,
} from '../selectors'
import { store, RootState } from '@/state/store'

describe('userInput selectors', () => {
  const initialState = store.getState()

  it('selectUtenlandsopphold', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        utenlandsopphold: true,
      },
    }
    expect(selectUtenlandsopphold(state)).toBe(true)
  })

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

  it('selectSamboerFraBrukerInput', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        samboer: true,
      },
    }
    expect(selectSamboerFraBrukerInput(state)).toBe(true)
  })

  // describe('selectSamboerFraSivilstand', () => {
  //   it('returnerer false når sivilstanden medfører at personen ikke har samboer', () => {
  //     const fakeApiCall = {
  //       queries: {
  //         ['getPerson(undefined)']: {
  //           status: 'fulfilled',
  //           endpointName: 'getPerson',
  //           requestId: 'xTaE6mOydr5ZI75UXq4Wi',
  //           startedTimeStamp: 1688046411971,
  //           data: {
  //             fornavn: 'Aprikos',
  //             sivilstand: 'UGIFT',
  //             foedselsdato: '1963-04-30',
  //           },
  //           fulfilledTimeStamp: 1688046412103,
  //         },
  //       },
  //     }

  //     const state: RootState = {
  //       ...initialState,
  //       api: {
  //         ...fakeApiCall,
  //       },
  //     }
  //     expect(selectSamboerFraSivilstand(state)).toBe(false)
  //   })
  //   it('returnerer true når sivilstanden medfører at personen har samboer', () => {
  //     const fakeApiCall = {
  //       queries: {
  //         ['getPerson(undefined)']: {
  //           status: 'fulfilled',
  //           endpointName: 'getPerson',
  //           requestId: 'xTaE6mOydr5ZI75UXq4Wi',
  //           startedTimeStamp: 1688046411971,
  //           data: {
  //             fornavn: 'Aprikos',
  //             sivilstand: 'GIFT',
  //             foedselsdato: '1963-04-30',
  //           },
  //           fulfilledTimeStamp: 1688046412103,
  //         },
  //       },
  //     }

  //     const state: RootState = {
  //       ...initialState,
  //       api: {
  //         ...fakeApiCall,
  //       },
  //     }
  //     expect(selectSamboerFraSivilstand(state)).toBe(true)
  //   })
  // })

  describe('selectSamboer', () => {
    it('returnerer samboerskap basert på svaret som brukeren har oppgitt, til tross for at sivilstanden sier noe annet', () => {
      const fakeApiCall = {
        queries: {
          ['getPerson(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getPerson',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              fornavn: 'Aprikos',
              sivilstand: 'UGIFT',
              foedselsdato: '1963-04-30',
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }

      const state: RootState = {
        ...initialState,
        api: {
          ...fakeApiCall,
        },
        userInput: {
          ...initialState.userInput,
          samboer: true,
        },
      }
      expect(selectSamboer(state)).toBe(true)
    })

    it('returnerer samboerskap basert på sivilstand, og at brukeren ikke svarte spørsmålet om samboer', () => {
      const fakeApiCall = {
        queries: {
          ['getPerson(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getPerson',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              fornavn: 'Aprikos',
              sivilstand: 'GIFT',
              foedselsdato: '1963-04-30',
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }

      const state: RootState = {
        ...initialState,
        api: {
          ...fakeApiCall,
        },
        userInput: {
          ...initialState.userInput,
          samboer: null,
        },
      }
      expect(selectSamboer(state)).toBe(true)
    })
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
