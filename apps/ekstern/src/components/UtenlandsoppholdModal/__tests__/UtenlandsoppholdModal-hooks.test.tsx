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
      expect(
        result.current[1].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('19630429')
      expect(
        result.current[1].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('20630429')
      // datepickerSluttdato
      expect(
        result.current[2].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('19630429')
      expect(
        result.current[2].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('20630429')
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
      ).toStrictEqual('20630429')
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

      const date = new Date()
      const now_utc = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      )

      const hundredYearsBeforeNow = new Date(now_utc)
      hundredYearsBeforeNow.setFullYear(
        hundredYearsBeforeNow.getFullYear() - 100
      )
      const hundredYearsFromNow = new Date(now_utc)
      hundredYearsFromNow.setFullYear(hundredYearsFromNow.getFullYear() + 100)

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({})
      // datepickerStartdato
      const datepickerStartdato_fromDate__utc = Date.UTC(
        (result.current[1].datepickerProps.fromDate as Date).getUTCFullYear(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCMonth(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCDate(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCHours(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCMinutes(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerStartdato_fromDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsBeforeNow?.toISOString().slice(0, 10).replace(/-/g, '')
      )
      const datepickerStartdato_toDate__utc = Date.UTC(
        (result.current[1].datepickerProps.toDate as Date).getUTCFullYear(),
        (result.current[1].datepickerProps.toDate as Date).getUTCMonth(),
        (result.current[1].datepickerProps.toDate as Date).getUTCDate(),
        (result.current[1].datepickerProps.toDate as Date).getUTCHours(),
        (result.current[1].datepickerProps.toDate as Date).getUTCMinutes(),
        (result.current[1].datepickerProps.toDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerStartdato_toDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        hundredYearsFromNow?.toISOString().slice(0, 10).replace(/-/g, '')
      )
      // datepickerSluttdato
      const datepickerSluttdato_fromDate__utc = Date.UTC(
        (result.current[2].datepickerProps.fromDate as Date).getUTCFullYear(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCMonth(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCDate(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCHours(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCMinutes(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerSluttdato_fromDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
      const datepickerSluttdato_toDate__utc = Date.UTC(
        (result.current[2].datepickerProps.toDate as Date).getUTCFullYear(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMonth(),
        (result.current[2].datepickerProps.toDate as Date).getUTCDate(),
        (result.current[2].datepickerProps.toDate as Date).getUTCHours(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMinutes(),
        (result.current[2].datepickerProps.toDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerSluttdato_toDate__utc)
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
      const maxDate__utc = Date.UTC(
        (result.current[4] as Date).getUTCFullYear(),
        (result.current[4] as Date).getUTCMonth(),
        (result.current[4] as Date).getUTCDate(),
        (result.current[4] as Date).getUTCHours(),
        (result.current[4] as Date).getUTCMinutes(),
        (result.current[4] as Date).getUTCSeconds()
      )
      expect(
        new Date(maxDate__utc)?.toISOString().slice(0, 10).replace(/-/g, '')
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
      const datepickerStartdato_fromDate__utc = Date.UTC(
        (result.current[1].datepickerProps.fromDate as Date).getUTCFullYear(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCMonth(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCDate(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCHours(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCMinutes(),
        (result.current[1].datepickerProps.fromDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerStartdato_fromDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('19630429')
      const datepickerStartdato_toDate__utc = Date.UTC(
        (result.current[1].datepickerProps.toDate as Date).getUTCFullYear(),
        (result.current[1].datepickerProps.toDate as Date).getUTCMonth(),
        (result.current[1].datepickerProps.toDate as Date).getUTCDate(),
        (result.current[1].datepickerProps.toDate as Date).getUTCHours(),
        (result.current[1].datepickerProps.toDate as Date).getUTCMinutes(),
        (result.current[1].datepickerProps.toDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerStartdato_toDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('20630429')
      // datepickerSluttdato
      const datepickerSluttdato_fromDate__utc = Date.UTC(
        (result.current[2].datepickerProps.fromDate as Date).getUTCFullYear(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCMonth(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCDate(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCHours(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCMinutes(),
        (result.current[2].datepickerProps.fromDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerSluttdato_fromDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('20211211')
      const datepickerSluttdato_toDate__utc = Date.UTC(
        (result.current[2].datepickerProps.toDate as Date).getUTCFullYear(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMonth(),
        (result.current[2].datepickerProps.toDate as Date).getUTCDate(),
        (result.current[2].datepickerProps.toDate as Date).getUTCHours(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMinutes(),
        (result.current[2].datepickerProps.toDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerSluttdato_toDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual('20630429')
      // validationErrors
      expect(result.current[3]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
      })
      // maxDate
      const maxDate__utc = Date.UTC(
        (result.current[4] as Date).getUTCFullYear(),
        (result.current[4] as Date).getUTCMonth(),
        (result.current[4] as Date).getUTCDate(),
        (result.current[4] as Date).getUTCHours(),
        (result.current[4] as Date).getUTCMinutes(),
        (result.current[4] as Date).getUTCSeconds()
      )
      expect(
        new Date(maxDate__utc).toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual('20630429')
    })

    it('Når handleLandChange kalles, fjernes valideringsfeilmelding og utenlandsperiode oppdateres', async () => {
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

    it('Når handleArbeidetUtenlandsChange kalles, fjernes valideringsfeilmelding og utenlandsperiode oppdateres', async () => {
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

    it('Når onCancel kalles, nullstilles utenlandsperiode og feilmeldinger og modalen lukkes', async () => {
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
