import {
  validateOpphold,
  onUtenlandsoppholdSubmit,
  UTENLANDSOPPHOLD_FORM_NAMES,
} from '../utils'
import * as loggerUtils from '@/utils/logging'

describe('UtenlandsoppholdModal-utils', () => {
  describe('validateOpphold', () => {
    const foedselsdato = '1963-04-30'
    const correctInputData = {
      landFormData: 'DZA',
      arbeidetUtenlandsFormData: 'ja',
      startdatoFormData: '01.04.1980',
      sluttdatoFormData: '30.09.1981',
    }

    it('returnerer true uten å oppdatere feilmeldingsteksten når input er korrekt', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateOpphold(
          correctInputData,
          foedselsdato,
          undefined,
          [],
          updateErrorMessageMock,
          'nb'
        )
      ).toBeTruthy()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    describe('Gitt at landFormData ikke er gyldig', () => {
      it('returnerer false når landFormData er null', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, landFormData: null },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - land',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error',
        })
      })
      it('returnerer false når landFormData er tom', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, landFormData: '' },
            foedselsdato,
            undefined,

            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - land',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error',
        })
      })
    })

    describe('Gitt at arbeidetUtenlandsFormData ikke er gyldig', () => {
      describe('Når land ikke har krav om arbeid', () => {
        it('returnerer true når arbeidetUtenlandsFormData er null', () => {
          const loggerMock = vi.spyOn(loggerUtils, 'logger')
          const updateErrorMessageMock = vi.fn()
          expect(
            validateOpphold(
              { ...correctInputData, arbeidetUtenlandsFormData: null },
              foedselsdato,
              undefined,

              [],
              updateErrorMessageMock,
              'nb'
            )
          ).toBeTruthy()
          expect(updateErrorMessageMock).not.toHaveBeenCalled()
          expect(loggerMock).not.toHaveBeenCalled()
        })
      })
      describe('Når land har krav om arbeid', () => {
        it('returnerer false når arbeidetUtenlandsFormData er null', () => {
          const loggerMock = vi.spyOn(loggerUtils, 'logger')
          const updateErrorMessageMock = vi.fn()
          expect(
            validateOpphold(
              {
                ...correctInputData,
                landFormData: 'FRA',
                arbeidetUtenlandsFormData: null,
              },
              foedselsdato,
              undefined,

              [],
              updateErrorMessageMock,
              'nb'
            )
          ).toBeFalsy()
          expect(updateErrorMessageMock).toHaveBeenCalled()
          expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
            skjemanavn: 'utenlandsopphold-oppholdet-ditt',
            data: 'Utenlandsopphold - arbeidet utenlands',
            tekst:
              'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error',
          })
        })
        it('returnerer false når arbeidetUtenlandsFormData er tom', () => {
          const loggerMock = vi.spyOn(loggerUtils, 'logger')
          const updateErrorMessageMock = vi.fn()
          expect(
            validateOpphold(
              {
                ...correctInputData,
                landFormData: 'FRA',
                arbeidetUtenlandsFormData: '',
              },
              foedselsdato,
              undefined,
              [],
              updateErrorMessageMock,
              'nb'
            )
          ).toBeFalsy()
          expect(updateErrorMessageMock).toHaveBeenCalled()
          expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
            skjemanavn: 'utenlandsopphold-oppholdet-ditt',
            data: 'Utenlandsopphold - arbeidet utenlands',
            tekst:
              'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error',
          })
        })
        it('returnerer false når arbeidetUtenlandsFormData er ulik "ja" eller "nei"', () => {
          const loggerMock = vi.spyOn(loggerUtils, 'logger')
          const updateErrorMessageMock = vi.fn()
          expect(
            validateOpphold(
              {
                ...correctInputData,
                landFormData: 'FRA',
                arbeidetUtenlandsFormData: 'lorem',
              },
              foedselsdato,
              undefined,
              [],
              updateErrorMessageMock,
              'nb'
            )
          ).toBeFalsy()
          expect(updateErrorMessageMock).toHaveBeenCalled()
          expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
            skjemanavn: 'utenlandsopphold-oppholdet-ditt',
            data: 'Utenlandsopphold - arbeidet utenlands',
            tekst:
              'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error',
          })
        })
      })
    })

    describe('Gitt at startdato ikke er gyldig', () => {
      it('returnerer false når startdatoFormData er null', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, startdatoFormData: null },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - startdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required',
        })
      })
      it('returnerer false når startdatoFormData er tom', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, startdatoFormData: '' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - startdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required',
        })
      })
      it('returnerer false når startdatoFormData har feil format', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, startdatoFormData: '1977-12-03' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - startdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format',
        })
      })
      it('returnerer false når startdatoFormData er før fødselsdato', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, startdatoFormData: '01.01.1963' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - startdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.before_min',
        })
      })
      it('returnerer false når startdatoFormData er etter fødselsdato + 100 år', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, startdatoFormData: '01.01.2064' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - startdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.after_max',
        })
      })
    })

    describe('Gitt at sluttdato ikke er gyldig', () => {
      it('returnerer false når sluttdatoFormData har feil format', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: '1977-12-03' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - sluttdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format',
        })
      })
      it('returnerer false når sluttdatoFormData er før startdatoFormData', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: '12.02.1975' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - sluttdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.before_min',
        })
      })
      it('returnerer false når sluttdatoFormData er etter fødselsdato + 100 år', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: '01.01.2064' },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - sluttdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.after_max',
        })
      })
      it('returnerer true når sluttdatoFormData er null', () => {
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: null },
            foedselsdato,
            undefined,
            [],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeTruthy()
        expect(updateErrorMessageMock).not.toHaveBeenCalled()
      })
    })

    describe('Gitt at det er overlappende perioder', () => {
      const registrertePerioder = [
        {
          id: '0',
          landkode: 'DZA',
          arbeidetUtenlands: false,
          startdato: '01.04.1980',
          sluttdato: '31.12.2000',
        },
        {
          id: '0',
          landkode: 'BEL',
          arbeidetUtenlands: false,
          startdato: '01.04.2024',
        },
      ]

      it('returnerer true når den nye perioden overlapper så lenge de er i samme jobb som har krav om arbeid og har ulik jobb-status', () => {
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            {
              landFormData: 'BEL',
              arbeidetUtenlandsFormData: 'ja',
              startdatoFormData: '12.08.2024',
              sluttdatoFormData: null,
            },
            foedselsdato,
            undefined,
            [...registrertePerioder],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeTruthy()
        expect(updateErrorMessageMock).not.toHaveBeenCalled()
      })

      it('returnerer false når den nye perioden overlapper med et ikke-avtale-land', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            {
              ...correctInputData,
              landFormData: 'FRA',
            },
            foedselsdato,
            undefined,
            [...registrertePerioder],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - overlappende perioder',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ikke_avtaleland',
        })
      })

      it('returnerer false når den nye perioden som overlapper er i et annet land', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            {
              landFormData: 'FRA',
              arbeidetUtenlandsFormData: 'nei',
              startdatoFormData: '01.06.2024',
              sluttdatoFormData: null,
            },
            foedselsdato,
            undefined,
            [...registrertePerioder],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - overlappende perioder',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.ulike_land',
        })
      })

      it('returnerer false når den nye perioden som overlapper er i samme land med lik bostatus', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            {
              landFormData: 'BEL',
              arbeidetUtenlandsFormData: 'nei',
              startdatoFormData: '01.06.2024',
              sluttdatoFormData: null,
            },
            foedselsdato,
            undefined,
            [...registrertePerioder],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - overlappende perioder',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.bostatus',
        })
      })

      it('returnerer false når den nye perioden som overlapper er i samme land med lik jobbstatus', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            {
              landFormData: 'BEL',
              arbeidetUtenlandsFormData: 'ja',
              startdatoFormData: '01.06.2024',
              sluttdatoFormData: null,
            },
            foedselsdato,
            undefined,
            [{ ...registrertePerioder[1], arbeidetUtenlands: true }],
            updateErrorMessageMock,
            'nb'
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
          skjemanavn: 'utenlandsopphold-oppholdet-ditt',
          data: 'Utenlandsopphold - overlappende perioder',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.overlappende_perioder.validation_error.jobbstatus',
        })
      })
    })
  })

  describe('onUtenlandsoppholdSubmit', () => {
    it('Når onUtenlandsoppholdSubmit kalles, hentes det riktig data fra formen. Dersom validering feiler lagres det ikke data og validationErrors vises', () => {
      const dispatchMock = vi.fn()
      const onSubmitCallbackMock = vi.fn()
      const modalRefMock = {} as React.RefObject<HTMLDialogElement>
      const setValidationErrorsMock = vi.fn()
      const getMock = vi.fn().mockImplementation((s: string) => {
        return s
      })
      const dataMock: FormData = { get: getMock } as unknown as FormData
      onUtenlandsoppholdSubmit(
        dataMock,
        dispatchMock,
        setValidationErrorsMock,
        modalRefMock,
        onSubmitCallbackMock,
        'nb',
        {
          foedselsdato: '1963-04-30',
          utenlandsperiodeId: '',
          utenlandsperioder: [],
        }
      )
      expect(getMock).toHaveBeenCalledTimes(4)
      expect(getMock).toHaveBeenNthCalledWith(1, 'utenlandsopphold-land')
      expect(getMock).toHaveBeenNthCalledWith(
        2,
        'utenlandsopphold-arbeidet-utenlands'
      )
      expect(getMock).toHaveBeenNthCalledWith(3, 'utenlandsopphold-startdato')
      expect(getMock).toHaveBeenNthCalledWith(4, 'utenlandsopphold-sluttdato')

      expect(dispatchMock).not.toHaveBeenCalled()
      expect(onSubmitCallbackMock).not.toHaveBeenCalled()
      expect(setValidationErrorsMock).toHaveBeenCalledTimes(2)
    })

    describe('Gitt at onUtenlandsoppholdSubmit kalles, og at validering er vellykket', () => {
      it('Når alle feltene er fylt ut, lagres det data og validationErrors kalles ikke', () => {
        const formDataAllFieldsSwitch = (s: string) => {
          switch (s) {
            case UTENLANDSOPPHOLD_FORM_NAMES.land:
              return 'SWE'
            case UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands:
              return 'ja'
            case UTENLANDSOPPHOLD_FORM_NAMES.startdato:
              return '21.12.2012'
            case UTENLANDSOPPHOLD_FORM_NAMES.sluttdato:
              return '18.03.2015'
            default:
              return ''
          }
        }

        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const closeMock = vi.fn()
        const dispatchMock = vi.fn()
        const onSubmitCallbackMock = vi.fn()
        const modalRefMock = {
          current: {
            open: true,
            close: closeMock,
          },
        } as unknown as React.RefObject<HTMLDialogElement>
        const setValidationErrorsMock = vi.fn()
        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onUtenlandsoppholdSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          modalRefMock,
          onSubmitCallbackMock,
          'nb',
          {
            foedselsdato: '1963-04-30',
            utenlandsperiodeId: '',
            utenlandsperioder: [],
          }
        )

        expect(dispatchMock.mock.calls[0][0].type).toStrictEqual(
          'userInputSlice/setUtenlandsperiode'
        )
        expect(dispatchMock.mock.calls[0][0].payload.id).toBeDefined()
        expect(
          dispatchMock.mock.calls[0][0].payload.arbeidetUtenlands
        ).toStrictEqual(true)
        expect(dispatchMock.mock.calls[0][0].payload.landkode).toStrictEqual(
          'SWE'
        )
        expect(dispatchMock.mock.calls[0][0].payload.startdato).toStrictEqual(
          '21.12.2012'
        )
        expect(dispatchMock.mock.calls[0][0].payload.sluttdato).toStrictEqual(
          '18.03.2015'
        )

        expect(onSubmitCallbackMock).toHaveBeenCalled()
        expect(closeMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('button klikk', {
          tekst: 'legger til utenlandsopphold',
        })
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })

      it('Når en eksisterende periode redigeres og at alle feltene er fylt ut, lagres det data og validationErrors kalles ikke', () => {
        const formDataAllFieldsSwitch = (s: string) => {
          switch (s) {
            case UTENLANDSOPPHOLD_FORM_NAMES.land:
              return 'SWE'
            case UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands:
              return 'ja'
            case UTENLANDSOPPHOLD_FORM_NAMES.startdato:
              return '21.12.2012'
            case UTENLANDSOPPHOLD_FORM_NAMES.sluttdato:
              return null
            default:
              return ''
          }
        }

        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const closeMock = vi.fn()
        const dispatchMock = vi.fn()
        const onSubmitCallbackMock = vi.fn()
        const modalRefMock = {
          current: {
            open: true,
            close: closeMock,
          },
        } as unknown as React.RefObject<HTMLDialogElement>
        const setValidationErrorsMock = vi.fn()
        const getMock = vi.fn().mockImplementation(formDataAllFieldsSwitch)
        const dataMock: FormData = { get: getMock } as unknown as FormData
        onUtenlandsoppholdSubmit(
          dataMock,
          dispatchMock,
          setValidationErrorsMock,
          modalRefMock,
          onSubmitCallbackMock,
          'nb',
          {
            foedselsdato: '1963-04-30',
            utenlandsperiodeId: '1',
            utenlandsperioder: [
              {
                id: '1',
                landkode: 'SWE',
                arbeidetUtenlands: false,
                startdato: '21.12.2012',
              },
            ],
          }
        )

        expect(dispatchMock.mock.calls[0][0].type).toStrictEqual(
          'userInputSlice/setUtenlandsperiode'
        )
        expect(dispatchMock.mock.calls[0][0].payload.id).toBeDefined()
        expect(
          dispatchMock.mock.calls[0][0].payload.arbeidetUtenlands
        ).toStrictEqual(true)
        expect(dispatchMock.mock.calls[0][0].payload.landkode).toStrictEqual(
          'SWE'
        )
        expect(dispatchMock.mock.calls[0][0].payload.startdato).toStrictEqual(
          '21.12.2012'
        )
        expect(dispatchMock.mock.calls[0][0].payload.sluttdato).toStrictEqual(
          undefined
        )

        expect(onSubmitCallbackMock).toHaveBeenCalled()
        expect(closeMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('button klikk', {
          tekst: 'endrer utenlandsopphold',
        })
        expect(setValidationErrorsMock).not.toHaveBeenCalled()
      })
    })
  })
})
