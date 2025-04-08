import {
  fulfilledGetInntekt,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
  fulfilledGetLoependeVedtakLoependeAFPoffentlig,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { RootState, store } from '@/state/store'
import { Simulation } from '@/state/userInput/userInputSlice'

import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAfp,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectFoedselsdato,
  selectFormatertUttaksalderReadOnly,
  selectHarUtenlandsopphold,
  selectIsEndring,
  selectIsVeileder,
  selectLoependeVedtak,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectUfoeregrad,
  selectUtenlandsperioder,
  selectVeilederBorgerEncryptedFnr,
  selectVeilederBorgerFnr,
} from '../selectors'

describe('userInput selectors', () => {
  const initialState = store.getState()

  const currentSimulation: Simulation = {
    beregningsvalg: null,
    formatertUttaksalderReadOnly: '62 alder.aar string.og 5 alder.maaneder',
    uttaksalder: { aar: 62, maaneder: 5 },
    aarligInntektFoerUttakBeloep: '0',
    gradertUttaksperiode: null,
  }

  it('selectHarUtenlandsopphold', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        harUtenlandsopphold: true,
      },
    }
    expect(selectHarUtenlandsopphold(state)).toBe(true)
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

  it('selectSamtykkeOffentligAFP', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        samtykkeOffentligAFP: true,
      },
    }
    expect(selectSamtykkeOffentligAFP(state)).toBe(true)
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

  it('selectEpsHarPensjon', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        epsHarPensjon: false,
      },
    }
    expect(selectEpsHarPensjon(state)).toBe(false)
  })

  it('selectEpsHarInntektOver2G', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        epsHarInntektOver2G: true,
      },
    }
    expect(selectEpsHarInntektOver2G(state)).toBe(true)
  })

  describe('selectFoedselsdato', () => {
    it('returnerer undefined fødselsdato når /person har ikke blitt kalt eller har feilet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectFoedselsdato(state)).toBe(undefined)
    })
    it('returnerer riktig fødselsdato når queryen er vellykket', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetPerson },
        },
      }
      expect(selectFoedselsdato(state)).toBe('1963-04-30')
    })
  })

  describe('selectSivilstand', () => {
    it('Når /person ikke er blitt kalt eller har feilet, returnerer undefined.', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectSivilstand(state)).toBe(undefined)
    })
    describe('Gitt at brukeren har vedtak om alderspensjon, ', () => {
      it('returnerer sivilstand fra vedtaket.', () => {
        const state: RootState = {
          ...initialState,
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              ...fulfilledGetPerson,
            },
          },
        }
        expect(selectSivilstand(state)).toBe('UGIFT')
      })

      it('dersom bruker har satt sivilstand returneres denne', () => {
        const state: RootState = {
          ...initialState,
          userInput: {
            ...initialState.userInput,
            sivilstand: 'REGISTRERT_PARTNER',
          },
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              ...fulfilledGetPerson,
            },
          },
        }

        expect(selectSivilstand(state)).toBe('REGISTRERT_PARTNER')
      })
    })

    describe('Gitt at brukeren ikke har vedtak om alderspensjon, ', () => {
      it('returnerer sivilstand fra /person.', () => {
        const state: RootState = {
          ...initialState,
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetPerson },
          },
        }
        expect(selectSivilstand(state)).toBe('UGIFT')
      })

      it('dersom bruker har satt sivilstand returneres denne', () => {
        const state: RootState = {
          ...initialState,
          userInput: {
            ...initialState.userInput,
            sivilstand: 'REGISTRERT_PARTNER',
          },
          api: {
            // @ts-ignore
            queries: { ...fulfilledGetPerson },
          },
        }

        expect(selectSivilstand(state)).toBe('REGISTRERT_PARTNER')
      })
    })
  })

  describe('Gitt at brukeren har vedtak om alderspensjon', () => {
    it('returnerer sivilstanden fra vedtaket', () => {
      const stateMedVedtakMedSivilstandUgift: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtakLoependeAlderspensjon },
        },
        userInput: {
          ...initialState.userInput,
        },
      }
      expect(selectSivilstand(stateMedVedtakMedSivilstandUgift)).toBe('UGIFT')

      const stateMedVedtakMedSivilstandGift: RootState = {
        ...initialState,
        api: {
          queries: {
            ['getLoependeVedtak(undefined)']: {
              // @ts-ignore
              status: 'fulfilled',
              endpointName: 'getLoependeVedtak',
              requestId: 'xTaE6mOydr5ZI75UXq4Wi',
              startedTimeStamp: 1688046411971,
              data: {
                alderspensjon: {
                  grad: 100,
                  fom: '2020-10-02',
                  sivilstand: 'GIFT',
                },
                ufoeretrygd: { grad: 0 },
              } satisfies LoependeVedtak,
              fulfilledTimeStamp: 1688046412103,
            },
          },
        },
        userInput: {
          ...initialState.userInput,
        },
      }
      expect(selectSivilstand(stateMedVedtakMedSivilstandGift)).toBe('GIFT')
    })
  })

  it('selectAarligInntektFoerUttakBeloepFraBrukerInput', () => {
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        currentSimulation: {
          ...currentSimulation,
          aarligInntektFoerUttakBeloep: '512 000',
        },
      },
    }
    expect(selectAarligInntektFoerUttakBeloepFraBrukerInput(state)).toBe(
      '512 000'
    )
  })

  describe('selectAarligInntektFoerUttakBeloepFraSkatt', () => {
    it('returnerer tomt streng når /inntekt har ikke blitt kalt eller har feilet', () => {
      const state: RootState = {
        ...initialState,
      }
      expect(selectAarligInntektFoerUttakBeloepFraSkatt(state)).toBe(undefined)
    })
    it('returnerer riktig beløp når queryen er vellykket', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetInntekt },
        },
      }
      const inntekt = selectAarligInntektFoerUttakBeloepFraSkatt(state)
      expect(inntekt?.beloep).toBe('521 338')
      expect(inntekt?.aar).toBe(2021)
    })
  })

  describe('selectAarligInntektFoerUttakBeloep', () => {
    it('returnerer inntekt basert på svaret som brukeren har oppgitt, som overskriver opprinnelig inntekt hentet fra Skatteetaten', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetInntekt },
        },
        userInput: {
          ...initialState.userInput,
          currentSimulation: {
            ...currentSimulation,
            aarligInntektFoerUttakBeloep: '350 000',
          },
        },
      }
      expect(selectAarligInntektFoerUttakBeloep(state)).toBe('350 000')
    })

    it('returnerer formatert inntekt fra Skatteetaten, når brukeren ikke har overskrevet den', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetInntekt },
        },
        userInput: {
          ...initialState.userInput,
          currentSimulation: {
            ...currentSimulation,
            aarligInntektFoerUttakBeloep: null,
          },
        },
      }
      expect(selectAarligInntektFoerUttakBeloep(state)).toBe('521 338')
    })
  })

  it('selectUtenlandsperioder', () => {
    const utenlandsperiode: Utenlandsperiode = {
      id: '123',
      landkode: 'URY',
      arbeidetUtenlands: null,
      startdato: '01.01.2018',
      sluttdato: '31.02.2021',
    }
    const state: RootState = {
      ...initialState,
      userInput: {
        ...initialState.userInput,
        utenlandsperioder: [{ ...utenlandsperiode }],
      },
    }
    expect(selectUtenlandsperioder(state)).toStrictEqual([utenlandsperiode])
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

  describe('selectIsVeileder', () => {
    it('er false når veilederBorgerFnr ikke er satt', () => {
      const state: RootState = initialState
      expect(selectIsVeileder(state)).toBe(false)
    })

    it('er true når veilederBorgerFnr er satt', () => {
      const state: RootState = {
        ...initialState,
        userInput: {
          ...initialState.userInput,
          veilederBorgerFnr: '81549300',
          veilederBorgerEncryptedFnr: 'dette-er-kryptert-fnr',
        },
      }
      expect(selectIsVeileder(state)).toBe(true)
    })
  })

  describe('selectVeilederBorgerFnr', () => {
    it('er undefined når veilederBorgerFnr ikke er satt', () => {
      const state: RootState = initialState
      expect(selectVeilederBorgerFnr(state)).toBeUndefined()
    })

    it('er fnr når veilederBorgerFnr er satt', () => {
      const testFnr = '81549300'
      const state: RootState = {
        ...initialState,
        userInput: {
          ...initialState.userInput,
          veilederBorgerFnr: testFnr,
        },
      }
      expect(selectVeilederBorgerFnr(state)).toStrictEqual(testFnr)
    })
  })

  describe('selectVeilederBorgerEncryptedFnr', () => {
    it('er undefined når selectVeilederBorgerEncryptedFnr ikke er satt', () => {
      const state: RootState = initialState
      expect(selectVeilederBorgerEncryptedFnr(state)).toBeUndefined()
    })

    it('er fnr når veilederBorgerEncryptedFnr er satt', () => {
      const encryptetFnr = 'dette-er-kryptert-fnr'
      const state: RootState = {
        ...initialState,
        userInput: {
          ...initialState.userInput,
          veilederBorgerEncryptedFnr: encryptetFnr,
        },
      }
      expect(selectVeilederBorgerEncryptedFnr(state)).toStrictEqual(
        encryptetFnr
      )
    })
  })

  describe('selectLoependeVedtak', () => {
    it('er undefined når loepende vedtak ikke er kalt enda', () => {
      const state: RootState = initialState
      expect(selectLoependeVedtak(state)).toBeUndefined()
    })

    it('returnerer vedtaket når kallet er vellykket', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
        },
      }
      expect(selectLoependeVedtak(state)).toStrictEqual({
        ufoeretrygd: { grad: 75 },
      })
    })
  })

  describe('selectUfoeregrad', () => {
    it('er undefined når loepende vedtak ikke er kalt enda', () => {
      const state: RootState = initialState
      expect(selectUfoeregrad(state)).toBeUndefined()
    })

    it('er number når kallet er vellykket', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
        },
      }
      expect(selectUfoeregrad(state)).toBe(75)
    })
  })

  describe('selectIsEndring', () => {
    it('er false når løpende vedtak ikke er kalt enda', () => {
      const state: RootState = initialState
      expect(selectIsEndring(state)).toBeFalsy()
    })

    it('er false når kallet er vellykket og brukeren ikke har noe løpende alderspensjon', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtak75Ufoeregrad },
        },
      }
      expect(selectIsEndring(state)).toBeFalsy()
    })

    it('er false når kallet er vellykket og brukeren har løpende AFP-offentlig uten alderspensjon', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtakLoependeAFPoffentlig },
        },
      }
      expect(selectIsEndring(state)).toBeFalsy()
    })

    it('er true når kallet er vellykket og brukeren har 0 % løpende alderspensjon og 100 % uføretrygd', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
          },
        },
      }
      expect(selectIsEndring(state)).toBeTruthy()
    })

    it('er true når kallet er vellykket og brukeren har vedtak om løpende alderspensjon', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtakLoependeAlderspensjon },
        },
      }

      expect(selectIsEndring(state)).toBeTruthy()
    })

    it('er true når kallet er vellykket og brukeren har 0 % alderspensjon og løpende AFP-privat', () => {
      const state: RootState = {
        ...initialState,
        api: {
          // @ts-ignore
          queries: { ...fulfilledGetLoependeVedtakLoependeAFPprivat },
        },
      }
      expect(selectIsEndring(state)).toBeTruthy()
    })
  })
})
