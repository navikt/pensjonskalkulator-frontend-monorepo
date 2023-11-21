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

    it('setFormatertUttaksalder', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setFormatertUttaksalder(
          '65 alder.aar string.og 4 alder.maaneder'
        )
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        formatertUttaksalder: '65 alder.aar string.og 4 alder.maaneder',
      })
    })

    it('updateCurrentSimulation', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.updateCurrentSimulation({
          startAar: 65,
          startMaaned: 4,
        })
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          startAar: 65,
          startMaaned: 4,
          uttaksgrad: 100,
          aarligInntekt: 0,
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
            startAar: 66,
            startMaaned: 4,
            uttaksgrad: 100,
            aarligInntekt: 0,
          },
        },
        userInputActions.flush()
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
      })
    })
  })
})
