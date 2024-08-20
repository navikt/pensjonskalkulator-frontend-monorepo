import { validateOpphold } from '../utils'
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
          [],
          updateErrorMessageMock
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
          data: 'Utenlandsopphold - land',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error',
        })
      })
    })

    describe('Gitt at arbeidetUtenlandsFormData ikke er gyldig', () => {
      it('returnerer false når arbeidetUtenlandsFormData er null', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, arbeidetUtenlandsFormData: null },
            foedselsdato,
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            { ...correctInputData, arbeidetUtenlandsFormData: '' },
            foedselsdato,
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            { ...correctInputData, arbeidetUtenlandsFormData: 'lorem' },
            foedselsdato,
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
          data: 'Utenlandsopphold - arbeidet utenlands',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error',
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
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
            [],
            updateErrorMessageMock
          )
        ).toBeTruthy()
        expect(updateErrorMessageMock).not.toHaveBeenCalled()
      })
      it('returnerer true når sluttdatoFormData er null og at et annet opphold med samme land også er registrert uten sluttdato', () => {
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: null },
            foedselsdato,
            [
              {
                id: '0',
                landkode: 'DZA',
                arbeidetUtenlands: false,
                startdato: '01.04.1980',
              },
            ],
            updateErrorMessageMock
          )
        ).toBeTruthy()
        expect(updateErrorMessageMock).not.toHaveBeenCalled()
      })
      it('returnerer false når sluttdatoFormData er null og at et annet opphold med et annet land land også er registrert uten sluttdato', () => {
        const loggerMock = vi.spyOn(loggerUtils, 'logger')
        const updateErrorMessageMock = vi.fn()
        expect(
          validateOpphold(
            { ...correctInputData, sluttdatoFormData: null },
            foedselsdato,
            [
              {
                id: '0',
                landkode: 'FLK',
                arbeidetUtenlands: false,
                startdato: '01.04.1980',
              },
            ],
            updateErrorMessageMock
          )
        ).toBeFalsy()
        expect(updateErrorMessageMock).toHaveBeenCalled()
        expect(loggerMock).toHaveBeenCalledWith('valideringsfeil', {
          data: 'Utenlandsopphold - sluttdato',
          tekst:
            'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.validation_error.required',
        })
      })
    })
  })
})
