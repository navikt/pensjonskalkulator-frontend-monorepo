import { IntlShape } from 'react-intl'

import * as loggerUtils from '@/utils/logging'

import { onSubmit } from '../utils'

describe('Utenlandsopphold-utils', () => {
  describe('onSubmit', () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape

    it('Når data er null vises det feilmelding og onNext kalles ikke', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      const onNextMock = vi.fn()
      const setValidationErrorsMock = vi.fn()
      onSubmit(null, intlMock, setValidationErrorsMock, 0, onNextMock)
      expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
        skjemanavn: 'stegvisning-utenlandsopphold',
        data: 'stegvisning.utenlandsopphold.radio_label',
        tekst: 'stegvisning.utenlandsopphold.validation_error',
      })
      expect(setValidationErrorsMock).toHaveBeenCalled()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    it('Når data er "ja", men at det er ikke noe utenlandsperioder vises det feilmelding og onNext kalles ikke', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      const onNextMock = vi.fn()
      const setValidationErrorsMock = vi.fn()
      onSubmit('ja', intlMock, setValidationErrorsMock, 0, onNextMock)
      expect(loggerMock).toHaveBeenCalledWith('skjema validering feilet', {
        skjemanavn: 'stegvisning-utenlandsopphold',
        data: 'stegvisning.utenlandsopphold.radio_label',
        tekst: 'stegvisning.utenlandsopphold.mangler_opphold.validation_error',
      })
      expect(setValidationErrorsMock).toHaveBeenCalled()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    it('Når data er "ja", men at det finnes utenlandsperioder vises det ikke feilmelding og onNext kalles', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      const onNextMock = vi.fn()
      const setValidationErrorsMock = vi.fn()
      onSubmit('ja', intlMock, setValidationErrorsMock, 1, onNextMock)
      expect(loggerMock).toHaveBeenCalledWith('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: 'ja',
      })
      expect(setValidationErrorsMock).not.toHaveBeenCalled()
      expect(onNextMock).toHaveBeenCalled()
    })

    it('Når data er "nei", vises det ikke feilmelding og onNext kalles', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      const onNextMock = vi.fn()
      const setValidationErrorsMock = vi.fn()
      onSubmit('nei', intlMock, setValidationErrorsMock, 0, onNextMock)
      expect(loggerMock).toHaveBeenCalledWith('radiogroup valgt', {
        tekst: 'Utenlandsopphold',
        valg: 'nei',
      })
      expect(setValidationErrorsMock).not.toHaveBeenCalled()
      expect(onNextMock).toHaveBeenCalled()
    })
  })
})
