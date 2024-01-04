import {
  selectUtenlandsopphold,
  selectSamtykke,
  selectAfp,
  selectSivilstand,
  selectSamboerFraBrukerInput,
  selectSamboerFraSivilstand,
  selectSamboer,
  selectAarligInntektFoerUttakFraBrukerInput,
  selectAarligInntektFoerUttakFraSkatt,
  selectAarligInntektFoerUttak,
  selectFormatertUttaksalderReadOnly,
  selectCurrentSimulation,
  selectHarHentetTpoMedlemskap,
} from '../selectors'
import { store, RootState } from '@/state/store'
import { Simulation } from '@/state/userInput/userInputReducer'

describe('userInput selectors', () => {
  const initialState = store.getState()

  const currentSimulation: Simulation = {
    uttaksperioder: [],
    formatertUttaksalderReadOnly: '62 alder.aar string.og 5 alder.maaneder',
    startAlder: { aar: 62, maaneder: 5 },
    aarligInntektFoerUttak: 0,
  }

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

  it('selectAarligInntektFoerUttakFraBrukerInput', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: {
          ...currentSimulation,
          aarligInntektFoerUttak: 512000,
        },
      },
    }
    expect(selectAarligInntektFoerUttakFraBrukerInput(state)).toBe(512000)
  })

  describe('selectAarligInntektFoerUttakFraSkatt', () => {
    it('returnerer undefined når /inntekt har ikke blitt kalt eller har feilet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectAarligInntektFoerUttakFraSkatt(state)).toBe(undefined)
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
      const inntekt = selectAarligInntektFoerUttakFraSkatt(state) as Inntekt
      expect(inntekt.beloep).toBe(500000)
      expect(inntekt.aar).toBe(2021)
    })
  })

  describe('selectAarligInntektFoerUttak', () => {
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
    it('returnerer inntekt basert på svaret som brukeren har oppgitt, som overskriver opprinnelig inntekt hentet fra Skatteetaten', () => {
      const state: RootState = {
        ...initialState,
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
        userInput: {
          ...initialState.userInput,
          currentSimulation: {
            ...currentSimulation,
            aarligInntektFoerUttak: 350000,
          },
        },
      }
      expect(selectAarligInntektFoerUttak(state)).toBe(350000)
    })

    it('returnerer inntekt fra Skatteetaten, når brukeren ikke har overskrevet den', () => {
      const state: RootState = {
        ...initialState,
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        api: {
          ...fakeApiCall,
        },
        userInput: {
          ...initialState.userInput,
          currentSimulation: {
            ...currentSimulation,
            aarligInntektFoerUttak: null,
          },
        },
      }
      expect(selectAarligInntektFoerUttak(state)).toBe(500000)
    })
  })

  it('selectFormatertUttaksalder', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: {
          ...currentSimulation,
        },
      },
    }
    expect(selectFormatertUttaksalderReadOnly(state)).toBe(
      '62 alder.aar string.og 5 alder.maaneder'
    )
  })

  it('selectCurrentSimulation', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: { ...currentSimulation },
      },
    }
    expect(selectCurrentSimulation(state)).toEqual(currentSimulation)
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
})
