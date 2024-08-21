import React from 'react'
import { Provider } from 'react-redux'

import { describe, expect, it } from 'vitest'

import { setupStore } from '../../../state/store'
import { useFormLocalState } from '../hooks'
import { UTENLANDSOPPHOLD_FORM_NAMES } from '../utils'
import { act, renderHook } from '@/test-utils'

describe('UtenlandsoppholdModal-hooks', () => {
  describe('useFormLocalState', () => {
    const closeMock = vi.fn()
    const onSubmitCallbackMock = vi.fn()

    const initialProps = {
      modalRef: {
        current: { open: true, close: closeMock },
      } as unknown as React.RefObject<HTMLDialogElement>,
      foedselsdato: '1963-04-30',
      utenlandsperiode: {
        id: '1',
        landkode: 'SWE',
        arbeidetUtenlands: true,
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      },
      onSubmitCallback: onSubmitCallbackMock,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(undefined, true)
      return <Provider store={storeRef}>{children}</Provider>
    }

    it('Når ingen verdi er lagret i Redux store, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          utenlandsperiode: undefined,
        },
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({})
      // datepickerStartdato
      expect(result.current[1].datepickerProps.fromDate).toStrictEqual(
        new Date('1963-04-29T23:00:00.000Z')
      )
      expect(result.current[1].datepickerProps.toDate).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
      )
      // datepickerSluttdato
      expect(result.current[2].datepickerProps.fromDate).toStrictEqual(
        new Date('1963-04-29T23:00:00.000Z')
      )
      expect(result.current[2].datepickerProps.toDate).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
      )
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })
      // maxDate
      expect(result.current[4]).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
      )
    })

    it('Når fødselsdato ikke er angitt, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          utenlandsperiode: undefined,
          foedselsdato: undefined,
        },
      })

      const hundredYearsBeforeNow = new Date()
      hundredYearsBeforeNow.setFullYear(
        hundredYearsBeforeNow.getFullYear() - 100
      )
      const hundredYearsFromNow = new Date()
      hundredYearsFromNow.setFullYear(hundredYearsFromNow.getFullYear() + 100)

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({})
      // datepickerStartdato
      expect(
        result.current[1].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsBeforeNow?.toISOString().slice(0, 10).replace(/-/g, '')
      )
      expect(
        result.current[1].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsFromNow?.toISOString().slice(0, 10).replace(/-/g, '')
      )
      // datepickerSluttdato
      expect(
        result.current[2].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      expect(
        result.current[2].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsFromNow.toISOString().slice(0, 10).replace(/-/g, '')
      )
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })
      // maxDate
      expect(
        result.current[4]?.toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsFromNow?.toISOString().slice(0, 10).replace(/-/g, '')
      )
    })

    it('Når det gjelder en endring på en eksisterende utenlandsperiode, returnerer riktig initial values', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'SWE',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
      // datepickerStartdato
      expect(result.current[1].datepickerProps.fromDate).toStrictEqual(
        new Date('1963-04-29T23:00:00.000Z')
      )
      expect(result.current[1].datepickerProps.toDate).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
      )
      // datepickerSluttdato
      expect(result.current[2].datepickerProps.fromDate).toStrictEqual(
        new Date('2021-12-11T23:00:00.000Z')
      )
      expect(
        result.current[2].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      )
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })
      // maxDate
      expect(
        result.current[4]?.toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual(
        new Date('2063-04-29T22:00:00.000Z')
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      )
    })

    it('Når handleLandChange kalles, fjernes valideringsfeilmelding og utelandsperiode oppdateres', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleLandChange } = result.current[5]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'SWE',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
      act(() => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [UTENLANDSOPPHOLD_FORM_NAMES.land]: 'something-random',
          }
        })
      })
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': 'something-random',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })

      act(() => {
        handleLandChange({
          target: { value: 'ETH' },
        } as React.ChangeEvent<HTMLSelectElement>)
      })

      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'ETH',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
    })

    it('Når handleArbeidetUtenlandsChange kalles, fjernes valideringsfeilmelding og utelandsperiode oppdateres', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleArbeidetUtenlandsChange } =
        result.current[5]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'SWE',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
      act(() => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: 'something-random',
          }
        })
      })
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': 'something-random',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })

      act(() => {
        handleArbeidetUtenlandsChange('nei')
      })

      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: false,
        id: '1',
        landkode: 'SWE',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
    })

    it('Når onCancel kalles, nullstilles utelandsperiode og feilmeldinger og modalen lukkes', async () => {
      const { result } = renderHook(useFormLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleLandChange, onCancel } =
        result.current[5]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'SWE',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
      act(() => {
        setValidationErrors((prevState) => {
          return {
            ...prevState,
            [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: 'something-random',
            [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: 'something-random',
            [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: 'something-random',
          }
        })
        handleLandChange({
          target: { value: 'ETH' },
        } as React.ChangeEvent<HTMLSelectElement>)
      })

      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': 'something-random',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': 'something-random',
        'utenlandsopphold-startdato': 'something-random',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'ETH',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })

      act(() => {
        onCancel()
      })

      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'SWE',
        startdato: undefined,
        sluttdato: undefined,
      })

      expect(onSubmitCallbackMock).toHaveBeenCalled()
      expect(closeMock).toHaveBeenCalled()
    })
  })
})
