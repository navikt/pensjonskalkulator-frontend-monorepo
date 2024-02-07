import { describe, expect, it } from 'vitest'

import { useFormLocalState } from '../hooks'
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
      // isFormUnderUpdate
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
      // isFormUnderUpdate
      expect(result.current[0]).toBe(false)
      // localInntektFremTilUttak
      expect(result.current[1]).toBe(300000)
      // localHeltUttak
      expect(result.current[2]).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 0 },
        aarligInntektVsaPensjon: {
          beloep: 100000,
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })
      // localGradertUttak
      expect(result.current[3]).toStrictEqual({
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: 100000,
      })
    })

    describe('Når inntekt frem til uttak endrer seg,', () => {
      it('Når inntekt frem til uttak endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const {
          setLocalInntektFremTilUttak,
          setLocalHeltUttak,
          setLocalGradertUttak,
        } = result.current[4]

        act(() => {
          setLocalInntektFremTilUttak(800000)
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localInntektFremTilUttak
        expect(result.current[1]).toBe(800000)
      })

      it('Når inntekt frem til uttak lagres på nytt med samme verdi, oppdateres IKKE isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalInntektFremTilUttak } = result.current[4]

        act(() => {
          setLocalInntektFremTilUttak(300000)
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
      })
    })

    describe('Når helt uttak endrer seg,', () => {
      it('Når uttaksalder endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { aar: 70, maaneder: 3 },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
            },
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 3 },
          aarligInntektVsaPensjon: {
            beloep: 100000,
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
      })

      it('Når beløp til aarligInntektVsaPensjon endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: 90000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: 90000,
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
      })

      it('Når sluttAlder til aarligInntektVsaPensjon endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: 100000,
              sluttAlder: { aar: 72, maaneder: 0 },
            },
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: 100000,
            sluttAlder: { aar: 72, maaneder: 0 },
          },
        })
      })

      it('Når aarligInntektVsaPensjon slettes, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: undefined,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localHeltUttak
        expect(result.current[2]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: undefined,
        })
      })

      it('Når aarligInntektVsaPensjon lagres på nytt med samme verdi, oppdateres IKKE isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
        const { setLocalHeltUttak } = result.current[4]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
            },
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
      })
    })

    describe('Når gradert uttak endrer seg,', () => {
      it('Når grad endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: 20,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 20,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: 100000,
        })
      })

      it('Når uttaksalder endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { aar: 68, maaneder: 1 },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 68, maaneder: 1 },
          aarligInntektVsaPensjonBeloep: 100000,
        })
      })

      it('Når aarligInntektVsaPensjonBeloep endrer seg, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: 50000,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: 50000,
        })
      })

      it('Når aarligInntektVsaPensjonBeloep slettes, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: undefined,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: undefined,
        })
      })

      it('Når den graderte perioden slettes, oppdateres verdien og isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })

        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)

        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak(undefined)
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(true)
        // localGradertUttak
        expect(result.current[3]).toBe(undefined)
      })

      it('Når den graderte perioden lagres på nytt med samme verdi, oppdateres IKKE isFormUnderUpdate', () => {
        const { result } = renderHook(useFormLocalState, {
          initialProps: {
            ...initialProps,
          },
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
        const { setLocalGradertUttak } = result.current[4]

        act(() => {
          setLocalGradertUttak({
            ...initialProps.gradertUttaksperiode,
          })
        })
        // isFormUnderUpdate
        expect(result.current[0]).toBe(false)
      })
    })
  })
})
