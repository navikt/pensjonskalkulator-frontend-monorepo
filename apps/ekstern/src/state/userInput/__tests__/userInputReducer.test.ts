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

    it('setCurrentSimulationFormatertUttaksalder', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationFormatertUttaksalder(
          '65 alder.aar string.og 4 alder.maaneder'
        )
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          formatertUttaksalder: '65 alder.aar string.og 4 alder.maaneder',
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

    describe('syncCurrentSimulationStartAarOgMaaned', () => {
      it('oppdaterer startAar og startMaaned uavhengig av de andre verdiene', () => {
        const updatedState = userInputSlice(
          userInputInitialState,
          userInputActions.syncCurrentSimulationStartAarOgMaaned({
            startAar: 65,
            startMaaned: 4,
          })
        )

        expect(updatedState).toStrictEqual({
          ...userInputInitialState,
          currentSimulation: {
            formatertUttaksalder: null,
            startAar: 65,
            startMaaned: 4,
            aarligInntektFoerUttak: null,
          },
        })
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
            formatertUttaksalder: '66 alder.aar string.og 4 alder.maaneder',
            startAar: 66,
            startMaaned: 4,
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
            formatertUttaksalder: '66 alder.aar string.og 4 alder.maaneder',
            startAar: 66,
            startMaaned: 4,
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
