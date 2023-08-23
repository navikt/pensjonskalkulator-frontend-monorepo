import {
  generatePensjonsavtalerRequestBody,
  unformatUttaksalder,
  generateAlderspensjonRequestBody,
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

  describe('generateAlderspensjonRequestBody', () => {
    const requestBody = {
      afp: 'ja_privat' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: false,
      foedselsdato: '1963-04-30',
      startAlder: 68,
      startMaaned: 3,
      uttaksgrad: 100,
    }
    it('returnerer undefined når foedselsdato, startAlder, startMaaned, eller uttaksgrad er null', () => {
      expect(
        generateAlderspensjonRequestBody({ ...requestBody, foedselsdato: null })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          foedselsdato: undefined,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({ ...requestBody, startAlder: null })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({ ...requestBody, startMaaned: null })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({ ...requestBody, uttaksgrad: null })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          uttaksgrad: undefined,
        })
      ).toEqual(undefined)
    })
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDER_M_AFP_PRIVAT')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDER')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          afp: null,
        })?.simuleringstype
      ).toEqual('ALDER')
    })
    it('returnerer riktig uttaksgrad', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.uttaksgrad
      ).toEqual(100)
    })
    it('returnerer riktig sivilstand', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.sivilstand
      ).toEqual('GIFT')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          sivilstand: null,
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          sivilstand: null,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT' as Sivilstand,
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT' as Sivilstand,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
    })

    it('returnerer riktig uttaksalder', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaned: 3,
      })
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          startMaaned: 0,
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaned: 1,
      })
    })
  })
})
