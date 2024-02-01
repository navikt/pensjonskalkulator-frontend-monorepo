import { describe, expect, it } from 'vitest'

import { validateAvansertBeregningSkjema } from '../utils'
import * as alderUtils from '@/utils/alder'
import * as inntektUtils from '@/utils/inntekt'

describe('RedigerAvansertBeregning-utils', () => {
  describe('validateAvansertBeregningSkjema', () => {
    const correctInputData = {
      gradertUttakAarFormData: '62',
      gradertUttakMaanederFormData: '5',
      heltUttakAarFormData: '67',
      heltUttakMaanederFormData: '0',
      uttaksgradFormData: '40 %',
      inntektVsaGradertPensjonFormData: '99000',
    }

    it('returnerer true uten å oppdatere feilmeldingsteksten når input er korrekt', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          correctInputData,
          updateErrorMessageMock
        )
      ).toBeTruthy()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false når uttaksgrad er noe annet enn et tall', () => {
      const updateErrorMessageMock = vi.fn()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: 'abc' },
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '400' },
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, uttaksgradFormData: '4000' },
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })

    it('returnerer false når inntekt ikke er gyldig (alle cases allerede videre i validateInntekt) ', () => {
      const updateErrorMessageMock = vi.fn()
      const validateInntektMock = vi.spyOn(inntektUtils, 'validateInntekt')
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, inntektVsaGradertPensjonFormData: 'abc' },
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(validateInntektMock).toHaveBeenCalled()
      expect(updateErrorMessageMock).toHaveBeenCalled()
    })

    it('returnerer false når heltUttakAar eller heltUttakMaaneder ikke er gyldig (alle cases allerede videre i validateAlderFromForm) ', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, heltUttakAarFormData: 'abc' },
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, heltUttakMaanederFormData: null },
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(4)
      expect(updateErrorMessageMock).toHaveBeenCalledTimes(2)
    })

    it('returnerer false når gradertUttakAar eller gradertUttakMaaneder ikke er gyldig (alle cases allerede videre i validateAlderFromForm) ', () => {
      const updateErrorMessageMock = vi.fn()
      const validateAlderFromFormMock = vi.spyOn(
        alderUtils,
        'validateAlderFromForm'
      )
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, gradertUttakAarFormData: 'abc' },
          updateErrorMessageMock
        )
      ).toBeFalsy()
      expect(
        validateAvansertBeregningSkjema(
          { ...correctInputData, gradertUttakMaanederFormData: null },
          updateErrorMessageMock
        )
      ).toBeFalsy()

      expect(validateAlderFromFormMock).toHaveBeenCalledTimes(4)
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
          updateErrorMessageMock
        )
      ).toBeTruthy()

      expect(validateAlderFromFormMock).toHaveBeenCalled()
      expect(updateErrorMessageMock).not.toHaveBeenCalled()
    })
  })
})
