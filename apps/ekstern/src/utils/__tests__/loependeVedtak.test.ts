import { describe, expect } from 'vitest'

import {
  loependeVedtak0UfoeregradMock,
  loependeVedtak75UfoeregradMock,
  loependeVedtak100UfoeregradMock,
  loependeVedtakLoepende0Alderspensjon100UfoeretrygdMock,
  loependeVedtakLoepende50AlderspensjonMock,
  loependeVedtakLoependeAFPoffentligMock,
  loependeVedtakLoependeAFPprivatMock,
  loependeVedtakLoependeAlderspensjonMock,
  loependeVedtakLoependeAlderspensjonOg40UfoeretrygdMock,
} from '@/mocks/mockedRTKQueryApiCalls'

import { isLoependeVedtakEndring } from '../loependeVedtak'

describe('loependeVedtak-utils', () => {
  describe('isLoependeVedtakEndring', () => {
    it('returnerer false når det ikke er vedtak om alderspensjon', () => {
      expect(isLoependeVedtakEndring(loependeVedtak0UfoeregradMock)).toBeFalsy()
      expect(
        isLoependeVedtakEndring(loependeVedtak100UfoeregradMock)
      ).toBeFalsy()
      expect(
        isLoependeVedtakEndring(loependeVedtak75UfoeregradMock)
      ).toBeFalsy()
    })
    it('returnerer false når det er vedtak om AFP-offentlig alene', () => {
      expect(
        isLoependeVedtakEndring(loependeVedtakLoependeAFPoffentligMock)
      ).toBeFalsy()
    })
    it('returnerer true når det er vedtak om alderspensjon 0 % og uføretrygd 100 %', () => {
      expect(
        isLoependeVedtakEndring(
          loependeVedtakLoepende0Alderspensjon100UfoeretrygdMock
        )
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon', () => {
      expect(
        isLoependeVedtakEndring(loependeVedtakLoependeAlderspensjonMock)
      ).toBeTruthy()
      expect(
        isLoependeVedtakEndring(loependeVedtakLoepende50AlderspensjonMock)
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon og gradert uføretrygd', () => {
      expect(
        isLoependeVedtakEndring(
          loependeVedtakLoependeAlderspensjonOg40UfoeretrygdMock
        )
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon 0 % og og AFP-privat', () => {
      expect(
        isLoependeVedtakEndring(loependeVedtakLoependeAFPprivatMock)
      ).toBeTruthy()
    })
  })
})
