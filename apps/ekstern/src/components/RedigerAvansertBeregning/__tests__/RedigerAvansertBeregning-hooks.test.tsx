import React from 'react'
import * as useIntlUtils from 'react-intl'

import { describe, expect, it } from 'vitest'

import { useFormLocalState, useFormValidationErrors } from '../hooks'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { act, renderHook, screen } from '@/test-utils'

describe('RedigerAvansertBeregning-hooks', () => {
  describe('useFormLocalState', () => {
    const defaultContextValues = {
      avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
      setAvansertSkjemaModus: vi.fn(),
    }
    const initialProps = {
      aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: 250000,
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
          aarligInntektFoerUttakBeloepFraBrukerSkattBeloep: undefined,
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
    })

    it('Når grad er oppgitt, returnerer riktig initial values', () => {
      const { result } = renderHook(useFormValidationErrors, {
        initialProps: {
          grad: 40,
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
      } = result.current[3]
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
