import { describe, expect, it } from 'vitest'

import {
  isInntekt,
  isPensjonsavtale,
  isPensjonsberegningArray,
  isVilkaarsproeving,
  isAlderspensjonMaanedligVedEndring,
  isAlderspensjonSimulering,
  isPerson,
  isEkskludertStatus,
  isOmstillingsstoenadOgGjenlevende,
  isLoependeVedtak,
  // isTpoMedlemskap,
  isUtbetalingsperiode,
  isUnleashToggle,
  isAlder,
  isSomeEnumKey,
} from '../typeguards'
import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

describe('Typeguards', () => {
  describe('isInntekt', () => {
    it('returnerer true når input er et Inntekt-objekt', () => {
      expect(
        isInntekt({
          beloep: 500000,
          aar: 2021,
        })
      ).toEqual(true)
    })

    it('returnerer true når input er et Inntekt-objekt med 0 verdier', () => {
      expect(
        isInntekt({
          beloep: 0,
          aar: 0,
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et Inntekt-objekt', () => {
      expect(isInntekt(undefined)).toEqual(false)
      expect(isInntekt(null)).toEqual(false)
      expect(isInntekt({})).toEqual(false)
      expect(isInntekt({ beloep: 500000 })).toEqual(false)
      expect(isInntekt({ beloep: 500000, aar: '2021' })).toEqual(false)
      expect(isInntekt({ aar: 2021 })).toEqual(false)
      expect(isInntekt({ beloep: '500000', aar: 2021 })).toEqual(false)
    })
  })

  describe('isUtbetalingsperiode', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Utbetalingsperiode ikke inneholder alle forventet keys', () => {
      expect(isUtbetalingsperiode(undefined)).toBeFalsy()
      expect(isUtbetalingsperiode({})).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 'abc', maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 'abc' },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 'abc',
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 'abc',
        })
      ).toBeFalsy()
    })
    it('returnerer false når Utbetalingsperiode har feil sluttAlder eller sluttMaaned', () => {
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          sluttAlder: { aar: 'abc', maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode({
          startAlder: { aar: 70, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 'abc' },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
    })
  })

  describe('isPensjonsavtale', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeTruthy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsavtale ikke inneholder alle forventet keys eller har feil utbetalingsperiode', () => {
      expect(isPensjonsavtale(undefined)).toBeFalsy()
      expect(isPensjonsavtale({})).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'RANDOM KATEGORI',
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          sluttAar: 70,
          utbetalingsperioder: [],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 67,
          sluttAar: 70,
          utbetalingsperioder: [
            {
              startAlder: { aar: 'abc', maaneder: 0 },
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
    })
    it('returnerer false når Pensjonsavtale har feil startAar eller startMaaned', () => {
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 'abc',
          sluttAar: 67,
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
      expect(
        isPensjonsavtale({
          produktbetegnelse: 'Storebrand',
          kategori: 'PRIVAT_TJENESTEPENSJON',
          startAar: 62,
          sluttAar: 'abc',
          utbetalingsperioder: [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 70, maaneder: 11 },
              aarligUtbetaling: 39582,
              grad: 100,
            },
          ],
        })
      ).toBeFalsy()
    })
  })

  describe('isPensjonsberegningArray', () => {
    it('returnerer true når typen er riktig', () => {
      expect(isPensjonsberegningArray([])).toBeTruthy()
      expect(
        isPensjonsberegningArray([
          {
            beloep: 2,
            alder: 3,
          },
        ])
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Pensjonsberegning inneholder noe annet enn number', () => {
      expect(isPensjonsberegningArray(undefined)).toBeFalsy()

      expect(
        isPensjonsberegningArray([
          {
            beloep: 1,
          },
        ])
      ).toBeFalsy()
      expect(
        isPensjonsberegningArray([
          {
            beloep: 1,
            alder: 'abc',
          },
        ])
      ).toBeFalsy()
    })
  })

  describe('isVilkaarsproeving', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isVilkaarsproeving({ vilkaarErOppfylt: false, alternativ: undefined })
      ).toBeTruthy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            gradertUttaksalder: {
              aar: 12,
              maaneder: 2,
            },
            uttaksgrad: 50,
            heltUttaksalder: {
              aar: 12,
              maaneder: 2,
            },
          },
        })
      ).toBeTruthy()
    })

    it('returnerer false når typen er undefined eller at vilkaarErOppfylt inneholder noe annet enn boolean', () => {
      expect(isVilkaarsproeving(undefined)).toBeFalsy()
      expect(isVilkaarsproeving(null)).toBeFalsy()
      expect(
        isVilkaarsproeving({ vilkaarErOppfylt: null, alternativ: undefined })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: undefined,
          alternativ: undefined,
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({ vilkaarErOppfylt: 'loren', alternativ: undefined })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({ vilkaarErOppfylt: 123, alternativ: undefined })
      ).toBeFalsy()
    })

    it('returnerer false når et gradertUttaksalder eller heltUttaksalder ikke er Alder', () => {
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            gradertUttaksalder: [],
          },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            gradertUttaksalder: { lorem: '123' },
          },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            gradertUttaksalder: {
              aar: 2,
              maaneder: 'string',
            },
          },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            heltUttaksalder: [],
          },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            heltUttaksalder: { lorem: '123' },
          },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: false,
          alternativ: {
            heltUttaksalder: {
              aar: 2,
              maaneder: 'string',
            },
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når et uttaksgrad er noe annet enn number', () => {
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: null,
          alternativ: { uttaksgrad: null },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: null,
          alternativ: { uttaksgrad: true },
        })
      ).toBeFalsy()
      expect(
        isVilkaarsproeving({
          vilkaarErOppfylt: null,
          alternativ: { uttaksgrad: 'lorem' },
        })
      ).toBeFalsy()
    })
  })

  describe('isAlderspensjonMaanedligVedEndring', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isAlderspensjonMaanedligVedEndring({
          heltUttakMaanedligBeloep: 100000,
          gradertUttakMaanedligBeloep: 100000,
        })
      ).toBeTruthy()
      expect(
        isAlderspensjonMaanedligVedEndring({ heltUttakMaanedligBeloep: 100000 })
      ).toBeTruthy()
    })

    it('returnerer false når typen er null eller at alderspensjonMaanedligVedEndring inneholder noe annet', () => {
      expect(isAlderspensjonMaanedligVedEndring(null)).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({
          heltUttakMaanedligBeloep: undefined,
        })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({ heltUttakMaanedligBeloep: 'abc' })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({ heltUttakMaanedligBeloep: [] })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({ heltUttakMaanedligBeloep: {} })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({
          heltUttakMaanedligBeloep: 100000,
          gradertUttakMaanedligBeloep: 'abc',
        })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({
          heltUttakMaanedligBeloep: 100000,
          gradertUttakMaanedligBeloep: [],
        })
      ).toBeFalsy()
      expect(
        isAlderspensjonMaanedligVedEndring({
          heltUttakMaanedligBeloep: 100000,
          gradertUttakMaanedligBeloep: {},
        })
      ).toBeFalsy()
    })
  })

  describe('isAlderspensjonSimulering', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: undefined,
          },
        })
      ).toBeTruthy()
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [
            {
              alder: 76,
              beloep: 172476,
            },
            {
              alder: 77,
              beloep: 172476,
            },
          ],
          afpPrivat: [
            {
              alder: 76,
              beloep: 80000,
            },
            {
              alder: 77,
              beloep: 80000,
            },
          ],
          vilkaarsproeving: {
            vilkaarErOppfylt: true,
          },
          harForLiteTrygdetid: false,
        })
      ).toBeTruthy()
    })

    it('returnerer false når alderspensjon eller afpPrivat ikke er gyldig PensjonsberegningArray', () => {
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [
            {
              beloep: 1,
            },
          ],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: undefined,
          },
        })
      ).toBeFalsy()
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [
            {
              beloep: 1,
              alder: 'abc',
            },
          ],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: undefined,
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når vilkaarsproeving ikke er gyldig', () => {
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: 'lorem',
            alternativ: undefined,
          },
        })
      ).toBeFalsy()
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: {
              gradertUttaksalder: {
                aar: '12',
                maaneder: 2,
              },
              uttaksgrad: null,
            },
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når alderspensjonMaanedligVedEndring ikke er gyldig', () => {
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: undefined,
          },
          alderspensjonMaanedligVedEndring: { lorem: 'ipsum' },
        })
      ).toBeFalsy()
    })

    it('returnerer false når harForLiteTrygdetid ikke er gyldig', () => {
      expect(
        isAlderspensjonSimulering({
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: true,
            alternativ: undefined,
          },
          harForLiteTrygdetid: null,
        })
      ).toBeFalsy()
    })
  })

  describe('isPerson', () => {
    it('returnerer true når input er et Person-objekt', () => {
      expect(
        isPerson({
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et Person-objekt', () => {
      expect(isPerson(undefined)).toEqual(false)
      expect(isPerson(null)).toEqual(false)
      expect(isPerson({})).toEqual(false)
      expect(isPerson({ navn: 'Ola', sivilstand: 'GIFT' })).toEqual(false)
      expect(
        isPerson({
          navn: 'Ola',
          sivilstand: 'LOREMIPSUM',
          foedselsdato: null,
        })
      ).toEqual(false)
      expect(
        isPerson({
          navn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: 'abc',
        })
      ).toEqual(false)
      expect(isPerson({ navn: 'Ola', foedselsdato: '1963-04-30' })).toEqual(
        false
      )
      expect(isPerson({ sivilstand: 'GIFT' })).toEqual(false)
    })
  })

  describe('isAlder', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isAlder({
          aar: 12,
          maaneder: 2,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Tidligst Mulig Uttak inneholder noe annet enn number', () => {
      expect(isAlder(undefined)).toBeFalsy()
      expect(isAlder([])).toBeFalsy()
      expect(isAlder({})).toBeFalsy()
      expect(
        isAlder({
          aar: 'string',
          maaneder: 2,
        })
      ).toBeFalsy()
    })
  })

  describe('isEkskludertStatus', () => {
    it('returnerer true når input er et EkskludertStatus-objekt', () => {
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et EkskludertStatus-objekt', () => {
      expect(isEkskludertStatus(undefined)).toEqual(false)
      expect(isEkskludertStatus(null)).toEqual(false)
      expect(isEkskludertStatus({})).toEqual(false)
      expect(isEkskludertStatus({ ekskludert: true })).toEqual(false)
      expect(isEkskludertStatus({ aarsak: 'ER_APOTEKER' })).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: null,
          aarsak: 'ER_APOTEKER',
        })
      ).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: null,
        })
      ).toEqual(false)
      expect(
        isEkskludertStatus({
          ekskludert: true,
          aarsak: 'abc',
        })
      ).toEqual(false)
    })
  })

  describe('isOmstillingsstoenadOgGjenlevende', () => {
    it('returnerer true når input er et OmstillingsstoenadOgGjenlevende-objekt', () => {
      expect(
        isOmstillingsstoenadOgGjenlevende({
          harLoependeSak: true,
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et OmstillingsstoenadOgGjenlevende-objekt', () => {
      expect(isOmstillingsstoenadOgGjenlevende(undefined)).toEqual(false)
      expect(isOmstillingsstoenadOgGjenlevende(null)).toEqual(false)
      expect(isOmstillingsstoenadOgGjenlevende({})).toEqual(false)
      expect(
        isOmstillingsstoenadOgGjenlevende({ somethingRandom: true })
      ).toEqual(false)
      expect(
        isOmstillingsstoenadOgGjenlevende({ harLoependeSak: 'lorem' })
      ).toEqual(false)
      expect(
        isOmstillingsstoenadOgGjenlevende({
          harLoependeSak: null,
        })
      ).toEqual(false)
    })
  })

  describe('isLoependeVedtak', () => {
    const correctResponse = {
      alderspensjon: {
        grad: 0,
        fom: '2020-10-02',
      },
      ufoeretrygd: {
        grad: 75,
      },
      afpPrivat: {
        fom: '2020-10-02',
      },
      afpOffentlig: {
        fom: '2020-10-02',
      },
      harFremtidigLoependeVedtak: false,
    }
    it('returnerer true når input er et LoependeVedtak-objekt', () => {
      expect(
        isLoependeVedtak({
          ...correctResponse,
        })
      ).toEqual(true)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: null,
        })
      ).toEqual(true)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpPrivat: null,
        })
      ).toEqual(true)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpOffentlig: null,
        })
      ).toEqual(true)
    })

    it('returnerer false når input ikke er et LoependeVedtak-objekt', () => {
      expect(isLoependeVedtak(undefined)).toEqual(false)
      expect(isLoependeVedtak(null)).toEqual(false)
      expect(isLoependeVedtak({})).toEqual(false)
      expect(isLoependeVedtak({ random: 75 })).toEqual(false)

      expect(
        isLoependeVedtak({
          ...correctResponse,
          ufoeretrygd: null,
        })
      ).toEqual(false)

      expect(
        isLoependeVedtak({
          ...correctResponse,
          ufoeretrygd: {},
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: {},
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpPrivat: {},
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpOffentlig: {},
        })
      ).toEqual(false)

      expect(
        isLoependeVedtak({
          ...correctResponse,
          ufoeretrygd: { grad: '75' },
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: { grad: '75' },
        })
      ).toEqual(false)

      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: { grad: 75, fom: 123 },
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpPrivat: { fom: 123 },
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          afpOffentlig: { fom: 123 },
        })
      ).toEqual(false)
    })
  })

  // describe('isTpoMedlemskap', () => {
  //   it('returnerer true når typen er riktig', () => {
  //     expect(
  //       isTpoMedlemskap({
  //         muligeTpLeverandoerListe: [],
  //       })
  //     ).toBeTruthy()
  //     expect(
  //       isTpoMedlemskap({
  //         muligeTpLeverandoerListe: ['lorem ipsum'],
  //       })
  //     ).toBeTruthy()
  //   })
  //   it('returnerer false når typen er undefined eller at muligeTpLeverandoerListe inneholder noe annet', () => {
  //     expect(isTpoMedlemskap(undefined)).toBeFalsy()
  //     expect(isTpoMedlemskap([])).toBeFalsy()
  //     expect(isTpoMedlemskap({})).toBeFalsy()
  //     expect(isTpoMedlemskap({ somethingElse: [] })).toBeFalsy()
  //     expect(
  //       isTpoMedlemskap({
  //         muligeTpLeverandoerListe: 'string',
  //       })
  //     ).toBeFalsy()
  //   })
  // })

  describe('isUnleashToggle', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isUnleashToggle({
          enabled: true,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at UnleashToggle inneholder noe annet', () => {
      expect(isUnleashToggle(undefined)).toBeFalsy()
      expect(isUnleashToggle([])).toBeFalsy()
      expect(isUnleashToggle({})).toBeFalsy()
      expect(
        isUnleashToggle({
          enabled: 'string',
        })
      ).toBeFalsy()
    })
  })

  describe('isSomeEnumKey', () => {
    it('returnerer false når typen ikke er riktig', () => {
      expect(isSomeEnumKey(pensjonsavtalerKategoriMapObj)('RANDOM')).toBeFalsy()
    })
    it('returnerer true når typen er riktig', () => {
      expect(
        isSomeEnumKey(pensjonsavtalerKategoriMapObj)('INDIVIDUELL_ORDNING')
      ).toBeTruthy()
    })
  })
})
