import {
  getSimuleringstypeFromRadioEllerVedtak,
  transformUtenlandsperioderArray,
  generateTidligstMuligHeltUttakRequestBody,
  generateAlderspensjonEnkelRequestBody,
  generateAlderspensjonRequestBody,
  generatePensjonsavtalerRequestBody,
  generateOffentligTpRequestBody,
} from '../utils'
import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetLoependeVedtakLoependeAFPoffentlig,
} from '@/mocks/mockedRTKQueryApiCalls'

describe('apiSlice - utils', () => {
  const utenlandsperiode: Utenlandsperiode = {
    id: '12345',
    landkode: 'URY',
    arbeidetUtenlands: null,
    startdato: '01.01.2018',
    sluttdato: '28.01.2018',
  }

  describe('getSimuleringstypeFromRadioEllerVedtak', () => {
    it('returnerer riktig simuleringstype', () => {
      const loependeVedtak_0_ufoeregrad =
        fulfilledGetLoependeVedtak0Ufoeregrad['getLoependeVedtak(undefined)']
          .data
      const loependeVedtak_75_ufoeregrad =
        fulfilledGetLoependeVedtak75Ufoeregrad['getLoependeVedtak(undefined)']
          .data
      const loependeVedtak_loepende_alderspensjon =
        fulfilledGetLoependeVedtakLoependeAlderspensjon[
          'getLoependeVedtak(undefined)'
        ].data

      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_0_ufoeregrad,
          null
        )
      ).toEqual('ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_0_ufoeregrad,
          'nei'
        )
      ).toEqual('ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_0_ufoeregrad,
          'vet_ikke'
        )
      ).toEqual('ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_0_ufoeregrad,
          'ja_privat'
        )
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_0_ufoeregrad,
          'ja_offentlig'
        )
      ).toEqual('ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          'ja_privat'
        )
      ).toEqual('ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          'ja_offentlig'
        )
      ).toEqual('ALDERSPENSJON')

      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_loepende_alderspensjon,
          null
        )
      ).toEqual('ENDRING_ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_loepende_alderspensjon,
          'nei'
        )
      ).toEqual('ENDRING_ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_loepende_alderspensjon,
          'vet_ikke'
        )
      ).toEqual('ENDRING_ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_loepende_alderspensjon,
          'ja_privat'
        )
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_loepende_alderspensjon,
          'ja_offentlig'
        )
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd[
            'getLoependeVedtak(undefined)'
          ].data,
          'ja_privat'
        )
      ).toEqual('ENDRING_ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          fulfilledGetLoependeVedtakLoependeAFPprivat[
            'getLoependeVedtak(undefined)'
          ].data,
          null
        )
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          fulfilledGetLoependeVedtakLoependeAFPoffentlig[
            'getLoependeVedtak(undefined)'
          ].data,
          null
        )
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')

      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          'ja_offentlig',
          'uten_afp'
        )
      ).toEqual('ALDERSPENSJON')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          'ja_privat',
          'med_afp'
        )
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          'ja_offentlig',
          'med_afp'
        )
      ).toEqual('ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        getSimuleringstypeFromRadioEllerVedtak(
          loependeVedtak_75_ufoeregrad,
          null,
          'med_afp'
        )
      ).toEqual('ALDERSPENSJON')
    })
  })

  describe('transformUtenlandsperioderArray', () => {
    it('returnerer riktig array', () => {
      expect(transformUtenlandsperioderArray([])).toEqual([])
      expect(
        transformUtenlandsperioderArray([{ ...utenlandsperiode }])
      ).toStrictEqual([
        {
          landkode: 'URY',
          arbeidetUtenlands: false,
          fom: '2018-01-01',
          tom: '2018-01-28',
        },
      ])
      expect(
        transformUtenlandsperioderArray([
          { ...utenlandsperiode },
          {
            id: '98765',
            landkode: 'BFA',
            arbeidetUtenlands: true,
            startdato: '07.02.2005',
          },
        ])
      ).toStrictEqual([
        {
          landkode: 'URY',
          arbeidetUtenlands: false,
          fom: '2018-01-01',
          tom: '2018-01-28',
        },
        {
          landkode: 'BFA',
          arbeidetUtenlands: true,
          fom: '2005-02-07',
          tom: undefined,
        },
      ])
    })
  })

  describe('generateTidligstMuligHeltUttakRequestBody', () => {
    const requestBody = {
      loependeVedtak: {
        ufoeretrygd: { grad: 0 },
      } satisfies LoependeVedtak,
      afp: null,
      sivilstand: null,
      epsHarPensjon: null,
      epsHarInntektOver2G: null,
      aarligInntektFoerUttakBeloep: '0',
      utenlandsperioder: [],
    }
    it('returnerer riktig simuleringstype', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          afp: 'ja_privat',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')

      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          loependeVedtak: {
            ufoeretrygd: { grad: 50 },
          },
          afp: 'ja_privat',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')

      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          loependeVedtak: {
            alderspensjon: {
              grad: 50,
              fom: '2012-12-12',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 0 },
          },
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON')

      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          loependeVedtak: {
            alderspensjon: {
              grad: 50,
              fom: '2012-12-12',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 0 },
          },
          afp: 'ja_privat',
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT')
    })

    it('returnerer riktig harEps', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.epsHarPensjon
      ).toBeFalsy()
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          epsHarPensjon: true,
        })?.epsHarPensjon
      ).toBeTruthy()
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          epsHarInntektOver2G: true,
        })?.epsHarInntektOver2G
      ).toBeTruthy()
    })

    it('returnerer riktig aarligInntektFoerUttakBeloep', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.aarligInntektFoerUttakBeloep
      ).toBe(0)
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          aarligInntektFoerUttakBeloep: '123 456',
        })?.aarligInntektFoerUttakBeloep
      ).toBe(123456)
    })

    it('returnerer riktig sivilstand', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.sivilstand
      ).toBe('UOPPGITT')
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          sivilstand: 'SAMBOER',
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          sivilstand: 'GIFT',
        })?.sivilstand
      ).toBe('GIFT')
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          sivilstand: null,
        })?.sivilstand
      ).toEqual('UOPPGITT')
    })

    it('returnerer riktig aarligInntektVsaPensjon', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
        })?.aarligInntektVsaPensjon
      ).toBeUndefined()
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          aarligInntektVsaPensjon: {
            beloep: '99 000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })?.aarligInntektVsaPensjon
      ).toStrictEqual({
        beloep: 99000,
        sluttAlder: { aar: 75, maaneder: 0 },
      })
    })

    it('returnerer riktig utenlandsperioder', () => {
      expect(
        generateTidligstMuligHeltUttakRequestBody({
          ...requestBody,
          utenlandsperioder: [{ ...utenlandsperiode }],
        })?.utenlandsperiodeListe
      ).toStrictEqual([
        {
          landkode: 'URY',
          arbeidetUtenlands: false,
          fom: '2018-01-01',
          tom: '2018-01-28',
        },
      ])
    })
  })

  describe('generateAlderspensjonEnkelRequestBody', () => {
    const requestBody = {
      loependeVedtak: {
        ufoeretrygd: { grad: 0 },
      } satisfies LoependeVedtak,
      afp: 'ja_privat' as const,
      sivilstand: 'GIFT' as const,
      epsHarInntektOver2G: null,
      epsHarPensjon: null,
      aarligInntektFoerUttakBeloep: '500 000',
      foedselsdato: '1963-04-30',
      uttaksalder: { aar: 68, maaneder: 3 },
      uttaksgrad: 100,
      utenlandsperioder: [],
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
          afp: 'ja_offentlig',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          afp: 'vet_ikke',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          afp: null,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          loependeVedtak: {
            ufoeretrygd: { grad: 50 },
          },
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          loependeVedtak: {
            alderspensjon: {
              grad: 50,
              fom: '2012-12-12',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 0 },
          },
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          loependeVedtak: {
            alderspensjon: {
              grad: 50,
              fom: '2012-12-12',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 0 },
          },
          afp: 'ja_offentlig',
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          loependeVedtak: {
            alderspensjon: {
              grad: 50,
              fom: '2012-12-12',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 50 },
          },
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON')
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
          sivilstand: 'UGIFT',
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          sivilstand: 'GIFT',
        })?.sivilstand
      ).toEqual('GIFT')
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

    it('returnerer riktig utenlandsperioder', () => {
      expect(
        generateAlderspensjonEnkelRequestBody({
          ...requestBody,
          utenlandsperioder: [{ ...utenlandsperiode }],
        })?.utenlandsperiodeListe
      ).toStrictEqual([
        {
          landkode: 'URY',
          arbeidetUtenlands: false,
          fom: '2018-01-01',
          tom: '2018-01-28',
        },
      ])
    })
  })

  describe('generateAlderspensjonRequestBody', () => {
    const args = {
      loependeVedtak: {
        ufoeretrygd: { grad: 0 },
      },
      afp: 'ja_privat' as const,
      sivilstand: 'GIFT' as const,
      epsHarInntektOver2G: null,
      epsHarPensjon: null,
      aarligInntektFoerUttakBeloep: '500 000',
      foedselsdato: '1963-04-30',
      gradertUttak: null,
      heltUttak: {
        uttaksalder: { aar: 68, maaneder: 3 },
        aarligInntektVsaPensjon: {
          beloep: '99 000',
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      },
      utenlandsperioder: [],
    }
    it('returnerer undefined når foedselsdato, eller heltUttak er null/undefined', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          foedselsdato: null,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          foedselsdato: undefined,
        })
      ).toEqual(undefined)
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          heltUttak: undefined,
        })
      ).toEqual(undefined)
    })

    it('returnerer riktig simuleringstype', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...args,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: 'ja_offentlig',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: 'nei',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: 'vet_ikke',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: null,
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: null,
          loependeVedtak: {
            ufoeretrygd: { grad: 60 },
          },
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          loependeVedtak: {
            alderspensjon: { grad: 60, fom: '2010-10-10', sivilstand: 'UGIFT' },
            ufoeretrygd: { grad: 0 },
          },
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          afp: null,
          loependeVedtak: {
            alderspensjon: { grad: 60, fom: '2010-10-10', sivilstand: 'UGIFT' },
            ufoeretrygd: { grad: 0 },
          },
        })?.simuleringstype
      ).toEqual('ENDRING_ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          loependeVedtak: {
            ufoeretrygd: { grad: 50 },
          },
          beregningsvalg: 'uten_afp',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          loependeVedtak: {
            ufoeretrygd: { grad: 50 },
          },
          beregningsvalg: 'med_afp',
        })?.simuleringstype
      ).toEqual('ALDERSPENSJON_MED_AFP_PRIVAT')
    })

    it('returnerer riktig sivilstand', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...args,
        })?.sivilstand
      ).toEqual('GIFT')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          sivilstand: null,
        })?.sivilstand
      ).toEqual('UOPPGITT')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          sivilstand: 'SAMBOER',
        })?.sivilstand
      ).toEqual('SAMBOER')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          sivilstand: 'UGIFT',
        })?.sivilstand
      ).toEqual('UGIFT')
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          sivilstand: 'UGIFT',
        })?.sivilstand
      ).toEqual('UGIFT')
    })

    it('returnerer riktig gradertUttak', () => {
      const gradertUttak = generateAlderspensjonRequestBody({
        ...args,
        gradertUttak: {
          uttaksalder: { aar: 67, maaneder: 3 },
          grad: 20,
          aarligInntektVsaPensjonBeloep: '123 000',
        },
      })?.gradertUttak
      expect(gradertUttak?.grad).toEqual(20)
      expect(gradertUttak?.aarligInntektVsaPensjonBeloep).toEqual(123000)
      expect(gradertUttak?.uttaksalder.aar).toEqual(67)
      expect(gradertUttak?.uttaksalder.maaneder).toEqual(3)
    })

    it('returnerer riktig heltUttak', () => {
      const heltUttak = generateAlderspensjonRequestBody({
        ...args,
      })?.heltUttak

      expect(heltUttak?.uttaksalder.aar).toEqual(68)
      expect(heltUttak?.uttaksalder.maaneder).toEqual(3)
      expect(heltUttak?.aarligInntektVsaPensjon?.beloep).toEqual(99000)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.aar).toEqual(75)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.maaneder).toEqual(0)
    })

    it('formaterer streng dato korrekt', () => {
      expect(generateAlderspensjonRequestBody(args)?.foedselsdato).toBe(
        '1963-04-30'
      )
    })

    it('returnerer riktig utenlandsperioder', () => {
      expect(
        generateAlderspensjonRequestBody({
          ...args,
          utenlandsperioder: [{ ...utenlandsperiode }],
        })?.utenlandsperiodeListe
      ).toStrictEqual([
        {
          landkode: 'URY',
          arbeidetUtenlands: false,
          fom: '2018-01-01',
          tom: '2018-01-28',
        },
      ])
    })
  })

  describe('generatePensjonsavtalerRequestBody', () => {
    const requestBody = {
      aarligInntektFoerUttakBeloep: '500 000',
      ufoeregrad: 0,
      afp: 'vet_ikke' as AfpRadio,
      epsHarPensjon: false,
      epsHarInntektOver2G: false,
      heltUttak: { uttaksalder: { aar: 67, maaneder: 0 } },
    }
    it('returnerer riktig requestBody når maaneder er 0 og sivilstand undefined', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: false,
        epsHarPensjon: false,
        epsHarInntektOver2G: false,
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
    it('returnerer riktig harEps', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
        })?.epsHarPensjon
      ).toBeFalsy()
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
          epsHarPensjon: true,
        })?.epsHarPensjon
      ).toBeTruthy()
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
          epsHarInntektOver2G: true,
        })?.epsHarInntektOver2G
      ).toBeTruthy()
    })
    it('returnerer riktig requestBody når brukeren har uføretrygd og valgt afp privat', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
          ufoeregrad: 50,
          afp: 'ja_privat',
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: false,
        epsHarPensjon: false,
        epsHarInntektOver2G: false,
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
          ...requestBody,
          afp: 'ja_privat',
          sivilstand: 'GIFT',
          heltUttak: {
            uttaksalder: { aar: 62, maaneder: 4 },
            aarligInntektVsaPensjon: {
              beloep: '99 000',
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: true,
        epsHarPensjon: false,
        epsHarInntektOver2G: false,
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
    it('returnerer riktig requestBody med gradert periode', () => {
      expect(
        generatePensjonsavtalerRequestBody({
          ...requestBody,
          afp: 'ja_privat',
          sivilstand: 'GIFT',
          heltUttak: {
            uttaksalder: { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon: {
              beloep: '99 000',
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          },
          gradertUttak: {
            uttaksalder: { aar: 62, maaneder: 4 },
            grad: 20,
            aarligInntektVsaPensjonBeloep: '123 000',
          },
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        harAfp: true,
        epsHarPensjon: false,
        epsHarInntektOver2G: false,
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

  describe('generateOffentligTpRequestBody', () => {
    const requestBody = {
      afp: 'vet_ikke' as AfpRadio,
      foedselsdato: '1963-04-30',
      aarligInntektFoerUttakBeloep: '500 000',
      heltUttak: { uttaksalder: { aar: 67, maaneder: 0 } },
      utenlandsperioder: [],
      epsHarPensjon: null,
      epsHarInntektOver2G: null,
    }

    it('returnerer undefined når fodselsdato eller heltUttak ikke er oppgitt', () => {
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          foedselsdato: null,
        })
      ).toEqual(undefined)
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          heltUttak: undefined,
          utenlandsperioder: [],
        })
      ).toEqual(undefined)
    })

    it('returnerer riktig harEps', () => {
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
        })?.epsHarInntektOver2G
      ).toBeFalsy()
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          epsHarInntektOver2G: true,
        })?.epsHarInntektOver2G
      ).toBeTruthy()
    })

    it('returnerer riktig requestBody når brukeren har uføretrygd og valgt afp', () => {
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          afp: 'ja_privat',
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        brukerBaOmAfp: true,
        epsHarInntektOver2G: false,
        epsHarPensjon: false,
        foedselsdato: '1963-04-30',
        utenlandsperiodeListe: [],
        gradertUttak: undefined,
        heltUttak: {
          aarligInntektVsaPensjon: undefined,
          uttaksalder: {
            aar: 67,
            maaneder: 0,
          },
        },
      })
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          afp: 'ja_offentlig',
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        brukerBaOmAfp: true,
        epsHarInntektOver2G: false,
        epsHarPensjon: false,
        foedselsdato: '1963-04-30',
        utenlandsperiodeListe: [],
        gradertUttak: undefined,
        heltUttak: {
          aarligInntektVsaPensjon: undefined,
          uttaksalder: {
            aar: 67,
            maaneder: 0,
          },
        },
      })
    })

    it('returnerer riktig gradertUttak uten grad, når den er oppgitt', () => {
      const gradertUttak = generateOffentligTpRequestBody({
        ...requestBody,
        gradertUttak: {
          uttaksalder: { aar: 67, maaneder: 3 },
          grad: 20,
          aarligInntektVsaPensjonBeloep: '123 000',
        },
      })?.gradertUttak
      expect(gradertUttak?.aarligInntektVsaPensjonBeloep).toEqual(123000)
      expect(gradertUttak).not.toHaveProperty('grad')
      expect(gradertUttak?.uttaksalder.aar).toEqual(67)
      expect(gradertUttak?.uttaksalder.maaneder).toEqual(3)
    })

    it('returnerer riktig heltUttak', () => {
      const heltUttak = generateOffentligTpRequestBody({
        ...requestBody,
        heltUttak: {
          uttaksalder: { aar: 68, maaneder: 3 },
          aarligInntektVsaPensjon: {
            beloep: '99 000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        },
      })?.heltUttak

      expect(heltUttak?.uttaksalder.aar).toEqual(68)
      expect(heltUttak?.uttaksalder.maaneder).toEqual(3)
      expect(heltUttak?.aarligInntektVsaPensjon?.beloep).toEqual(99000)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.aar).toEqual(75)
      expect(heltUttak?.aarligInntektVsaPensjon?.sluttAlder.maaneder).toEqual(0)
    })

    it('returnerer riktig requestBody med utenlandsperioder', () => {
      expect(
        generateOffentligTpRequestBody({
          ...requestBody,
          afp: 'nei',
          utenlandsperioder: [
            {
              id: '1',
              landkode: 'URY',
              arbeidetUtenlands: false,
              startdato: '01.01.2018',
              sluttdato: '28.02.2018',
            },
            {
              id: '2',
              landkode: 'BEL',
              arbeidetUtenlands: true,
              startdato: '01.01.1990',
              sluttdato: '28.02.2020',
            },
          ],
        })
      ).toEqual({
        aarligInntektFoerUttakBeloep: 500000,
        brukerBaOmAfp: false,
        epsHarInntektOver2G: false,
        epsHarPensjon: false,
        foedselsdato: '1963-04-30',
        gradertUttak: undefined,
        heltUttak: {
          aarligInntektVsaPensjon: undefined,
          uttaksalder: {
            aar: 67,
            maaneder: 0,
          },
        },
        utenlandsperiodeListe: [
          {
            arbeidetUtenlands: false,
            fom: '2018-01-01',
            landkode: 'URY',
            tom: '2018-02-28',
          },
          {
            arbeidetUtenlands: true,
            fom: '1990-01-01',
            landkode: 'BEL',
            tom: '2020-02-28',
          },
        ],
      })
    })
  })
})
