import userInputSlice, {
  userInputInitialState,
  userInputActions,
} from '../userInputReducer'

describe('userInputSlice', () => {
  describe('actions', () => {
    it('setVeilederBorgerFnr', () => {
      const updatedState = userInputSlice(
        userInputInitialState,
        userInputActions.setVeilederBorgerFnr({
          fnr: '01067428733',
          encryptedFnr: 'dette-er kryptert-fnr',
        })
      )
      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        veilederBorgerFnr: '01067428733',
        veilederBorgerEncryptedFnr: 'dette-er kryptert-fnr',
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

    it('setCurrentSimulationUtenlandsperiode', () => {
      const utenlandsperiode: Utenlandsperiode = {
        id: '12345',
        landkode: 'URY',
        arbeidetUtenlands: null,
        startdato: '01.01.2018',
        sluttdato: '28.01.2021',
      }

      const updatedState_1 = userInputSlice(
        userInputInitialState,
        userInputActions.setCurrentSimulationUtenlandsperiode(utenlandsperiode)
      )

      expect(updatedState_1).toStrictEqual({
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
        landkode: 'BFA',
        arbeidetUtenlands: true,
        startdato: '07.02.2005',
        sluttdato: '11.10.2012',
      }

      const updatedState_2 = userInputSlice(
        updatedState_1,
        userInputActions.setCurrentSimulationUtenlandsperiode(
          addedUtenlandsperiode
        )
      )

      expect(updatedState_2).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [
            { ...utenlandsperiode },
            { ...addedUtenlandsperiode },
          ],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const overwrittenUtenlandsperiode: Utenlandsperiode = {
        id: '12345',
        landkode: 'NLD',
        arbeidetUtenlands: null,
        startdato: '12.06.2010',
        sluttdato: '20.12.2013',
      }

      const updatedState_3 = userInputSlice(
        updatedState_2,
        userInputActions.setCurrentSimulationUtenlandsperiode(
          overwrittenUtenlandsperiode
        )
      )
      expect(updatedState_3).toStrictEqual({
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

    it('deleteCurrentSimulationUtenlandsperiode', () => {
      const utenlandsperiode_1: Utenlandsperiode = {
        id: '12345',
        landkode: 'URY',
        arbeidetUtenlands: null,
        startdato: '02.01.2018',
        sluttdato: '20.08.2021',
      }

      const utenlandsperiode_2: Utenlandsperiode = {
        id: '98765',
        landkode: 'BFA',
        arbeidetUtenlands: true,
        startdato: '2005-08-02.',
        sluttdato: '2012-11-10',
      }

      const updatedState_1 = userInputSlice(
        {
          ...userInputInitialState,
          currentSimulation: {
            utenlandsperioder: [
              { ...utenlandsperiode_1 },
              { ...utenlandsperiode_2 },
            ],
            formatertUttaksalderReadOnly: null,
            uttaksalder: null,
            aarligInntektFoerUttakBeloep: null,
            gradertUttaksperiode: null,
          },
        },
        userInputActions.deleteCurrentSimulationUtenlandsperiode(
          'random string'
        )
      )

      expect(updatedState_1).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [
            { ...utenlandsperiode_1 },
            { ...utenlandsperiode_2 },
          ],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const updatedState_2 = userInputSlice(
        {
          ...updatedState_1,
        },
        userInputActions.deleteCurrentSimulationUtenlandsperiode('98765')
      )

      expect(updatedState_2).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [{ ...utenlandsperiode_1 }],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })

      const updatedState_3 = userInputSlice(
        {
          ...updatedState_2,
        },
        userInputActions.deleteCurrentSimulationUtenlandsperiode('12345')
      )

      expect(updatedState_3).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [],
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      })
    })

    it('deleteCurrentSimulationAlleUtenlandsperioder', () => {
      const utenlandsperiode_1: Utenlandsperiode = {
        id: '12345',
        landkode: 'URY',
        arbeidetUtenlands: null,
        startdato: '02.01.2018',
        sluttdato: '20.08.2021',
      }

      const utenlandsperiode_2: Utenlandsperiode = {
        id: '98765',
        landkode: 'BFA',
        arbeidetUtenlands: true,
        startdato: '2005-08-02.',
        sluttdato: '2012-11-10',
      }

      const updatedState_1 = userInputSlice(
        {
          ...userInputInitialState,
          currentSimulation: {
            utenlandsperioder: [
              { ...utenlandsperiode_1 },
              { ...utenlandsperiode_2 },
            ],
            formatertUttaksalderReadOnly: null,
            uttaksalder: null,
            aarligInntektFoerUttakBeloep: null,
            gradertUttaksperiode: null,
          },
        },
        userInputActions.deleteCurrentSimulationAlleUtenlandsperioder()
      )

      expect(updatedState_1).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          utenlandsperioder: [],
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

    it('flushCurrentSimulationUtenomUtenlandsperioder', () => {
      const utenlandsperioder = [
        {
          id: '1',
          landkode: 'URY',
          arbeidetUtenlands: false,
          startdato: '01.01.2012',
          sluttdato: '28.01.2015',
        },
      ]
      const updatedState = userInputSlice(
        {
          ...userInputInitialState,
          harUtenlandsopphold: true,
          samtykke: true,
          afp: 'ja_offentlig',
          currentSimulation: {
            formatertUttaksalderReadOnly:
              '66 alder.aar string.og 4 alder.maaneder',
            uttaksalder: { aar: 66, maaneder: 4 },
            aarligInntektFoerUttakBeloep: '300 000',
            gradertUttaksperiode: null,
            utenlandsperioder: [...utenlandsperioder],
          },
        },
        userInputActions.flushCurrentSimulationUtenomUtenlandsperioder()
      )

      expect(updatedState).toStrictEqual({
        ...userInputInitialState,
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
          utenlandsperioder: [...utenlandsperioder],
        },
        harUtenlandsopphold: true,
        samtykke: true,
        afp: 'ja_offentlig',
      })
    })
  })
})
