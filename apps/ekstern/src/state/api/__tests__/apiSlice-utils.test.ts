import {
  generatePensjonsavtalerRequestBody,
  unformatUttaksalder,
} from '../utils'

describe('apiSlice - utils', () => {
  describe('generatePensjonsavtalerRequestBody', () => {
    it('returnerer riktig requestBody når maaned er 0', () => {
      expect(
        generatePensjonsavtalerRequestBody({ aar: 67, maaned: 0 })
      ).toEqual({
        uttaksperioder: [
          {
            startAlder: 67,
            startMaaned: 1,
            grad: 100,
            aarligInntekt: 0,
          },
        ],
        antallInntektsaarEtterUttak: 0,
      })
    })
    it('returnerer riktig requestBody når uttaksalder består av både år og måned', () => {
      expect(
        generatePensjonsavtalerRequestBody({ aar: 62, maaned: 4 })
      ).toEqual({
        uttaksperioder: [
          {
            startAlder: 62,
            startMaaned: 4,
            grad: 100,
            aarligInntekt: 0,
          },
        ],
        antallInntektsaarEtterUttak: 0,
      })
    })
  })
  describe('unformatUttaksalder', () => {
    it('returnerer riktig aar og maaned', () => {
      expect(
        unformatUttaksalder('random string without number (feil)')
      ).toEqual({ aar: 0, maaned: 0 })
      expect(unformatUttaksalder('67 år')).toEqual({ aar: 67, maaned: 0 })
      expect(unformatUttaksalder('62 år 5 måneder')).toEqual({
        aar: 62,
        maaned: 5,
      })
    })
  })
})
