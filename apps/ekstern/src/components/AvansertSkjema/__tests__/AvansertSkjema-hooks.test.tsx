import React from 'react'
import * as useIntlUtils from 'react-intl'
import { describe, expect, it } from 'vitest'

import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { act, render, renderHook, screen } from '@/test-utils'

import { useFormLocalState, useFormValidationErrors } from '../hooks'

describe('AvansertSkjema-hooks', () => {
  describe('useFormLocalState', () => {
    const defaultContextValues = {
      avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
      setAvansertSkjemaModus: vi.fn(),
    }
    const initialProps = {
      beregningsvalg: null,
      isEndring: false,
      ufoeregrad: 0,
      aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: '250 000',
      aarligInntektFoerUttakBeloepFraBrukerInput: '300 000',
      uttaksalder: { aar: 70, maaneder: 0 },
      aarligInntektVsaHelPensjon: {
        beloep: '100 000',
        sluttAlder: { aar: 75, maaneder: 0 },
      },
      gradertUttaksperiode: {
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: '100 000',
      },
      normertPensjonsalder: { aar: 67, maaneder: 0 },
      afpInntektMaanedFoerUttak: null,
      stillingsprosentVsaGradertPensjon: null,
      stillingsprosentVsaHelPensjon: null,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const [
        harAvansertSkjemaUnsavedChanges,
        setHarAvansertSkjemaUnsavedChanges,
      ] = React.useState<boolean>(false)

      return (
        <BeregningContext.Provider
          value={{
            ...defaultContextValues,
            harAvansertSkjemaUnsavedChanges,
            setHarAvansertSkjemaUnsavedChanges:
              setHarAvansertSkjemaUnsavedChanges,
          }}
        >
          <p data-testid="harAvansertSkjemaUnsavedChanges">
            {harAvansertSkjemaUnsavedChanges ? 'TRUE' : 'FALSE'}
          </p>
          {children}
        </BeregningContext.Provider>
      )
    }

    it('Når ingen verdi er lagret i Redux store, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          isEndring: false,
          ufoeregrad: 0,
          aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: undefined,
          aarligInntektFoerUttakBeloepFraBrukerInput: null,
          uttaksalder: null,
          aarligInntektVsaHelPensjon: undefined,
          gradertUttaksperiode: null,
          normertPensjonsalder: { aar: 67, maaneder: 0 },
          afpInntektMaanedFoerUttak: null,
          beregningsvalg: null,
          stillingsprosentVsaGradertPensjon: null,
          stillingsprosentVsaHelPensjon: null,
        },
      })

      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent('FALSE')
      // localInntektFremTilUttak
      expect(result.current.localInntektFremTilUttak).toBe(null)
      // localHeltUttak
      expect(result.current.localHeltUttak).toStrictEqual({
        aarligInntektVsaPensjon: undefined,
        uttaksalder: undefined,
      })
      // localHarInntektVsaHeltUttakRadio
      expect(result.current.localHarInntektVsaHeltUttakRadio).toBe(null)
      // localGradertUttak
      expect(result.current.localGradertUttak).toStrictEqual({
        aarligInntektVsaPensjonBeloep: undefined,
        grad: undefined,
        uttaksalder: undefined,
      })
      // localHarInntektVsaGradertUttakRadio
      expect(result.current.localHarInntektVsaGradertUttakRadio).toBe(null)
      // minAlderInntektSluttAlder
      expect(result.current.minAlderInntektSluttAlder).toBe(undefined)
      // muligeUttaksgrad
      expect(result.current.muligeUttaksgrad).toHaveLength(6)
    })

    it('Når Redux store inneholder alle verdier fra før av, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent('FALSE')
      // localInntektFremTilUttak
      expect(result.current.localInntektFremTilUttak).toBe('300 000')
      // localHeltUttak
      expect(result.current.localHeltUttak).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 0 },
        aarligInntektVsaPensjon: {
          beloep: '100 000',
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })
      // localHarInntektVsaHeltUttakRadio
      expect(result.current.localHarInntektVsaHeltUttakRadio).toBe(true)
      // localGradertUttak
      expect(result.current.localGradertUttak).toStrictEqual({
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: '100 000',
      })
      // localHarInntektVsaGradertUttakRadio
      expect(result.current.localHarInntektVsaGradertUttakRadio).toBe(true)
      // minAlderInntektSluttAlder
      expect(result.current.minAlderInntektSluttAlder).toStrictEqual({
        aar: 70,
        maaneder: 1,
      })
      // muligeUttaksgrad
      expect(result.current.muligeUttaksgrad).toHaveLength(6)
    })

    it('Når Redux store inneholder alle verdier utenom inntekt vsa. pensjon fra før av, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          aarligInntektVsaHelPensjon: undefined,
          gradertUttaksperiode: {
            ...initialProps.gradertUttaksperiode,
            aarligInntektVsaPensjonBeloep: undefined,
          },
        },
      })
      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent('FALSE')
      // localInntektFremTilUttak
      expect(result.current.localInntektFremTilUttak).toBe('300 000')
      // localHeltUttak
      expect(result.current.localHeltUttak).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 0 },
        aarligInntektVsaPensjon: undefined,
      })
      // localHarInntektVsaHeltUttakRadio
      expect(result.current.localHarInntektVsaHeltUttakRadio).toBe(false)
      // localGradertUttak
      expect(result.current.localGradertUttak).toStrictEqual({
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: undefined,
      })
      // localHarInntektVsaGradertUttakRadio
      expect(result.current.localHarInntektVsaGradertUttakRadio).toBe(false)
      // minAlderInntektSluttAlder
      expect(result.current.minAlderInntektSluttAlder).toStrictEqual({
        aar: 70,
        maaneder: 1,
      })
      // muligeUttaksgrad
      expect(result.current.muligeUttaksgrad).toHaveLength(6)
    })

    describe('Når brukeren har vedtak om alderspensjon,', () => {
      it('er muligeUttaksgrad riktig, med mulighet for 0 % periode', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            isEndring: true,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        // muligeUttaksgrad
        expect(result.current.muligeUttaksgrad).toHaveLength(7)
        expect(result.current.muligeUttaksgrad).toStrictEqual([
          0, 20, 40, 50, 60, 80, 100,
        ])
      })
    })

    it('Når beregningsvalg endres, oppdateres verdien og hasUnsavedChanges', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })

      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent('FALSE')

      const {
        handlers: { setLocalBeregningsTypeRadio },
      } = result.current

      act(() => {
        setLocalBeregningsTypeRadio('uten_afp')
      })
      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent('TRUE')
      // localInntektFremTilUttak
      expect(result.current.localBeregningsTypeRadio).toBe('uten_afp')
    })

    describe('Når inntekt frem til uttak endrer seg,', () => {
      it('oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalInntektFremTilUttak },
        } = result.current

        act(() => {
          setLocalInntektFremTilUttak('800000')
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localInntektFremTilUttak
        expect(result.current.localInntektFremTilUttak).toBe('800000')
      })

      it('Når aarligInntektFoerUttakBeloepFraBrukerInput er null og inntekt frem til uttak endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            aarligInntektFoerUttakBeloepFraBrukerInput: null,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalInntektFremTilUttak },
        } = result.current

        act(() => {
          setLocalInntektFremTilUttak('800000')
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localInntektFremTilUttak
        expect(result.current.localInntektFremTilUttak).toBe('800000')
      })

      it('Når inntekt frem til uttak lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalInntektFremTilUttak },
        } = result.current

        act(() => {
          setLocalInntektFremTilUttak('300 000')
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
      })
    })

    describe('Når helt uttak endrer seg,', () => {
      it('Når uttaksalder endrer seg, oppdateres verdien, minAlderInntektSluttAlder og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalHeltUttak },
        } = result.current

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { aar: 69, maaneder: 11 },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
              beloep: initialProps.aarligInntektVsaHelPensjon.beloep,
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localHeltUttak (obs, sluttAlder nullstilles i handler)
        expect(result.current.localHeltUttak).toStrictEqual({
          uttaksalder: { aar: 69, maaneder: 11 },
          aarligInntektVsaPensjon: {
            beloep: '100 000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
        // localHarInntektVsaHeltUttakRadio
        expect(result.current.localHarInntektVsaHeltUttakRadio).toBe(true)
        // minAlderInntektSluttAlder
        expect(result.current.minAlderInntektSluttAlder).toStrictEqual({
          aar: 70,
          maaneder: 0,
        })
        // muligeUttaksgrad
        expect(result.current.muligeUttaksgrad).toHaveLength(6)
      })

      it('Når beløp til aarligInntektVsaPensjon endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalHeltUttak },
        } = result.current

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: '90000',
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localHeltUttak
        expect(result.current.localHeltUttak).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: '90000',
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
      })

      it('Når sluttAlder til aarligInntektVsaPensjon endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalHeltUttak },
        } = result.current

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: '100000',
              sluttAlder: { aar: 72, maaneder: 0 },
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localHeltUttak
        expect(result.current.localHeltUttak).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: '100000',
            sluttAlder: { aar: 72, maaneder: 0 },
          },
        })
      })

      it('Når aarligInntektVsaPensjon slettes, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalHeltUttak },
        } = result.current

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: undefined,
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localHeltUttak
        expect(result.current.localHeltUttak).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: undefined,
        })
      })

      it('Når aarligInntektVsaPensjon lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalHeltUttak },
        } = result.current

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
              beloep: initialProps.aarligInntektVsaHelPensjon.beloep,
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
      })
    })

    describe('Når gradert uttak endrer seg,', () => {
      it('Når grad endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            grad: 20,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localGradertUttak
        expect(result.current.localGradertUttak).toStrictEqual({
          grad: 20,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '100 000',
        })
        // muligeUttaksgrad
        expect(result.current.muligeUttaksgrad).toHaveLength(6)
      })

      it('Når uttaksalder endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { aar: 68, maaneder: 1 },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localGradertUttak
        expect(result.current.localGradertUttak).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 68, maaneder: 1 },
          aarligInntektVsaPensjonBeloep: '100 000',
        })
      })

      it('Når uttaksalder for helt uttak er lavere enn den nye graderte uttaksalderen, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { aar: 70, maaneder: 6 },
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localHeltUttak
        expect(result.current.localHeltUttak).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: '100 000',
            sluttAlder: {
              aar: 75,
              maaneder: 0,
            },
          },
        })
        // localGradertUttak
        expect(result.current.localGradertUttak).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 70, maaneder: 6 },
          aarligInntektVsaPensjonBeloep: '100 000',
        })
      })

      it('Når aarligInntektVsaPensjonBeloep endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: '50000',
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localGradertUttak
        expect(result.current.localGradertUttak).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '50000',
        })
      })

      it('Når aarligInntektVsaPensjonBeloep slettes, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            grad: initialProps.gradertUttaksperiode.grad,
            uttaksalder: { ...initialProps.gradertUttaksperiode.uttaksalder },
            aarligInntektVsaPensjonBeloep: undefined,
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localGradertUttak
        expect(result.current.localGradertUttak).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: undefined,
        })
      })

      it('Når den graderte perioden slettes, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')

        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak(undefined)
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('TRUE')
        // localGradertUttak
        expect(result.current.localGradertUttak).toBe(undefined)
      })

      it('Når den graderte perioden lagres på nytt med samme verdi, oppdateres IKKE hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
        const {
          handlers: { setLocalGradertUttak },
        } = result.current

        act(() => {
          setLocalGradertUttak({
            ...initialProps.gradertUttaksperiode,
            aarligInntektVsaPensjonBeloep:
              initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent('FALSE')
      })

      describe('Gitt at brukeren har gradert uføretrygd,', () => {
        it('Når uttaksalder endres til en alder før normert pensjonsalder, avgrenses muligeUttaksgrad', async () => {
          const { result } = renderHook(useFormLocalState, {
            wrapper,
            initialProps: {
              ...initialProps,
              gradertUttaksperiode: null,
              ufoeregrad: 60,
            },
          })

          const {
            handlers: { setLocalGradertUttak },
          } = result.current

          act(() => {
            setLocalGradertUttak({
              grad: undefined,
              uttaksalder: { aar: 66, maaneder: 1 },
              aarligInntektVsaPensjonBeloep:
                initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
            })
          })

          // muligeUttaksgrad
          expect(result.current.muligeUttaksgrad).toHaveLength(2)
          expect(result.current.muligeUttaksgrad).toStrictEqual([20, 40])
        })

        it('Når beregningsvalg=med_afp avgrenses ikke muligeUttaksgrad selv om uttaksalder endres til en alder før normert pensjonsalder', async () => {
          const { result } = renderHook(useFormLocalState, {
            wrapper,
            initialProps: {
              ...initialProps,
              beregningsvalg: 'med_afp',
              gradertUttaksperiode: null,
              ufoeregrad: 0,
            },
          })

          const {
            handlers: { setLocalGradertUttak },
          } = result.current

          act(() => {
            setLocalGradertUttak({
              grad: undefined,
              uttaksalder: { aar: 66, maaneder: 1 },
              aarligInntektVsaPensjonBeloep:
                initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
            })
          })

          // muligeUttaksgrad
          expect(result.current.muligeUttaksgrad).toHaveLength(6)
          expect(result.current.muligeUttaksgrad).toStrictEqual([
            20, 40, 50, 60, 80, 100,
          ])
        })

        it('og gitt at brukeren har vedtak om alderspensjon, Når brukers uttaksalder endres til en alder før normert pensjonsalder, avgrenses muligeUttaksgrad med mulighet for 0 % periode', async () => {
          const { result } = renderHook(useFormLocalState, {
            wrapper,
            initialProps: {
              ...initialProps,
              isEndring: true,
              gradertUttaksperiode: null,
              ufoeregrad: 60,
            },
          })

          const {
            handlers: { setLocalGradertUttak },
          } = result.current

          act(() => {
            setLocalGradertUttak({
              grad: undefined,
              uttaksalder: { aar: 66, maaneder: 1 },
              aarligInntektVsaPensjonBeloep:
                initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
            })
          })

          // muligeUttaksgrad
          expect(result.current.muligeUttaksgrad).toHaveLength(3)
          expect(result.current.muligeUttaksgrad).toStrictEqual([0, 20, 40])
        })

        it('Når uttaksgrad er allerede valgt og uttaksalder endres til en alder før normert pensjonsalder som gjør denne uttaksgraden ugyldig, oppdateres ikke muligeUttaksgrad', async () => {
          const { result } = renderHook(useFormLocalState, {
            wrapper,
            initialProps: {
              ...initialProps,
              gradertUttaksperiode: null,
              ufoeregrad: 75,
            },
          })

          const {
            handlers: { setLocalGradertUttak },
          } = result.current

          act(() => {
            setLocalGradertUttak({
              grad: 40,
              uttaksalder: { aar: 66, maaneder: 1 },
              aarligInntektVsaPensjonBeloep:
                initialProps.gradertUttaksperiode.aarligInntektVsaPensjonBeloep.toString(),
            })
          })

          // muligeUttaksgrad
          expect(result.current.muligeUttaksgrad).toHaveLength(6)
        })
      })
    })
  })

  describe('useFormValidationErrors', () => {
    const mockedFormatMessageFunction = vi
      .fn()
      .mockImplementation(({ id }: { id: string }) => {
        return id
      })
    const mockedIntlShape = {
      formatMessage: mockedFormatMessageFunction,
    } as unknown as useIntlUtils.IntlShape
    vi.spyOn(useIntlUtils, 'useIntl').mockReturnValue(mockedIntlShape)

    it('Når ingen grad er oppgitt, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: undefined,
        },
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': '',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
      // gradertUttakAgePickerError
      expect(result.current.gradertUttakAgePickerError).toEqual('')
      // heltAgeUttakPickerError
      expect(result.current.heltUttakAgePickerError).toEqual('')
    })

    it('Når grad er oppgitt, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: 40,
        },
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': '',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
      // gradertUttakAgePickerError
      expect(result.current.gradertUttakAgePickerError).toEqual('')
      // heltUttakAgePickerError
      expect(result.current.heltUttakAgePickerError).toEqual('')
    })

    it('Når validationErrors endrer seg, oppdaterer gradertAgePickerError og heltAgePickerError', async () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {},
      })

      const {
        handlers: {
          setValidationErrors,
          setValidationErrorUttaksalderHeltUttak,
          setValidationErrorUttaksalderGradertUttak,
          setValidationErrorInntektVsaGradertUttak,
          resetValidationErrors,
        },
      } = result.current
      act(() => {
        setValidationErrorUttaksalderHeltUttak('id1')
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': '',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrorUttaksalderGradertUttak('id2')
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': '',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrorInntektVsaGradertUttak('id3')
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': 'id3',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrors((prevState) => {
          return { ...prevState, 'uttaksalder-helt-uttak': 'id4' }
        })
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp-radio': '',
        'inntekt-vsa-gradert-uttak': 'id3',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id4',
      })

      // gradertAgePickerError
      const gradertAgePickerError = render(
        result.current.gradertUttakAgePickerError as React.ReactElement
      )
      expect(gradertAgePickerError.asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          id2 for når du vil ta ut 
          <span
            class="nowrap"
          >
             %
          </span>
           alderspensjon.
        </DocumentFragment>
      `)

      // heltAgePickerError
      const heltAgePickerError = render(
        result.current.heltUttakAgePickerError as React.ReactElement
      )
      expect(heltAgePickerError.asFragment()).toMatchInlineSnapshot(`
        <DocumentFragment>
          id4
        </DocumentFragment>
      `)

      act(() => {
        resetValidationErrors()
      })
      // validationErrors
      expect(result.current.validationErrors).toStrictEqual({
        'inntekt-vsa-afp': '',
        'inntekt-vsa-gradert-uttak': '',
        'stillingsprosent-vsa-afp': '',
        'stillingsprosent-vsa-gradert-pensjon': '',
        'stillingsprosent-vsa-hel-pensjon': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
    })
  })
})
