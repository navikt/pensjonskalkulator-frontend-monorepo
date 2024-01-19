import userInputSlice, {
  userInputInitialState,
  userInputActions,
} from '../userInputReducer'

describe('userInputSlice', () => {
  describe('actions', () => {
    it('setUtenlandsopphold', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setUtenlandsopphold(true)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        utenlandsopphold: true,
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

    it('setCurrentSimulationaarligInntektFoerUttakBeloep', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationaarligInntektFoerUttakBeloep(
          800000
        )
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektFoerUttakBeloep: 800000,
        },
      })
    })

    it('setCurrentSimulationAarligInntektVsaHelPensjon', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon({
          beloep: 800000,
          sluttAlder: { aar: 75, maaneder: 0 },
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektVsaHelPensjon: {
            beloep: 800000,
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        },
      })
    })

    it('setCurrentSimulationGradertuttaksperiode', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationGradertuttaksperiode({
          uttaksalder: { aar: 67, maaneder: 3 },
          grad: 20,
          aarligInntektVsaPensjonBeloep: 150000,
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          gradertUttaksperiode: {
            uttaksalder: { aar: 67, maaneder: 3 },
            grad: 20,
            aarligInntektVsaPensjonBeloep: 150000,
          },
        },
      })

      const updatedState2 = userInputSlice(
        updatedState,
        userInputActions.setCurrentSimulationGradertuttaksperiode(null)
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
          utenlandsopphold: true,
          samtykke: true,
          afp: 'ja_offentlig',
          samboer: false,
          currentSimulation: {
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            uttaksalder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttakBeloep: 300000,
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
          utenlandsopphold: true,
          samtykke: true,
          afp: 'ja_offentlig',
          samboer: false,

          currentSimulation: {
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            uttaksalder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttakBeloep: 300000,
            gradertUttaksperiode: null,
          },
        },
        userInputActions.flushCurrentSimulation()
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        utenlandsopphold: true,
        samtykke: true,
        afp: 'ja_offentlig',
        samboer: false,
      })
    })
  })
})
