import { describe, expect, it } from 'vitest'

import {
  validateAvansertBeregningSkjema,
  getMinAlderTilHeltUttak,
} from '../utils'
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

  describe('getMinAlderTilHeltUttak', () => {
    it('returnerer 62 år og 0 md. når hverken gradert uttak eller tidligst mulig uttak er oppgitt', () => {
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: undefined,
          tidligstMuligHeltUttak: undefined,
        })
      ).toStrictEqual({ aar: 62, maaneder: 0 })
    })

    it('returnerer tidligstMuligHeltUttak når gradert uttak ikker er oppgitt', () => {
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: undefined,
          tidligstMuligHeltUttak: { aar: 64, maaneder: 3 },
        })
      ).toStrictEqual({ aar: 64, maaneder: 3 })
    })

    it('returnerer temporaryGradertUttak + 1 måned når gradert uttak er oppgitt og brukeren har høy nok opptjening', () => {
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: { aar: 64, maaneder: 3 },
          tidligstMuligHeltUttak: { aar: 62, maaneder: 0 },
        })
      ).toStrictEqual({ aar: 64, maaneder: 4 })
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: { aar: 64, maaneder: 11 },
          tidligstMuligHeltUttak: { aar: 62, maaneder: 0 },
        })
      ).toStrictEqual({ aar: 65, maaneder: 0 })
    })

    it('returnerer 67 år og 0 md. når gradert uttak er oppgitt og brukeren ikke har høy nok opptjening', () => {
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: { aar: 64, maaneder: 3 },
          tidligstMuligHeltUttak: { aar: 62, maaneder: 1 },
        })
      ).toStrictEqual({ aar: 67, maaneder: 0 })
    })

    it('returnerer temporaryGradertUttak + 1 måned når gradert uttak er oppgitt senere enn 67 år og 0 md., brukeren har høy nok opptjening', () => {
      expect(
        getMinAlderTilHeltUttak({
          temporaryGradertUttak: { aar: 68, maaneder: 3 },
          tidligstMuligHeltUttak: { aar: 62, maaneder: 0 },
        })
      ).toStrictEqual({ aar: 68, maaneder: 4 })
    })
  })
})
