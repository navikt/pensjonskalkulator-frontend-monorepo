import { describe, expect, it } from 'vitest'

import { pensjonsavtalerKategoriMapObj } from '@/utils/pensjonsavtaler'

import {
  isAlder,
  isAlderspensjonMaanedligVedEndring,
  isAlderspensjonSimulering,
  isEkskludertStatus,
  isInntekt,
  isLoependeVedtak,
  isOffentligTp,
  isOmstillingsstoenadOgGjenlevende,
  isPensjonsavtale,
  isPensjonsberegningArray,
  isPerson,
  isSomeEnumKey,
  isUnleashToggle,
  isUtbetalingsperiode,
  isVilkaarsproeving,
} from '../typeguards'

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
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeTruthy()
      expect(
        isUtbetalingsperiode(false, {
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 70, maaneder: 11 },
          aarligUtbetaling: 100000,
        })
      ).toBeTruthy()
    })
    it('returnerer false når typen er undefined eller at Utbetalingsperiode ikke inneholder alle forventet keys', () => {
      expect(isUtbetalingsperiode(true, undefined)).toBeFalsy()
      expect(isUtbetalingsperiode(true, {})).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 'abc', maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 'abc' },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 'abc',
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          aarligUtbetaling: 100000,
          grad: 'abc',
        })
      ).toBeFalsy()
    })
    it('returnerer false når Utbetalingsperiode har feil sluttAlder eller sluttMaaned', () => {
      expect(
        isUtbetalingsperiode(true, {
          startAlder: { aar: 70, maaneder: 0 },
          sluttAlder: { aar: 'abc', maaneder: 11 },
          aarligUtbetaling: 100000,
          grad: 100,
        })
      ).toBeFalsy()
      expect(
        isUtbetalingsperiode(true, {
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
    it('returnerer false når typen er undefined eller at AfpPensjonsberegning inneholder noe annet enn number', () => {
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
    const validPerson = {
      navn: 'Ola',
      sivilstand: 'GIFT',
      foedselsdato: '1963-04-30',
      pensjoneringAldre: {
        normertPensjoneringsalder: { aar: 67, maaneder: 0 },
        nedreAldersgrense: { aar: 67, maaneder: 0 },
        oevreAldersgrense: { aar: 75, maaneder: 0 },
      },
    }

    describe('valid cases', () => {
      it('returnerer true for et gyldig Person-objekt', () => {
        expect(isPerson(validPerson)).toEqual(true)
      })
    })

    describe('invalid cases', () => {
      describe('null/undefined checks', () => {
        it('returnerer false for null/undefined verdier', () => {
          expect(isPerson(undefined)).toEqual(false)
          expect(isPerson(null)).toEqual(false)
          expect(isPerson({})).toEqual(false)
        })
      })

      describe('navn validation', () => {
        it('returnerer false når navn mangler', () => {
          expect(isPerson({ ...validPerson, navn: undefined })).toEqual(false)
        })
      })

      describe('sivilstand validation', () => {
        it('returnerer false når sivilstand mangler', () => {
          expect(isPerson({ ...validPerson, sivilstand: undefined })).toEqual(
            false
          )
        })

        it('returnerer false når sivilstand har ugyldig verdi', () => {
          expect(
            isPerson({
              ...validPerson,
              sivilstand: 'LOREMIPSUM',
            })
          ).toEqual(false)
        })
      })

      describe('foedselsdato validation', () => {
        it('returnerer false når foedselsdato mangler', () => {
          expect(isPerson({ ...validPerson, foedselsdato: undefined })).toEqual(
            false
          )
        })

        it('returnerer false når foedselsdato har ugyldig format', () => {
          expect(
            isPerson({
              ...validPerson,
              foedselsdato: 'abc',
            })
          ).toEqual(false)
        })

        it('returnerer false når foedselsdato er null', () => {
          expect(
            isPerson({
              ...validPerson,
              foedselsdato: null,
            })
          ).toEqual(false)
        })
      })

      describe('pensjoneringAldre validation', () => {
        it('returnerer false når pensjoneringAldre mangler', () => {
          expect(
            isPerson({
              ...validPerson,
              pensjoneringAldre: undefined,
            })
          ).toEqual(false)
        })

        it('returnerer false når pensjoneringAldre mangler obligatoriske felt', () => {
          expect(
            isPerson({
              ...validPerson,
              pensjoneringAldre: {
                normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              },
            })
          ).toEqual(false)

          expect(
            isPerson({
              ...validPerson,
              pensjoneringAldre: {
                nedreAldersgrense: { aar: 67, maaneder: 0 },
              },
            })
          ).toEqual(false)

          expect(
            isPerson({
              ...validPerson,
              pensjoneringAldre: {
                oevreAldersgrense: { aar: 75, maaneder: 0 },
              },
            })
          ).toEqual(false)
        })

        it('returnerer false når alder-objekter mangler maaneder', () => {
          expect(
            isPerson({
              ...validPerson,
              pensjoneringAldre: {
                normertPensjoneringsalder: { aar: 67 },
                nedreAldersgrense: { aar: 67 },
                oevreAldersgrense: { aar: 75 },
              },
            })
          ).toEqual(false)
        })
      })
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
    const correctResponse: LoependeVedtak = {
      harLoependeVedtak: true,
      alderspensjon: {
        grad: 0,
        uttaksgradFom: '2020-10-02',
        fom: '2020-10-02',
        sivilstand: 'UGIFT',
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
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: {
            ...correctResponse.alderspensjon,
            sivilstand: 'SAMBOER',
          },
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
          alderspensjon: {
            ...correctResponse.alderspensjon,
            sivilstand: undefined,
          },
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: { grad: '75', sivilstand: 'UGIFT' },
        })
      ).toEqual(false)
      expect(
        isLoependeVedtak({
          ...correctResponse,
          alderspensjon: { grad: 75, fom: 123, sivilstand: 'UGIFT' },
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

  describe('isOffentligTp', () => {
    it('returnerer true når typen er riktig', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'OK',
          muligeTpLeverandoerListe: [
            'Statens pensjonskasse',
            'Kommunal Landspensjonskasse',
            'Oslo Pensjonsforsikring',
          ],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [
                {
                  startAlder: { aar: 67, maaneder: 0 },
                  sluttAlder: { aar: 69, maaneder: 11 },
                  aarligUtbetaling: 64340,
                },
                {
                  startAlder: { aar: 70, maaneder: 0 },
                  sluttAlder: { aar: 74, maaneder: 11 },
                  aarligUtbetaling: 53670,
                },
                {
                  startAlder: { aar: 75, maaneder: 0 },
                  aarligUtbetaling: 48900,
                },
              ],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeTruthy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
          muligeTpLeverandoerListe: ['Leverandør 1'],
        })
      ).toBeTruthy()
    })

    it('returnerer false når typen er undefined, null eller mangler påkrevde felter', () => {
      expect(isOffentligTp(undefined)).toBeFalsy()
      expect(isOffentligTp(null)).toBeFalsy()
      expect(isOffentligTp([])).toBeFalsy()
      expect(isOffentligTp({})).toBeFalsy()
      expect(isOffentligTp({ somethingElse: [] })).toBeFalsy()
    })

    it('returnerer false når simuleringsresultatStatus inneholder noe annet', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'RANDOM',
          muligeTpLeverandoerListe: [],
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 123,
          muligeTpLeverandoerListe: [],
        })
      ).toBeFalsy()
    })

    it('returnerer false når muligeTpLeverandoerListe inneholder noe annet', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'OK',
          muligeTpLeverandoerListe: 'string',
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'OK',
          muligeTpLeverandoerListe: [1, 2, 3],
        })
      ).toBeFalsy()
    })

    it('returnerer false når simulertTjenestepensjon er noe annet enn undefined eller object', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: null,
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: 'somethingRandom',
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: 123,
        })
      ).toBeFalsy()
    })

    it('returnerer false når simulertTjenestepensjon har feil tpLeverandoer', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: null,
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: undefined,
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 123,
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når simulertTjenestepensjon har feil tpNummer', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: null,
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: undefined,
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: 3010,
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når simulertTjenestepensjon har feil utbetalingsperioder under simulertTjenestepensjon', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: null,
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()

      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: undefined,
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: 123,
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: 'string',
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()

      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [{ tull: 'tull' }],
              betingetTjenestepensjonErInkludert: true,
            },
          },
        })
      ).toBeFalsy()
    })

    it('returnerer false når simulertTjenestepensjon har feil betingetTjenestepensjonErInkludert under simulertTjenestepensjon', () => {
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: null,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: undefined,
            },
          },
        })
      ).toBeFalsy()
      expect(
        isOffentligTp({
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
          simulertTjenestepensjon: {
            tpLeverandoer: 'Statens pensjonskasse',
            tpNummer: '3010',
            simuleringsresultat: {
              utbetalingsperioder: [],
              betingetTjenestepensjonErInkludert: 'tull',
            },
          },
        })
      ).toBeFalsy()
    })
  })

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
