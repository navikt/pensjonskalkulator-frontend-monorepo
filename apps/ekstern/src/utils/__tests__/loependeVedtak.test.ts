import { describe, expect } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
  fulfilledGetLoependeVedtakLoepende50Alderspensjon,
  fulfilledGetLoependeVedtakLoependeAFPoffentlig,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd,
} from '@/mocks/mockedRTKQueryApiCalls'

import { isLoependeVedtakEndring } from '../loependeVedtak'

describe('loependeVedtak-utils', () => {
  describe('isLoependeVedtakEndring', () => {
    it('returnerer false når det ikke er vedtak om alderspensjon', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtak0Ufoeregrad['getLoependeVedtak(undefined)']
            .data
        )
      ).toBeFalsy()
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtak100Ufoeregrad[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeFalsy()
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtak75Ufoeregrad['getLoependeVedtak(undefined)']
            .data
        )
      ).toBeFalsy()
    })
    it('returnerer false når det er vedtak om AFP-offentlig alene', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoependeAFPoffentlig[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeFalsy()
    })
    it('returnerer true når det er vedtak om alderspensjon 0 % og uføretrygd 100 %', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoependeAlderspensjon[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeTruthy()
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoepende50Alderspensjon[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon og gradert uføretrygd', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeTruthy()
    })
    it('returnerer true når det er vedtak om alderspensjon 0 % og og AFP-privat', () => {
      expect(
        isLoependeVedtakEndring(
          fulfilledGetLoependeVedtakLoependeAFPprivat[
            'getLoependeVedtak(undefined)'
          ].data
        )
      ).toBeTruthy()
    })
  })
})
