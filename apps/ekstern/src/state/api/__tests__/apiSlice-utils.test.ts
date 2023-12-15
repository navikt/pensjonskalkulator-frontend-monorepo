import {
  generatePensjonsavtalerRequestBody,
  unformatUttaksalder,
  generateAlderspensjonRequestBody,
} from '../utils'

describe('apiSlice - utils', () => {
  describe('generatePensjonsavtalerRequestBody', () => {
    it('returnerer riktig requestBody når maaneder er 0 og sivilstand undefined', () => {
      expect(
        generatePensjonsavtalerRequestBody(500000, 'vet_ikke', {
          aar: 67,
          maaneder: 0,
        })
      ).toEqual({
        aarligInntektFoerUttak: 500000,
        antallInntektsaarEtterUttak: 0,
        harAfp: false,
        sivilstand: undefined,
        uttaksperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            grad: 100,
            aarligInntekt: 0,
          },
        ],
      })
    })
    it('returnerer riktig requestBody når uttaksalder består av både år og måned', () => {
      expect(
        generatePensjonsavtalerRequestBody(
          500000,
          'ja_privat',
          { aar: 62, maaneder: 4 },
          'GIFT'
        )
      ).toEqual({
        aarligInntektFoerUttak: 500000,
        antallInntektsaarEtterUttak: 0,
        harAfp: true,
        sivilstand: 'GIFT',
        uttaksperioder: [
          { startAlder: { aar: 62, maaneder: 4 }, grad: 100, aarligInntekt: 0 },
        ],
      })
    })
  })
  describe('unformatUttaksalder', () => {
    it('returnerer riktig aar og maaned', () => {
      expect(
        unformatUttaksalder('random string without number (feil)')
      ).toEqual({ aar: 0, maaneder: 0 })
      expect(unformatUttaksalder('67 alder.aar')).toEqual({
        aar: 67,
        maaneder: 0,
      })
      expect(unformatUttaksalder('62 alder.aar og 5 alder.maaneder')).toEqual({
        aar: 62,
        maaneder: 5,
      })
    })
  })

  describe('generateAlderspensjonRequestBody', () => {
    const requestBody = {
      afp: 'ja_privat' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: false,
      aarligInntektFoerUttak: 500000,
      foedselsdato: '1963-04-30',
      startAlder: 68,
      startMaaned: 3,
      uttaksgrad: 100,
    }
    it('returnerer undefined når foedselsdato, startAlder, eller startMaaned er null', () => {
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
    })
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          afp: null,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
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

    it('returnerer riktig forventetInntekt', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.forventetInntekt
      ).toEqual(500000)
    })

    it('returnerer riktig uttaksalder', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaneder: 3,
      })
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          startMaaned: 0,
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaneder: 0,
      })
    })

    it('formaterer streng dato korrekt', () => {
      expect(generateAlderspensjonRequestBody(requestBody)?.foedselsdato).toBe(
        '1963-04-30'
      )
    })
  })
})
