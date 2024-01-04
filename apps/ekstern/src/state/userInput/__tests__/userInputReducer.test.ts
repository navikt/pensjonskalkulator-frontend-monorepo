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

    it('setCurrentSimulationStartAlder', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationStartAlder({
          aar: 65,
          maaneder: 4,
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          uttaksperioder: [],
          formatertUttaksalderReadOnly: null,
          startAlder: { aar: 65, maaneder: 4 },
          aarligInntektFoerUttak: null,
        },
      })
    })

    it('setCurrentSimulationAarligInntektFoerUttak', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationAarligInntektFoerUttak(800000)
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          aarligInntektFoerUttak: 800000,
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
            uttaksperioder: [],
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            startAlder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttak: 300000,
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
            uttaksperioder: [],
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            startAlder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttak: 300000,
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
