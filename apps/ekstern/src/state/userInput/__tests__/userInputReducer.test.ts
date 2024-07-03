import userInputSlice, {
  userInputInitialState,
  userInputActions,
} from '../userInputReducer'

describe('userInputSlice', () => {
  describe('actions', () => {
    it('setVeilederBorgerFnr', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setVeilederBorgerFnr('01067428733')
      )
      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        veilederBorgerFnr: '01067428733',
      })
    })

    it('setHarUtenlandsopphold', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setHarUtenlandsopphold(true)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        harUtenlandsopphold: true,
      })
    })

    it('setSamtykke', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setSamtykke(true)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        samtykke: true,
      })
    })

    it('setSamtykkeOffentligAFP', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setSamtykkeOffentligAFP(true)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        samtykkeOffentligAFP: true,
      })
    })

    it('setAfp', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setAfp('ja_offentlig')
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        afp: 'ja_offentlig',
      })
    })

    it('setSamboer', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setSamboer(true)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        samboer: true,
      })
    })

    it('setCurrentSimulationUtenlandsperioder', () => {
      const utenlandsperiode: Utenlandsperiode = {
        id: '12345',
        land: 'Kina',
        arbeidetUtenlands: null,
        startdato: '01.01.2018',
        sluttdato: '31.01.2021',
      }

      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUtenlandsperioder(utenlandsperiode)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [{ ...utenlandsperiode }],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const addedUtenlandsperiode: Utenlandsperiode = {
        id: '98765',
        land: 'Belgia',
        arbeidetUtenlands: true,
        startdato: '08.02.2005',
        sluttdato: '11.10.2012',
      }

      const updatedState_1 = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUtenlandsperioder(
          addedUtenlandsperiode
        )
      )

      expect(updatedState_1).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [{ ...utenlandsperiode }, addedUtenlandsperiode],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const overwrittenUtenlandsperiode: Utenlandsperiode = {
        id: '12345',
        land: 'Sverige',
        arbeidetUtenlands: null,
        startdato: '12.06.2010',
        sluttdato: '20.12.2013',
      }

      const updatedState_2 = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUtenlandsperioder(
          overwrittenUtenlandsperiode
        )
      )
      expect(updatedState_2).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [
            { ...overwrittenUtenlandsperiode },
            addedUtenlandsperiode,
          ],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })
    })

    it('setCurrentSimulationUttaksalder', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUttaksalder({
          aar: 65,
          maaneder: 4,
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [],
          formatertUttaksalderReadOnly: null,
          uttaksalder: { aar: 65, maaneder: 4 },
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const nullstiltState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUttaksalder(null)
      )

      expect(nullstiltState).toStrictEqual({
        ...userInputInitialState,
      })
    })

    it('setCurrentSimulationAarligInntektFoerUttakBeloep', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationAarligInntektFoerUttakBeloep(
          '800000'
        )
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektFoerUttakBeloep: '800 000',
        },
      })
    })

    it('setCurrentSimulationAarligInntektVsaHelPensjon med tomt beloep', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon({
          beloep: '',
          sluttAlder: { aar: 75, maaneder: 0 },
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektVsaHelPensjon: undefined,
        },
      })
    })

    it('setCurrentSimulationAarligInntektVsaHelPensjon', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon({
          beloep: '800000',
          sluttAlder: { aar: 75, maaneder: 0 },
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektVsaHelPensjon: {
            beloep: '800 000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        },
      })
    })

    it('setCurrentSimulationGradertUttaksperiode', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationGradertUttaksperiode({
          uttaksalder: { aar: 67, maaneder: 3 },
          grad: 20,
          aarligInntektVsaPensjonBeloep: '150000',
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          gradertUttaksperiode: {
            uttaksalder: { aar: 67, maaneder: 3 },
            grad: 20,
            aarligInntektVsaPensjonBeloep: '150 000',
          },
        },
      })

      const updatedState2 = userInputSlice(
        updatedState,
        userInputActions.setCurrentSimulationGradertUttaksperiode(null)
      )

      expect(updatedState2).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          gradertUttaksperiode: null,
        },
      })
    })

    it('syncCurrentSimulationFormatertUttaksalderReadOnly', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.syncCurrentSimulationFormatertUttaksalderReadOnly(
          '66 alder.aar string.og 4 alder.maaneder'
        )
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          formatertUttaksalderReadOnly:
            '66 alder.aar string.og 4 alder.maaneder',
        },
      })

      const nullstiltState = userInputSlice(
        userInputInitialState,
        userInputActions.syncCurrentSimulationFormatertUttaksalderReadOnly(null)
      )

      expect(nullstiltState).toStrictEqual({
        ...userInputInitialState,
      })
    })

    it('flush', () => {
      const updatedState = userInputSlice(
        {
          ...userInputInitialState,
          harUtenlandsopphold: true,
          samtykke: true,
          samtykkeOffentligAFP: true,
          afp: 'ja_offentlig',
          samboer: false,
          currentSimulation: {
            utenlandsperioder: [],
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            uttaksalder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttakBeloep: '300 000',
            gradertUttaksperiode: null,
          },
        },
        userInputActions.flush()
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
      })
    })

    it('flushCurrentSimulation', () => {
      const updatedState = userInputSlice(
        {
          ...userInputInitialState,
          harUtenlandsopphold: true,
          samtykke: true,
          afp: 'ja_offentlig',
          samboer: false,
          currentSimulation: {
            utenlandsperioder: [],
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            uttaksalder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttakBeloep: '300 000',
            gradertUttaksperiode: null,
          },
        },
        userInputActions.flushCurrentSimulation()
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        harUtenlandsopphold: true,
        samtykke: true,
        afp: 'ja_offentlig',
        samboer: false,
      })
    })
  })
})
