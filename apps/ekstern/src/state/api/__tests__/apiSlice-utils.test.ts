import {
  generateTidligsteHelUttaksalderRequestBody,
  generateTidligsteGradertUttaksalderRequestBody,
  generateAlderspensjonEnkelRequestBody,
  generateAlderspensjonRequestBody,
  generatePensjonsavtalerRequestBody,
} from '../utils'

describe('apiSlice - utils', () => {
  describe('generateTidligsteHelUttaksalderRequestBody', () => {
    const requestBody = {
      afp: null,
      harSamboer: null,
      aarligInntektFoerUttakBeloep: 0,
    }
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          afp: 'ja_privat',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
    })

    it('returnerer riktig harEps', () => {
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
        })?.harEps
      ).toBeUndefined()
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          harSamboer: true,
        })?.simuleringstype
      ).toBeTruthy()
    })

    it('returnerer riktig aarligInntektFoerUttakBeloep', () => {
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
        })?.aarligInntektFoerUttakBeloep
      ).toBe(0)
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          aarligInntektFoerUttakBeloep: 123456,
        })?.aarligInntektFoerUttakBeloep
      ).toBe(123456)
    })

    it('returnerer riktig sivilstand', () => {
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
        })?.sivilstand
      ).toBe('UGIFT')
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT',
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'GIFT',
        })?.sivilstand
      ).toBe('GIFT')
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          sivilstand: null,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT',
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
    })

    it('returnerer riktig aarligInntektVsaPensjon', () => {
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
        })?.aarligInntektVsaPensjon
      ).toBeUndefined()
      expect(
        generateTidligsteHelUttaksalderRequestBody({
          ...requestBody,
          aarligInntektVsaPensjon: {
            beloep: 99000,
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })?.aarligInntektVsaPensjon
      ).toStrictEqual({ beloep: 99000, sluttAlder: { aar: 75, maaneder: 0 } })
    })
  })

  describe('generateTidligsteGradertUttaksalderRequestBody', () => {
    const requestBody = {
      afp: null,
      harSamboer: null,
      aarligInntektFoerUttakBeloep: 0,
      gradertUttak: { grad: 20 },
      heltUttak: { uttaksalder: { aar: 67, maaneder: 2 } },
    }
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          afp: 'ja_privat',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
    })

    it('returnerer riktig harEps', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.harEps
      ).toBeUndefined()
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          harSamboer: true,
        })?.simuleringstype
      ).toBeTruthy()
    })

    it('returnerer riktig aarligInntektFoerUttakBeloep', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.aarligInntektFoerUttakBeloep
      ).toBe(0)
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          aarligInntektFoerUttakBeloep: 123456,
        })?.aarligInntektFoerUttakBeloep
      ).toBe(123456)
    })

    it('returnerer riktig sivilstand', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.sivilstand
      ).toBe('UGIFT')
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT',
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'GIFT',
        })?.sivilstand
      ).toBe('GIFT')
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          sivilstand: null,
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          sivilstand: 'UGIFT',
          harSamboer: true,
        })?.sivilstand
      ).toEqual('SAMBOER')
    })

    it('returnerer riktig gradertUttak', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.gradertUttak
      ).toStrictEqual({ grad: 20 })
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          gradertUttak: { grad: 20, aarligInntektVsaPensjonBeloep: 99000 },
        })?.gradertUttak
      ).toStrictEqual({ grad: 20, aarligInntektVsaPensjonBeloep: 99000 })
    })

    it('returnerer riktig heltUttak', () => {
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
        })?.heltUttak
      ).toStrictEqual({ uttaksalder: { aar: 67, maaneder: 2 } })
      expect(
        generateTidligsteGradertUttaksalderRequestBody({
          ...requestBody,
          heltUttak: {
            uttaksalder: { aar: 70, maaneder: 6 },
            aarligInntektVsaPensjon: {
              beloep: 99000,
              sluttAlder: { aar: 75, maaneder: 11 },
            },
          },
        })?.heltUttak
      ).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 6 },
        aarligInntektVsaPensjon: {
          beloep: 99000,
          sluttAlder: { aar: 75, maaneder: 11 },
        },
      })
    })
  })

  describe('generateAlderspensjonEnkelRequestBody', () => {
    const requestBody = {
      afp: 'ja_privat' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: false,
      aarligInntektFoerUttakBeloep: 500000,
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
        })?.aarligInntektFoerUttakBeloep
      ).toEqual(500000)
    })

    it('returnerer riktig uttaksalder', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
        })?.heltUttak.uttaksalder
      ).toEqual({
        aar: 68,
        maaneder: 3,
      })
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          uttaksalder: { aar: 68, maaneder: 0 },
        })?.heltUttak.uttaksalder
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
      aarligInntektFoerUttakBeloep: 500000,
      foedselsdato: '1963-04-30',
      heltUttak: {
        uttaksalder: { aar: 68, maaneder: 3 },
        aarligInntektVsaPensjon: {
          beloep: 99000,
          sluttAlder: { aar: 75, maaneder: 0 },
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
          aarligInntektVsaPensjonBeloep: 123000,
        },
      })?.gradertUttak
      expect(gradertUttak?.grad).toEqual(20)
      expect(gradertUttak?.aarligInntektVsaPensjonBeloep).toEqual(123000)
      expect(gradertUttak?.uttaksalder.aar).toEqual(67)
      expect(gradertUttak?.uttaksalder.maaneder).toEqual(3)
    })

    it('returnerer riktig heltUttak', () => {
      const heltUttak = generateAlderspensjonRequestBody({
        ...requestBody,
      })?.heltUttak

      expect(heltUttak?.uttaksalder.aar).toEqual(68)
      expect(heltUttak?.uttaksalder.maaneder).toEqual(3)
      expect(heltUttak?.aarligInntektVsaPensjon?.beloep).toEqual(99000)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.aar).toEqual(75)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.maaneder).toEqual(0)
    })

    it('formaterer streng dato korrekt', () => {
      expect(generateAlderspensjonRequestBody(requestBody)?.foedselsdato).toBe(
        '1963-04-30'
      )
    })
  })

  describe('generatePensjonsavtalerRequestBody', () => {
    it('returnerer riktig requestBody når maaneder er 0 og sivilstand undefined', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          aarligInntektFoerUttakBeloep: 500000,
          afp: 'vet_ikke',
          heltUttak: { uttaksalder: { aar: 67, maaneder: 0 } },
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: false,
        sivilstand: undefined,
        uttaksperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            grad: 100,
            aarligInntektVsaPensjon: undefined,
          },
        ],
      })
    })
    it('returnerer riktig requestBody når uttaksalder består av både år og måned', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          aarligInntektFoerUttakBeloep: 500000,
          afp: 'ja_privat',
          sivilstand: 'GIFT',
          heltUttak: {
            uttaksalder: { aar: 62, maaneder: 4 },
            aarligInntektVsaPensjon: {
              beloep: 99000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: true,
        sivilstand: 'GIFT',
        uttaksperioder: [
          {
            startAlder: { aar: 62, maaneder: 4 },
            grad: 100,
            aarligInntektVsaPensjon: {
              beloep: 99000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
        ],
      })
    })
    it('returnerer riktig requestBodymed gradert periode', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          aarligInntektFoerUttakBeloep: 500000,
          afp: 'ja_privat',
          sivilstand: 'GIFT',
          heltUttak: {
            uttaksalder: { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon: {
              beloep: 99000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
          gradertUttak: {
            uttaksalder: { aar: 62, maaneder: 4 },
            grad: 20,
            aarligInntektVsaPensjonBeloep: 123000,
          },
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: true,
        sivilstand: 'GIFT',
        uttaksperioder: [
          {
            startAlder: { aar: 62, maaneder: 4 },
            grad: 20,
            aarligInntektVsaPensjon: {
              beloep: 123000,
              sluttAlder: { aar: 67, maaneder: 0 },
            },
          },
          {
            startAlder: { aar: 67, maaneder: 0 },
            grad: 100,
            aarligInntektVsaPensjon: {
              beloep: 99000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
        ],
      })
    })
  })
})
