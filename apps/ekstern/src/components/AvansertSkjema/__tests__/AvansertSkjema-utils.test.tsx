import { describe, expect, it } from 'vitest'

import {
  validateAvansertBeregningSkjema,
  onAvansertBeregningSubmit,
} from '../utils'
import * as alderUtils from '@/utils/alder'
import * as inntektUtils from '@/utils/inntekt'

describe('AvansertSkjema-utils', () => {
  describe('onAvansertBeregningSubmit', () => {
    const formDataAllFieldsSwitch = (s: string) => {
      switch (s) {
        case 'uttaksalder-gradert-uttak-aar':
          return '62'
        case 'uttaksalder-gradert-uttak-maaneder':
          return '2'
        case 'uttaksalder-helt-uttak-aar':
          return '67'
        case 'uttaksalder-helt-uttak-maaneder':
          return '0'
        case 'uttaksgrad':
          return '80 %'
        case 'inntekt-vsa-helt-uttak-radio':
          return 'ja'
        case 'inntekt-vsa-gradert-uttak-radio':
          return 'ja'
        case 'inntekt-vsa-helt-uttak':
          return '300000'
        case 'inntekt-vsa-helt-uttak-slutt-alder-aar':
          return '75'
        case 'inntekt-vsa-helt-uttak-slutt-alder-maaneder':
          return '0'
        case 'inntekt-vsa-gradert-uttak':
          return '100000'
        default:
          return ''
      }
    }

    it('Dersom validering feiler lagres det ikke data og validationErrors settes', () => {
      const dispatchMock = vi.fn()
      const setValidationErrorsMock = vi.fn()
      const gaaTilResultatMock = vi.fn()
      const getMock = vi.fn().mockImplementation((s: string) => s)
      const dataMock: FormData = { get: getMock } as unknown as FormData
      onAvansertBeregningSubmit(
        dataMock,
        dispatchMock,
        setValidationErrorsMock,
        gaaTilResultatMock,
        {
          foedselsdato: '1963-04-30',
          loependeVedtak: {
            ufoeretrygd: { grad: 0 },
          },
          localInntektFremTilUttak: null,
          hasVilkaarIkkeOppfylt: undefined,
          harAvansertSkjemaUnsavedChanges: false,
          normertPensjonsalder: {
            aar: 67,
            maaneder: 0,
          },
        }
      )
      expect(dispatchMock).not.toHaveBeenCalled()
      expect(gaaTilResultatMock).not.toHaveBeenCalled()
      expect(setValidationErrorsMock).toHaveBeenCalledTimes(3)
    })

    describe('Gitt at validering er vellykket', () => {
      it('Når alle feltene er fylt ut lagres det data og validationErrors settes ikke', () => {
        const dispatchMock = vi.fn()
        const setValidationErrorsMock = vi.fn()
        const gaaTilResultatMock = vi.fn()
        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onAvansertBeregningSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          gaaTilResultatMock,
          {
            foedselsdato: '1963-04-30',
            loependeVedtak: {
              ufoeretrygd: { grad: 0 },
            },
            localInntektFremTilUttak: null,
            hasVilkaarIkkeOppfylt: undefined,
            harAvansertSkjemaUnsavedChanges: false,
            normertPensjonsalder: {
              aar: 67,
              maaneder: 0,
            },
          }
        )

        expect(dispatchMock).toHaveBeenCalledTimes(5)
        expect(dispatchMock).toHaveBeenNthCalledWith(1, {
          payload: {
            aar: 67,
            maaneder: 0,
          },
          type: 'userInputSlice/setCurrentSimulationUttaksalder',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(2, {
          payload: {
            aarligInntektVsaPensjonBeloep: '100000',
            grad: 80,
            uttaksalder: {
              aar: 62,
              maaneder: 2,
            },
          },
          type: 'userInputSlice/setCurrentSimulationGradertUttaksperiode',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(3, {
          payload: {
            beloep: '300000',
            sluttAlder: {
              aar: 75,
              maaneder: 0,
            },
          },
          type: 'userInputSlice/setCurrentSimulationAarligInntektVsaHelPensjon',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(4, {
          payload: null,
          type: 'userInputSlice/setCurrentSimulationAarligInntektFoerUttakBeloep',
        })

        expect(gaaTilResultatMock).toHaveBeenCalled()
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })

      it('Når brukeren har endret inntekt og lagt til inntekt vsa 100 % alderspensjon og at alle feltene er fylt ut lagres det data og validationErrors settes ikke', () => {
        const dispatchMock = vi.fn()
        const setValidationErrorsMock = vi.fn()
        const gaaTilResultatMock = vi.fn()

        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onAvansertBeregningSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          gaaTilResultatMock,
          {
            foedselsdato: '1963-04-30',
            loependeVedtak: {
              ufoeretrygd: { grad: 0 },
            },
            localInntektFremTilUttak: '500 000',
            hasVilkaarIkkeOppfylt: undefined,
            harAvansertSkjemaUnsavedChanges: false,
            normertPensjonsalder: {
              aar: 67,
              maaneder: 0,
            },
          }
        )

        expect(dispatchMock).toHaveBeenCalledTimes(5)
        expect(dispatchMock).toHaveBeenNthCalledWith(1, {
          payload: {
            aar: 67,
            maaneder: 0,
          },
          type: 'userInputSlice/setCurrentSimulationUttaksalder',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(2, {
          payload: {
            aarligInntektVsaPensjonBeloep: '100000',
            grad: 80,
            uttaksalder: {
              aar: 62,
              maaneder: 2,
            },
          },
          type: 'userInputSlice/setCurrentSimulationGradertUttaksperiode',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(3, {
          payload: {
            beloep: '300000',
            sluttAlder: {
              aar: 75,
              maaneder: 0,
            },
          },
          type: 'userInputSlice/setCurrentSimulationAarligInntektVsaHelPensjon',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(4, {
          payload: '500 000',
          type: 'userInputSlice/setCurrentSimulationAarligInntektFoerUttakBeloep',
        })

        expect(gaaTilResultatMock).toHaveBeenCalled()
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })

      it('Når brukeren har endret inntekt og lagt til inntekt vsa 100 % alderspensjon og at alle feltene er fylt ut utenom gradert uttak lagres det data og validationErrors settes ikke', () => {
        const dispatchMock = vi.fn()
        const setValidationErrorsMock = vi.fn()
        const gaaTilResultatMock = vi.fn()

        const getMock = vi.fn().mockImplementation((s: string) => {
          switch (s) {
            case 'uttaksalder-gradert-uttak-aar':
              return null
            case 'uttaksalder-gradert-uttak-maaneder':
              return null
            case 'uttaksalder-helt-uttak-aar':
              return '67'
            case 'uttaksalder-helt-uttak-maaneder':
              return '0'
            case 'uttaksgrad':
              return '100 %'
            case 'inntekt-vsa-helt-uttak-radio':
              return 'ja'
            case 'inntekt-vsa-gradert-uttak-radio':
              return null
            case 'inntekt-vsa-helt-uttak':
              return '300000'
            case 'inntekt-vsa-helt-uttak-slutt-alder-aar':
              return '75'
            case 'inntekt-vsa-helt-uttak-slutt-alder-maaneder':
              return '0'
            case 'inntekt-vsa-gradert-uttak':
              return null
            default:
              return ''
          }
        })
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onAvansertBeregningSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          gaaTilResultatMock,
          {
            foedselsdato: '1963-04-30',
            loependeVedtak: {
              ufoeretrygd: { grad: 0 },
            },
            localInntektFremTilUttak: '500 000',
            hasVilkaarIkkeOppfylt: undefined,
            harAvansertSkjemaUnsavedChanges: false,
            normertPensjonsalder: {
              aar: 67,
              maaneder: 0,
            },
          }
        )

        expect(dispatchMock).toHaveBeenCalledTimes(5)
        expect(dispatchMock).toHaveBeenNthCalledWith(1, {
          payload: {
            aar: 67,
            maaneder: 0,
          },
          type: 'userInputSlice/setCurrentSimulationUttaksalder',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(2, {
          payload: null,
          type: 'userInputSlice/setCurrentSimulationGradertUttaksperiode',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(3, {
          payload: {
            beloep: '300000',
            sluttAlder: {
              aar: 75,
              maaneder: 0,
            },
          },
          type: 'userInputSlice/setCurrentSimulationAarligInntektVsaHelPensjon',
        })
        expect(dispatchMock).toHaveBeenNthCalledWith(4, {
          payload: '500 000',
          type: 'userInputSlice/setCurrentSimulationAarligInntektFoerUttakBeloep',
        })

        expect(gaaTilResultatMock).toHaveBeenCalled()
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })

      it('Når hasVilkaarIkkeOppfylt er true og harAvansertSkjemaUnsavedChanges er false lagres det data men brukeren blir ikke sendt til resultatssiden', () => {
        const dispatchMock = vi.fn()
        const setValidationErrorsMock = vi.fn()
        const gaaTilResultatMock = vi.fn()

        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onAvansertBeregningSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          gaaTilResultatMock,
          {
            foedselsdato: '1963-04-30',
            loependeVedtak: {
              ufoeretrygd: { grad: 0 },
            },
            localInntektFremTilUttak: '500 000',
            hasVilkaarIkkeOppfylt: true,
            harAvansertSkjemaUnsavedChanges: false,
            normertPensjonsalder: {
              aar: 67,
              maaneder: 0,
            },
          }
        )

        expect(dispatchMock).toHaveBeenCalledTimes(5)
        expect(gaaTilResultatMock).not.toHaveBeenCalled()
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })

      it('Når hasVilkaarIkkeOppfylt er true og harAvansertSkjemaUnsavedChanges er true lagres det data og brukeren blir sendt til resultatssiden', () => {
        const dispatchMock = vi.fn()
        const setValidationErrorsMock = vi.fn()
        const gaaTilResultatMock = vi.fn()

        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onAvansertBeregningSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          gaaTilResultatMock,
          {
            foedselsdato: '1963-04-30',
            loependeVedtak: {
              ufoeretrygd: { grad: 0 },
            },
            localInntektFremTilUttak: '500 000',
            hasVilkaarIkkeOppfylt: true,
            harAvansertSkjemaUnsavedChanges: true,
            normertPensjonsalder: {
              aar: 67,
              maaneder: 0,
            },
          }
        )

        expect(dispatchMock).toHaveBeenCalledTimes(5)
        expect(gaaTilResultatMock).toHaveBeenCalled()
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })
    })
  })

  describe('validateAvansertBeregningSkjema', () => {
    const correctInputData = {
      gradertUttakAarFormData: '62',
      gradertUttakMaanederFormData: '5',
      heltUttakAarFormData: '67',
      heltUttakMaanederFormData: '0',
      uttaksgradFormData: '40 %',
      inntektVsaHeltUttakRadioFormData: 'ja',
      inntektVsaGradertUttakRadioFormData: 'ja',
      inntektVsaHeltUttakFormData: '300000',
      inntektVsaHeltUttakSluttAlderAarFormData: '75',
      inntektVsaHeltUttakSluttAlderMaanederFormData: '0',
      inntektVsaGradertUttakFormData: '99000',
    }

    const mockedFoedselsdato = '1963-04-30'
    const mockedLoependeVedtak = {
      ufoeretrygd: { grad: 0 },
    }
    const mockedLoependeVedtak100 = {
      ufoeretrygd: { grad: 100 },
    }
    const mockedLoependeVedtak60 = {
      ufoeretrygd: { grad: 60 },
    }
    const mockedNormertPensjonsalder = { aar: 67, maaneder: 0 }

    it('returnerer true uten å oppdatere feilmeldingsteksten når input er korrekt', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          correctInputData,
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false når heltUttakAar eller heltUttakMaaneder ikke er gyldig (alle cases allerede dekket i validateAlderFromForm)', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, heltUttakAarFormData: 'abc' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, heltUttakMaanederFormData: null },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(8)
      expect(updateErrorMessageMock).toHaveBeenCalledTimes(4)
    })

    it('returnerer false når uttaksgrad er fylt ut med noe annet enn et tall med prosent', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: 'abc' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '400' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '4000' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '0 %' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '100 %' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()
    })

    it('returnerer false når uttaksgrad er endret til en grad mellom 20-80 før 12 md fra datoen til vedtaket', () => {
      const mockedLoependeVedtakEndring: LoependeVedtak = {
        alderspensjon: {
          fom: '2025-10-01',
          grad: 100,
          sivilstand: 'UGIFT',
        },
        ufoeretrygd: { grad: 0 },
      }

      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '62',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtakEndring,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '0 %',
            gradertUttakAarFormData: '62',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtakEndring,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            gradertUttakAarFormData: '62',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtakEndring,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '63',
            gradertUttakMaanederFormData: '5',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtakEndring,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '62',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          {
            alderspensjon: {
              fom: '2025-10-01',
              grad: 40,
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 0 },
          },
          updateErrorMessageMock
        )
      ).toBeTruthy()
    })

    it('returnerer false når gradertUttakAar eller gradertUttakMaaneder ikke er gyldig (alle cases allerede dekket i validateAlderFromForm)', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, gradertUttakAarFormData: 'abc' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, gradertUttakMaanederFormData: null },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(6)
      expect(updateErrorMessageMock).toHaveBeenCalledTimes(2)
    })

    it('returnerer false når gradertUttaksalder er lik eller etter heltuttak', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '67',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '70',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '66',
            gradertUttakMaanederFormData: '11',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()

      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(12)
      expect(updateErrorMessageMock).toHaveBeenCalledTimes(2)
    })

    it('returnerer true når gradertUttakAar eller gradertUttakMaaneder ikke er gyldig så lenge uttaksgradFormData er på 100 %', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            gradertUttakAarFormData: 'abc',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            gradertUttakMaanederFormData: null,
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()

      expect(validateAlderFromFormMock).toHaveBeenCalled()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false når gradertUttaksalder eller heltUttaksalder er før normert pensjonsalder for en bruker med 100 % uføretrygd', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            heltUttakAarFormData: '63',
            heltUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak100,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            gradertUttakAarFormData: null,
            gradertUttakMaanederFormData: null,
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak100,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            gradertUttakAarFormData: '68',
            gradertUttakMaanederFormData: '3',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak100,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            gradertUttakAarFormData: '63',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak100,
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(updateErrorMessageMock).toHaveBeenCalledTimes(0)
    })

    it('returnerer false når heltUttaksalder eller gradertUttaksalder er før normert pensjonsalder med et ugyldig uttaksgrad for en bruker med gradert uføretrygd', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            heltUttakAarFormData: '63',
            heltUttakMaanederFormData: '0',
            gradertUttakAarFormData: null,
            gradertUttakMaanederFormData: null,
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak60,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '50 %',
            gradertUttakAarFormData: '63',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak60,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '40 %',
            gradertUttakAarFormData: '63',
            gradertUttakMaanederFormData: '0',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak60,
          updateErrorMessageMock
        )
      ).toBeTruthy()

      // Denne skal returnere true fordi alderen er etter normert pensjonsalder
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '40 %',
            gradertUttakAarFormData: '67',
            gradertUttakMaanederFormData: '0',
            heltUttakAarFormData: '67',
            heltUttakMaanederFormData: '6',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak60,
          updateErrorMessageMock
        )
      ).toBeTruthy()

      expect(updateErrorMessageMock).toHaveBeenCalledTimes(2)
    })

    it('returnerer false når radio knapp for inntekt vsa. 100 % uttaksalder ikke er fylt ut', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaHeltUttakRadioFormData: null },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer false når brukeren har valgt inntekt vsa. 100 % uttaksalder uten å fylle ut input feltet for beløp', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaHeltUttakFormData: null },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer false når brukeren har valgt inntekt vsa. 100 % uttaksalder og inntekt er ugyldig (alle cases allerede videre i validateInntekt)', () => {
      const validateInntektMock = vi.spyOn(inntektUtils, 'validateInntekt')
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaHeltUttakFormData: 'abc' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(validateInntektMock).toHaveBeenCalled()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer false når brukeren har valgt inntekt vsa. 100 % uttaksalder med ugyldig sluttalder for inntekten (alle cases allerede dekket i validateAlderFromForm)', () => {
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            inntektVsaHeltUttakSluttAlderAarFormData: 'abc',
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(4)
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer false når brukeren har valgt en gradering og radio knapp for inntekt vsa. 100 % uttaksalder ikke er fylt ut', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaGradertUttakRadioFormData: null },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer true når brukeren ikke har valgt gradering og radio knapp for inntekt vsa. 100 % uttaksalder ikke er fylt ut', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          {
            ...correctInputData,
            uttaksgradFormData: '100 %',
            inntektVsaGradertUttakRadioFormData: null,
          },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false når brukeren har valgt en gradering og valgt ja til inntekt vsa. gradert uttak, men inntekt ikke er gyldig (alle cases allerede videre i validateInntekt)', () => {
      const updateErrorMessageMock = vi.fn()
      const validateInntektMock = vi.spyOn(inntektUtils, 'validateInntekt')
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaGradertUttakFormData: 'abc' },
          mockedFoedselsdato,
          mockedNormertPensjonsalder,
          mockedLoependeVedtak,
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(validateInntektMock).toHaveBeenCalled()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })
  })
})
