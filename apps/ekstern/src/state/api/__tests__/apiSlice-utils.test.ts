import {
  generatePensjonsavtalerRequestBody,
  generateAlderspensjonEnkelRequestBody,
  generateAlderspensjonRequestBody,
} from '../utils'

describe('apiSlice - utils', () => {
  describe('generatePensjonsavtalerRequestBody', () => {
    it('returnerer riktig requestBody når maaneder er 0 og sivilstand undefined', () => {
      expect(
        generatePensjonsavtalerRequestBody(500000, 'vet_ikke', {
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjon: 0,
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
          {
            uttaksalder: { aar: 62, maaneder: 4 },
            aarligInntektVsaPensjon: 99000,
          },
          'GIFT'
        )
      ).toEqual({
        aarligInntektFoerUttak: 500000,
        antallInntektsaarEtterUttak: 0,
        harAfp: true,
        sivilstand: 'GIFT',
        uttaksperioder: [
          {
            startAlder: { aar: 62, maaneder: 4 },
            grad: 100,
            aarligInntekt: 99000,
          },
        ],
      })
    })
    it('returnerer riktig requestBodymed gradert periode', () => {
      expect(
        generatePensjonsavtalerRequestBody(
          500000,
          'ja_privat',
          {
            uttaksalder: { aar: 67, maaneder: 0 },

            aarligInntektVsaPensjon: 99000,
          },
          'GIFT',
          {
            uttaksalder: { aar: 62, maaneder: 4 },
            grad: 20,
            aarligInntektVsaPensjon: 123000,
          }
        )
      ).toEqual({
        aarligInntektFoerUttak: 500000,
        antallInntektsaarEtterUttak: 0,
        harAfp: true,
        sivilstand: 'GIFT',
        uttaksperioder: [
          {
            startAlder: { aar: 62, maaneder: 4 },
            grad: 20,
            aarligInntekt: 123000,
          },
          {
            startAlder: { aar: 67, maaneder: 0 },
            grad: 100,
            aarligInntekt: 99000,
          },
        ],
      })
    })
  })

  describe('generateAlderspensjonEnkelRequestBody', () => {
    const requestBody = {
      afp: 'ja_privat' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: false,
      aarligInntektFoerUttak: 500000,
      foedselsdato: '1963-04-30',
      uttaksalder: { aar: 68, maaneder: 3 },
      uttaksgrad: 100,
    }
    it('returnerer undefined når foedselsdato, eller startAlder er null', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          foedselsdato: null,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          foedselsdato: undefined,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          uttaksalder: null,
        })
      ).toEqual(undefined)
    })
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          afp: null,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
    })

    it('returnerer riktig uttaksgrad', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.uttaksgrad
      ).toEqual(100)
    })
    it('returnerer riktig sivilstand', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.sivilstand
      ).toEqual('GIFT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          sivilstand: null,
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          sivilstand: null,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT' as Sivilstand,
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT' as Sivilstand,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
    })

    it('returnerer riktig forventetInntekt', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.forventetInntekt
      ).toEqual(500000)
    })

    it('returnerer riktig uttaksalder', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaneder: 3,
      })
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          uttaksalder: { aar: 68, maaneder: 0 },
        })?.foersteUttaksalder
      ).toEqual({
        aar: 68,
        maaneder: 0,
      })
    })

    it('formaterer streng dato korrekt', () => {
      expect(
        generateAlderspensjonEnkelRequestBody(requestBody)?.foedselsdato
      ).toBe('1963-04-30')
    })
  })

  describe('generateAlderspensjonRequestBody', () => {
    const requestBody = {
      afp: 'ja_privat' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: false,
      aarligInntektFoerUttak: 500000,
      foedselsdato: '1963-04-30',
      heltUttak: {
        uttaksalder: { aar: 68, maaneder: 3 },
        aarligInntektVsaPensjon: 99000,
        inntektTomAlder: {
          aar: 75,
          maaneder: 0,
        },
      },
    }
    it('returnerer undefined når foedselsdato, eller heltUttak er null/undefined', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          foedselsdato: null,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          foedselsdato: undefined,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...requestBody,
          heltUttak: undefined,
        })
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

    it('returnerer riktig gradertUttak', () => {
      const gradertUttak = generateAlderspensjonRequestBody({
        ...requestBody,
        gradertUttak: {
          uttaksalder: { aar: 67, maaneder: 3 },
          grad: 20,
          aarligInntektVsaPensjon: 123000,
        },
      })?.gradertUttak
      expect(gradertUttak?.grad).toEqual(20)
      expect(gradertUttak?.aarligInntektVsaPensjon).toEqual(123000)
      expect(gradertUttak?.uttaksalder.aar).toEqual(67)
      expect(gradertUttak?.uttaksalder.maaneder).toEqual(3)
    })

    it('returnerer riktig heltUttak', () => {
      const heltUttak = generateAlderspensjonRequestBody({
        ...requestBody,
      })?.heltUttak

      expect(heltUttak?.aarligInntektVsaPensjon).toEqual(99000)
      expect(heltUttak?.uttaksalder.aar).toEqual(68)
      expect(heltUttak?.uttaksalder.maaneder).toEqual(3)
      expect(heltUttak?.inntektTomAlder?.aar).toEqual(75)
      expect(heltUttak?.inntektTomAlder?.maaneder).toEqual(0)
    })

    it('formaterer streng dato korrekt', () => {
      expect(generateAlderspensjonRequestBody(requestBody)?.foedselsdato).toBe(
        '1963-04-30'
      )
    })
  })
})
