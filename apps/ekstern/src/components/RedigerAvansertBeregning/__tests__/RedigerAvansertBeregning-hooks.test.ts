import { describe, expect, it } from 'vitest'

import {
  useFormLocalState,
  useTidligstMuligUttakRequestBodyState,
} from '../hooks'
import * as apiUtils from '@/state/api/utils'
import { act, renderHook } from '@/test-utils'

describe('RedigerAvansertBeregning-hooks', () => {
  describe('useFormLocalState', () => {
    const initialProps = {
      aarligInntektFoerUttakBeloepFraBrukerInput: 300000,
      uttaksalder: { aar: 70, maaneder: 0 },
      aarligInntektVsaHelPensjon: {
        beloep: 100000,
        sluttAlder: { aar: 75, maaneder: 0 },
      },
      gradertUttaksperiode: {
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: 100000,
      },
    }
    it('Når ingen verdi er lagret i Redux store, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormLocalState, {
        initialProps: {
          aarligInntektFoerUttakBeloepFraBrukerInput: null,
          uttaksalder: null,
          aarligInntektVsaHelPensjon: undefined,
          gradertUttaksperiode: null,
        },
      })
      // hasUnsavedChanges
      expect(result.current[0]).toBe(null)
      // localInntektFremTilUttak
      expect(result.current[1]).toBe(null)
      // localHeltUttak
      expect(result.current[2]).toStrictEqual({
        aarligInntektVsaPensjon: undefined,
        uttaksalder: undefined,
      })
      // localGradertUttak
      expect(result.current[3]).toBe(undefined)
    })

    it('Når Redux store inneholder verdier fra før av, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormLocalState, {
        initialProps: {
          ...initialProps,
        },
      })
      // hasUnsavedChanges
      expect(result.current[0]).toBe(false)
      // localInntektFremTilUttak
      expect(result.current[1]).toBe(300000)
      // localHeltUttak
      expect(result.current[2]).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 0 },
        aarligInntektVsaPensjon: {
          beloep: '100000',
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })
      // localGradertUttak
      expect(result.current[3]).toStrictEqual({
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: '100000',
      })
    })

    describe('Når inntekt frem til uttak endrer seg,', () => {
      it('Når inntekt frem til uttak endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalInntektFremTilUttak } = result.current[4]

        act(() => {
          setLocalInntektFremTilUttak(800000)
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localInntektFremTilUttak
        expect(result.current[1]).toBe(800000)
      })

      it('Når aarligInntektFoerUttakBeloepFraBrukerInput er null og inntekt frem til uttak endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
            aarligInntektFoerUttakBeloepFraBrukerInput: null,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalInntektFremTilUttak } = result.current[4]

        act(() => {
          setLocalInntektFremTilUttak(800000)
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localInntektFremTilUttak
        expect(result.current[1]).toBe(800000)
      })

      it('Når inntekt frem til uttak lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalInntektFremTilUttak } = result.current[4]

        act(() => {
          setLocalInntektFremTilUttak(300000)
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
      })
    })

    describe('Når helt uttak endrer seg,', () => {
      it('Når uttaksalder endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { aar: 70, maaneder: 3 },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
              beloep: initialProps.aarligInntektVsaHelPensjon.beloep.toString(),
            },
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 3 },
          aarligInntektVsaPensjon: {
            beloep: '100000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
      })

      it('Når beløp til aarligInntektVsaPensjon endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: '90000',
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: '90000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
      })

      it('Når sluttAlder til aarligInntektVsaPensjon endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: '100000',
              sluttAlder: { aar: 72, maaneder: 0 },
            },
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: '100000',
            sluttAlder: { aar: 72, maaneder: 0 },
          },
        })
      })

      it('Når aarligInntektVsaPensjon slettes, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: undefined,
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: undefined,
        })
      })

      it('Når aarligInntektVsaPensjon lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
              beloep: initialProps.aarligInntektVsaHelPensjon.beloep.toString(),
            },
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
      })
    })

    describe('Når gradert uttak endrer seg,', () => {
      it('Når grad endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: 20,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 20,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '100000',
        })
      })

      it('Når uttaksalder endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { aar: 68, maaneder: 1 },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 68, maaneder: 1 },
          aarligInntektVsaPensjonBeloep: '100000',
        })
      })

      it('Når aarligInntektVsaPensjonBeloep endrer seg, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: '50000',
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '50000',
        })
      })

      it('Når aarligInntektVsaPensjonBeloep slettes, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: undefined,
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: undefined,
        })
      })

      it('Når den graderte perioden slettes, oppdateres verdien og hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak(undefined)
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toBe(undefined)
      })

      it('Når den graderte perioden lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            ...initialProps.gradertUttaksperiode,
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // hasUnsavedChanges
        expect(result.current[0]).toBe(false)
      })
    })
  })

  describe('useTidligstMuligUttakRequestBodyState', () => {
    const initialProps = {
      afp: 'ja_offentlig' as AfpRadio,
      sivilstand: 'GIFT' as Sivilstand,
      harSamboer: true,
      aarligInntektFoerUttakBeloep: 500000,
      localInntektFremTilUttak: null,
      localGradertUttak: undefined,
      localHeltUttak: undefined,
    }

    it('Når ingen verdi er lagret i Redux store, returnerer riktig initial values', () => {
      const { result } = renderHook(useTidligstMuligUttakRequestBodyState, {
        initialProps: {
          afp: null,
          sivilstand: undefined,
          harSamboer: null,
          aarligInntektFoerUttakBeloep: undefined,
          localInntektFremTilUttak: null,
          localGradertUttak: undefined,
          localHeltUttak: undefined,
        },
      })
      // tidligstMuligHeltUttakRequestBody
      expect(result.current[0]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 0,
        aarligInntektVsaPensjon: undefined,
        harEps: undefined,
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'UGIFT',
      })
      // tidligstMuligGradertUttakRequestBody
      expect(result.current[1]).toEqual(undefined)
    })

    it('Når verdier fra stegvisningen er lagret Redux store, returnerer riktig initial values', () => {
      const generateTidligstMuligHeltUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligHeltUttakRequestBody'
      )
      const generateTidligstMuligGradertUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligGradertUttakRequestBody'
      )

      const { result } = renderHook(useTidligstMuligUttakRequestBodyState, {
        initialProps: {
          ...initialProps,
        },
      })

      expect(
        generateTidligstMuligHeltUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 500000,
        afp: 'ja_offentlig',
        harSamboer: true,
        sivilstand: 'GIFT',
      })

      expect(
        generateTidligstMuligGradertUttakRequestBodyMock
      ).not.toHaveBeenCalled()

      // tidligstMuligHeltUttakRequestBody
      expect(result.current[0]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 500000,
        aarligInntektVsaPensjon: undefined,
        harEps: true,
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })
    })

    it('Når verdier fra stegvisningen er lagret Redux store og at InntektFremTilUttak er overskrevet, returnerer riktig initial values', () => {
      const generateTidligstMuligHeltUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligHeltUttakRequestBody'
      )
      const generateTidligstMuligGradertUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligGradertUttakRequestBody'
      )

      const { result } = renderHook(useTidligstMuligUttakRequestBodyState, {
        initialProps: {
          ...initialProps,
          localInntektFremTilUttak: 300000,
        },
      })

      expect(
        generateTidligstMuligHeltUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 300000,
        afp: 'ja_offentlig',
        harSamboer: true,
        sivilstand: 'GIFT',
      })

      expect(
        generateTidligstMuligGradertUttakRequestBodyMock
      ).not.toHaveBeenCalled()

      // tidligstMuligHeltUttakRequestBody
      expect(result.current[0]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 300000,
        aarligInntektVsaPensjon: undefined,
        harEps: true,
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })
    })

    it('Når verdier fra stegvisningen er lagret Redux store og at localGradertUttak og localHeltUttak er oppgitt, returnerer riktig initial values', () => {
      const generateTidligstMuligHeltUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligHeltUttakRequestBody'
      )
      const generateTidligstMuligGradertUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligGradertUttakRequestBody'
      )

      const { result } = renderHook(useTidligstMuligUttakRequestBodyState, {
        initialProps: {
          ...initialProps,
          localInntektFremTilUttak: 300000,
          localGradertUttak: {
            grad: 40,
            uttaksalder: {
              aar: 67,
              maaneder: 0,
            },
            aarligInntektVsaPensjonBeloep: '100000',
          },
          localHeltUttak: {
            uttaksalder: {
              aar: 70,
              maaneder: 0,
            },
            aarligInntektVsaPensjon: {
              beloep: '50000',
              sluttAlder: { aar: 75, maaneder: 6 },
            },
          },
        },
      })

      expect(
        generateTidligstMuligHeltUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 300000,
        afp: 'ja_offentlig',
        harSamboer: true,
        sivilstand: 'GIFT',
      })

      expect(
        generateTidligstMuligGradertUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 300000,
        afp: 'ja_offentlig',
        gradertUttak: {
          aarligInntektVsaPensjonBeloep: 100000,
          grad: 40,
        },
        harSamboer: true,
        heltUttak: {
          aarligInntektVsaPensjon: {
            beloep: 50000,
            sluttAlder: {
              aar: 75,
              maaneder: 6,
            },
          },
          uttaksalder: {
            aar: 70,
            maaneder: 0,
          },
        },
        sivilstand: 'GIFT',
      })

      // tidligstMuligHeltUttakRequestBody
      expect(result.current[0]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 300000,
        aarligInntektVsaPensjon: undefined,
        harEps: true,
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })

      // tidligstMuligGradertUttakRequestBody
      expect(result.current[1]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 300000,
        gradertUttak: {
          aarligInntektVsaPensjonBeloep: 100000,
          grad: 40,
        },
        harEps: true,
        heltUttak: {
          aarligInntektVsaPensjon: {
            beloep: 50000,
            sluttAlder: {
              aar: 75,
              maaneder: 6,
            },
          },
          uttaksalder: {
            aar: 70,
            maaneder: 0,
          },
        },
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })
    })

    it('Når verdier fra stegvisningen er lagret Redux store og at localGradertUttak er oppgitt men ikke localHeltUttak, returnerer riktig initial values med 67 år som default', () => {
      const generateTidligstMuligHeltUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligHeltUttakRequestBody'
      )
      const generateTidligstMuligGradertUttakRequestBodyMock = vi.spyOn(
        apiUtils,
        'generateTidligstMuligGradertUttakRequestBody'
      )

      const { result } = renderHook(useTidligstMuligUttakRequestBodyState, {
        initialProps: {
          ...initialProps,
          localInntektFremTilUttak: 300000,
          localGradertUttak: {
            grad: 40,
            uttaksalder: {
              aar: 67,
              maaneder: 0,
            },
            aarligInntektVsaPensjonBeloep: '100000',
          },
        },
      })

      expect(
        generateTidligstMuligHeltUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 300000,
        afp: 'ja_offentlig',
        harSamboer: true,
        sivilstand: 'GIFT',
      })

      expect(
        generateTidligstMuligGradertUttakRequestBodyMock
      ).toHaveBeenCalledWith({
        aarligInntektFoerUttakBeloep: 300000,
        afp: 'ja_offentlig',
        gradertUttak: {
          aarligInntektVsaPensjonBeloep: 100000,
          grad: 40,
        },
        harSamboer: true,
        heltUttak: {
          aarligInntektVsaPensjon: undefined,
          uttaksalder: {
            aar: 67,
            maaneder: 0,
          },
        },
        sivilstand: 'GIFT',
      })

      // tidligstMuligHeltUttakRequestBody
      expect(result.current[0]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 300000,
        aarligInntektVsaPensjon: undefined,
        harEps: true,
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })

      // tidligstMuligGradertUttakRequestBody
      expect(result.current[1]).toStrictEqual({
        aarligInntektFoerUttakBeloep: 300000,
        gradertUttak: {
          aarligInntektVsaPensjonBeloep: 100000,
          grad: 40,
        },
        harEps: true,
        heltUttak: {
          aarligInntektVsaPensjon: undefined,
          uttaksalder: {
            aar: 67,
            maaneder: 0,
          },
        },
        simuleringstype: 'ALDERSPENSJON',
        sivilstand: 'GIFT',
      })
    })
  })
})
