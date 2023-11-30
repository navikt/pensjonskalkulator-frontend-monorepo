import {
  selectUtenlandsopphold,
  selectSamtykke,
  selectAfp,
  selectSivilstand,
  selectSamboerFraBrukerInput,
  selectHarHentetTpoMedlemskap,
  selectSamboerFraSivilstand,
  selectSamboer,
  selectInntekt,
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

  describe('selectHarHentetTpoMedlemskap', () => {
    it('returnerer false når /tpo-medlemskap har ikke blitt hentet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectHarHentetTpoMedlemskap(state)).toBeFalsy()
    })
    it('returnerer true når /tpo-medlemskap har blitt hentet', () => {
      const fakeApiCall = {
        queries: {
          ['getTpoMedlemskap(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getTpoMedlemskap',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              harTjenestepensjonsforhold: 'false',
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }
      const state: RootState = {
        ...initialState,
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
      }
      expect(selectHarHentetTpoMedlemskap(state)).toBeTruthy()
    })
  })

  describe('selectSivilstand', () => {
    it('returnerer undefined sivilstand når /person har ikke blitt kalt eller har feilet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectSivilstand(state)).toBe(undefined)
    })
    it('returnerer riktig sivilstand når queryen er vellykket', () => {
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
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
      }
      expect(selectSivilstand(state)).toBe('UGIFT')
    })
  })

  describe('selectSamboerFraSivilstand', () => {
    it('returnerer false når sivilstanden medfører at personen ikke har samboer', () => {
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
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
      }
      expect(selectSamboerFraSivilstand(state)).toBe(false)
    })
    it('returnerer true når sivilstanden medfører at personen har samboer', () => {
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
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
      }
      expect(selectSamboerFraSivilstand(state)).toBe(true)
    })
  })

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
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
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
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
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

  describe('selectInntekt', () => {
    it('returnerer undefined når /inntekt har ikke blitt kalt eller har feilet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectInntekt(state)).toBe(undefined)
    })
    it('returnerer riktig beløp når queryen er vellykket', () => {
      const fakeApiCall = {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getPerson',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              beloep: 500000,
              aar: 2021,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }

      const state: RootState = {
        ...initialState,
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
      }
      const inntekt = selectInntekt(state) as Inntekt
      expect(inntekt.beloep).toBe(500000)
      expect(inntekt.aar).toBe(2021)
    })
  })

  it('selectFormatertUttaksalder', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        formatertUttaksalder: '62 alder.aar string.og 5 alder.maaneder',
      },
    }
    expect(selectFormatertUttaksalder(state)).toBe(
      '62 alder.aar string.og 5 alder.maaneder'
    )
  })

  it('selectCurrentSimulation', () => {
    const currentSimulation = {
      startAar: 62,
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
