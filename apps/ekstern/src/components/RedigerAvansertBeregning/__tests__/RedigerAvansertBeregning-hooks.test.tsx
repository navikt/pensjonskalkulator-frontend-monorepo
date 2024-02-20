import React from 'react'
import * as useIntlUtils from 'react-intl'

import { describe, expect, it } from 'vitest'

import {
  useFormLocalState,
  useTidligstMuligUttakRequestBodyState,
  useFormValidationErrors,
} from '../hooks'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import * as apiUtils from '@/state/api/utils'
import { act, renderHook, screen } from '@/test-utils'

describe('RedigerAvansertBeregning-hooks', () => {
  describe('useFormLocalState', () => {
    const defaultContextValues = {
      avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
      setAvansertSkjemaModus: vi.fn(),
    }
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
          aarligInntektFoerUttakBeloepFraBrukerInput: null,
          uttaksalder: null,
          aarligInntektVsaHelPensjon: undefined,
          gradertUttaksperiode: null,
        },
      })

      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent(`FALSE`)
      // localInntektFremTilUttak
      expect(result.current[0]).toBe(null)
      // localHeltUttak
      expect(result.current[1]).toStrictEqual({
        aarligInntektVsaPensjon: undefined,
        uttaksalder: undefined,
      })
      // localGradertUttak
      expect(result.current[2]).toBe(undefined)
    })

    it('Når Redux store inneholder verdier fra før av, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent(`FALSE`)
      // localInntektFremTilUttak
      expect(result.current[0]).toBe(300000)
      // localHeltUttak
      expect(result.current[1]).toStrictEqual({
        uttaksalder: { aar: 70, maaneder: 0 },
        aarligInntektVsaPensjon: {
          beloep: 100000,
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })
      // localGradertUttak
      expect(result.current[2]).toStrictEqual({
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: '100000',
      })
    })

    describe('Når inntekt frem til uttak endrer seg,', () => {
      it('Når inntekt frem til uttak endrer seg, oppdateres verdien og hasUnsavedChanges', async () => {
        const { result } = renderHook(useFormLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })

        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`FALSE`)

        const { setLocalInntektFremTilUttak } = result.current[3]

        act(() => {
          setLocalInntektFremTilUttak(800000)
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localInntektFremTilUttak
        expect(result.current[0]).toBe(800000)
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalInntektFremTilUttak } = result.current[3]

        act(() => {
          setLocalInntektFremTilUttak(800000)
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localInntektFremTilUttak
        expect(result.current[0]).toBe(800000)
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalInntektFremTilUttak } = result.current[3]

        act(() => {
          setLocalInntektFremTilUttak(300000)
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`FALSE`)
      })
    })

    describe('Når helt uttak endrer seg,', () => {
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalHeltUttak } = result.current[3]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { aar: 70, maaneder: 3 },
            aarligInntektVsaPensjon: {
              ...initialProps.aarligInntektVsaHelPensjon,
              beloep: initialProps.aarligInntektVsaHelPensjon.beloep,
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localHeltUttak
        expect(result.current[1]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 3 },
          aarligInntektVsaPensjon: {
            beloep: 100000,
            sluttAlder: { aar: 75, maaneder: 0 },
          },
        })
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalHeltUttak } = result.current[3]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: 90000,
              sluttAlder: { aar: 75, maaneder: 0 },
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localHeltUttak
        expect(result.current[1]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: 90000,
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalHeltUttak } = result.current[3]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: {
              beloep: 100000,
              sluttAlder: { aar: 72, maaneder: 0 },
            },
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localHeltUttak
        expect(result.current[1]).toStrictEqual({
          uttaksalder: { aar: 70, maaneder: 0 },
          aarligInntektVsaPensjon: {
            beloep: 100000,
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalHeltUttak } = result.current[3]

        act(() => {
          setLocalHeltUttak({
            uttaksalder: { ...initialProps.uttaksalder },
            aarligInntektVsaPensjon: undefined,
          })
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localHeltUttak
        expect(result.current[1]).toStrictEqual({
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalHeltUttak } = result.current[3]

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
        ).toHaveTextContent(`FALSE`)
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalGradertUttak } = result.current[3]

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
        ).toHaveTextContent(`TRUE`)
        // localGradertUttak
        expect(result.current[2]).toStrictEqual({
          grad: 20,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '100000',
        })
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalGradertUttak } = result.current[3]

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
        ).toHaveTextContent(`TRUE`)
        // localGradertUttak
        expect(result.current[2]).toStrictEqual({
          grad: 40,
          uttaksalder: { aar: 68, maaneder: 1 },
          aarligInntektVsaPensjonBeloep: '100000',
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalGradertUttak } = result.current[3]

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
        ).toHaveTextContent(`TRUE`)
        // localGradertUttak
        expect(result.current[2]).toStrictEqual({
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalGradertUttak } = result.current[3]

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
        ).toHaveTextContent(`TRUE`)
        // localGradertUttak
        expect(result.current[2]).toStrictEqual({
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
        ).toHaveTextContent(`FALSE`)

        const { setLocalGradertUttak } = result.current[3]

        act(() => {
          setLocalGradertUttak(undefined)
        })
        // harAvansertSkjemaUnsavedChanges
        expect(
          await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
        ).toHaveTextContent(`TRUE`)
        // localGradertUttak
        expect(result.current[2]).toBe(undefined)
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
        ).toHaveTextContent(`FALSE`)
        const { setLocalGradertUttak } = result.current[3]

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
        ).toHaveTextContent(`FALSE`)
      })
    })

    it('Når hasVilkaarIkkeOppfylt er true, blir hasUnsavedChanges false selv om andre verdier har endret seg', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          hasVilkaarIkkeOppfylt: true,
        },
      })

      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent(`FALSE`)

      const { setLocalInntektFremTilUttak } = result.current[3]

      act(() => {
        setLocalInntektFremTilUttak(800000)
      })
      // harAvansertSkjemaUnsavedChanges
      expect(
        await screen.findByTestId('harAvansertSkjemaUnsavedChanges')
      ).toHaveTextContent(`FALSE`)
      // localInntektFremTilUttak
      expect(result.current[0]).toBe(800000)
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
              beloep: 50000,
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

  describe('useFormValidationErrors', () => {
    const mockedFormatMessageFunction = vi
      .fn()
      .mockImplementation(({ id: string }) => {
        return string
      })
    const mockedIntlShape = {
      formatMessage: mockedFormatMessageFunction,
    } as unknown as useIntlUtils.IntlShape
    vi.spyOn(useIntlUtils, 'useIntl').mockReturnValue(mockedIntlShape)

    it('Når ingen grad er oppgitt, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: undefined,
          tidligstMuligHeltUttak: { aar: 67, maaneder: 0 },
        },
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
      // gradertUttakAgePickerError
      expect(result.current[1]).toEqual('')
      // heltAgeUttakPickerError
      expect(result.current[2]).toEqual('')
      // gradertUttakAgePickerBeskrivelse
      expect(result.current[3]).toEqual('')
      // heltUttakAgePickerBeskrivelse
      expect(result.current[4]).toMatchInlineSnapshot(`
        <React.Fragment>
          <Memo(MemoizedFormattedMessage)
            id="beregning.avansert.rediger.agepicker.beskrivelse"
            values={
              {
                "afpLink": [Function],
                "alderspensjonsreglerLink": [Function],
                "br": <br />,
                "detaljertKalkulatorLink": [Function],
                "dinPensjonBeholdningLink": [Function],
                "dinPensjonLink": [Function],
                "garantiPensjonLink": [Function],
                "grad": 100,
                "navPersonvernerklaeringKontaktOss": [Function],
                "navPersonvernerklaeringLink": [Function],
                "norskPensjonLink": [Function],
                "nowrap": [Function],
                "strong": [Function],
              }
            }
          />
           67 alder.aar.
        </React.Fragment>
      `)
    })

    it('Når grad er oppgitt, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: 40,
          tidligstMuligGradertUttak: { aar: 62, maaneder: 7 },
          tidligstMuligHeltUttak: { aar: 67, maaneder: 0 },
        },
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
      // gradertUttakAgePickerError
      expect(result.current[1]).toEqual('')
      // heltUttakAgePickerError
      expect(result.current[2]).toEqual('')
      // gradertUttakAgePickerBeskrivelse
      expect(result.current[3]).toMatchInlineSnapshot(`
        <React.Fragment>
          <Memo(MemoizedFormattedMessage)
            id="beregning.avansert.rediger.agepicker.beskrivelse"
            values={
              {
                "afpLink": [Function],
                "alderspensjonsreglerLink": [Function],
                "br": <br />,
                "detaljertKalkulatorLink": [Function],
                "dinPensjonBeholdningLink": [Function],
                "dinPensjonLink": [Function],
                "garantiPensjonLink": [Function],
                "grad": 40,
                "navPersonvernerklaeringKontaktOss": [Function],
                "navPersonvernerklaeringLink": [Function],
                "norskPensjonLink": [Function],
                "nowrap": [Function],
                "strong": [Function],
              }
            }
          />
           62 alder.aar string.og 7 alder.maaneder.
        </React.Fragment>
      `)
      // heltUttakAgePickerBeskrivelse
      expect(result.current[4]).toMatchInlineSnapshot(`
        <Memo(MemoizedFormattedMessage)
          id="beregning.avansert.rediger.agepicker.tmu_info"
          values={
            {
              "afpLink": [Function],
              "alderspensjonsreglerLink": [Function],
              "br": <br />,
              "detaljertKalkulatorLink": [Function],
              "dinPensjonBeholdningLink": [Function],
              "dinPensjonLink": [Function],
              "garantiPensjonLink": [Function],
              "navPersonvernerklaeringKontaktOss": [Function],
              "navPersonvernerklaeringLink": [Function],
              "norskPensjonLink": [Function],
              "nowrap": [Function],
              "strong": [Function],
            }
          }
        />
      `)
    })

    it('Når validationErrors endrer seg, oppdaterer gradertAgePickerError og heltAgePickerError', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: 40,
        },
      })

      const {
        setValidationErrors,
        setValidationErrorUttaksalderHeltUttak,
        setValidationErrorUttaksalderGradertUttak,
        setValidationErrorInntektVsaGradertUttak,
        resetValidationErrors,
      } = result.current[5]
      act(() => {
        setValidationErrorUttaksalderHeltUttak('id1')
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrorUttaksalderGradertUttak('id2')
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': '',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrorInntektVsaGradertUttak('id3')
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': 'id3',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id1',
      })
      act(() => {
        setValidationErrors((prevState) => {
          return { ...prevState, 'uttaksalder-helt-uttak': 'id4' }
        })
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': 'id3',
        'uttaksalder-gradert-uttak': 'id2',
        'uttaksalder-helt-uttak': 'id4',
      })

      // gradertAgePickerError
      expect(result.current[1]).toMatchInlineSnapshot(
        `
        <React.Fragment>
          id2
           
          <Memo(MemoizedFormattedMessage)
            id="beregning.avansert.rediger.agepicker.validation_error"
            values={
              {
                "afpLink": [Function],
                "alderspensjonsreglerLink": [Function],
                "br": <br />,
                "detaljertKalkulatorLink": [Function],
                "dinPensjonBeholdningLink": [Function],
                "dinPensjonLink": [Function],
                "garantiPensjonLink": [Function],
                "grad": 40,
                "navPersonvernerklaeringKontaktOss": [Function],
                "navPersonvernerklaeringLink": [Function],
                "norskPensjonLink": [Function],
                "nowrap": [Function],
                "strong": [Function],
              }
            }
          />
        </React.Fragment>
      `
      )
      // heltAgePickerError
      expect(result.current[2]).toMatchInlineSnapshot(`
        <React.Fragment>
          id4
           
          <Memo(MemoizedFormattedMessage)
            id="beregning.avansert.rediger.agepicker.validation_error"
            values={
              {
                "afpLink": [Function],
                "alderspensjonsreglerLink": [Function],
                "br": <br />,
                "detaljertKalkulatorLink": [Function],
                "dinPensjonBeholdningLink": [Function],
                "dinPensjonLink": [Function],
                "garantiPensjonLink": [Function],
                "grad": 100,
                "navPersonvernerklaeringKontaktOss": [Function],
                "navPersonvernerklaeringLink": [Function],
                "norskPensjonLink": [Function],
                "nowrap": [Function],
                "strong": [Function],
              }
            }
          />
        </React.Fragment>
      `)

      act(() => {
        resetValidationErrors()
      })
      // validationErrors
      expect(result.current[0]).toStrictEqual({
        'inntekt-vsa-gradert-uttak': '',
        'uttaksalder-gradert-uttak': '',
        'uttaksalder-helt-uttak': '',
      })
    })
  })
})
