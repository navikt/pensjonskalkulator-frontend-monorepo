import { add, endOfDay, parse } from 'date-fns'
import React from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'

import { act, renderHook } from '@/test-utils'
import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'

import { setupStore } from '../../../state/store'
import { useUtenlandsoppholdLocalState } from '../hooks'
import { UTENLANDSOPPHOLD_FORM_NAMES } from '../utils'

describe('UtenlandsoppholdModal-hooks', () => {
  const foedselsdato = '1963-04-30'
  const expectedFoedselsdato = parse(
    foedselsdato as string,
    DATE_BACKEND_FORMAT,
    new Date()
  )
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')

  const expectedFoedselsdatoAdded100Years = add(
    parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()),
    {
      years: 100,
    }
  )
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')

  const expectedHundredYearsBeforeNow = add(endOfDay(new Date()), {
    years: -100,
  })
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')

  const expectedHundredYearsAfterNow = add(endOfDay(new Date()), {
    years: 100,
  })
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')

  describe('useUtenlandsoppholdLocalState', () => {
    const closeMock = vi.fn()
    const onSubmitCallbackMock = vi.fn()

    const initialProps = {
      modalRef: {
        current: { open: true, close: closeMock },
      } as unknown as React.RefObject<HTMLDialogElement>,
      foedselsdato: foedselsdato,
      utenlandsperiode: {
        id: '1',
        landkode: 'FRA',
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
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          utenlandsperiode: undefined,
        },
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        sluttdato: undefined,
        startdato: undefined,
      })
      // harLocalLandKravOmArbeid
      expect(result.current[1]).toBeUndefined()
      // datepickerStartdato
      expect(
        result.current[2].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdato) // server expects 19630430
      const datepickerStartdato_toDate__utc = Date.UTC(
        (result.current[2].datepickerProps.toDate as Date).getUTCFullYear(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMonth(),
        (result.current[2].datepickerProps.toDate as Date).getUTCDate(),
        (result.current[2].datepickerProps.toDate as Date).getUTCHours(),
        (result.current[2].datepickerProps.toDate as Date).getUTCMinutes(),
        (result.current[2].datepickerProps.toDate as Date).getUTCSeconds()
      )
      expect(
        new Date(datepickerStartdato_toDate__utc)
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
      // datepickerSluttdato
      expect(
        result.current[3].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdato)
      expect(
        result.current[3].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })
      // maxDate
      expect(
        result.current[5].toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
    })

    it('Når fødselsdato ikke er angitt, returnerer riktig initial values', async () => {
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          utenlandsperiode: undefined,
          foedselsdato: undefined,
        },
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        sluttdato: undefined,
        startdato: undefined,
      })
      // harLocalLandKravOmArbeid
      expect(result.current[1]).toBeUndefined()
      // datepickerStartdato
      expect(
        result.current[2].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedHundredYearsBeforeNow)
      expect(
        result.current[2].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedHundredYearsAfterNow)
      // datepickerSluttdato
      expect(
        result.current[3].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        endOfDay(new Date()).toISOString().slice(0, 10).replace(/-/g, '')
      )
      expect(
        result.current[3].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedHundredYearsAfterNow)
      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })
      // maxDate
      expect(
        result.current[5]?.toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual(expectedHundredYearsAfterNow)
    })

    it('Når det gjelder en endring på en eksisterende utenlandsperiode, returnerer riktig initial values', async () => {
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'FRA',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
      // harLocalLandKravOmArbeid
      expect(result.current[1]).toBeTruthy()
      // datepickerStartdato
      expect(
        result.current[2].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdato)
      expect(
        result.current[3].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
      // datepickerSluttdato
      expect(
        result.current[3].datepickerProps.fromDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(
        parse('12.12.2021', DATE_ENDUSER_FORMAT, new Date())
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      )
      expect(
        result.current[3].datepickerProps.toDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })
      // maxDate
      expect(
        result.current[5].toISOString().slice(0, 10).replace(/-/g, '')
      ).toStrictEqual(expectedFoedselsdatoAdded100Years)
    })

    it('Når handleLandChange kalles, fjernes valideringsfeilmelding og utenlandsperiode oppdateres', async () => {
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleLandChange } = result.current[6]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'FRA',
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
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': 'something-random',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      act(() => {
        handleLandChange({
          target: { value: 'ETH' },
        } as React.ChangeEvent<HTMLSelectElement>)
      })

      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: undefined,
        id: '1',
        landkode: 'ETH',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
    })

    it('Når handleArbeidetUtenlandsChange kalles, fjernes valideringsfeilmelding og utenlandsperiode oppdateres', async () => {
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleArbeidetUtenlandsChange } =
        result.current[6]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'FRA',
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
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': 'something-random',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      act(() => {
        handleArbeidetUtenlandsChange('nei')
      })

      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: false,
        id: '1',
        landkode: 'FRA',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })
    })

    it('Når onCancel kalles, nullstilles utenlandsperiode og feilmeldinger og modalen lukkes', async () => {
      const { result } = renderHook(useUtenlandsoppholdLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
        },
      })
      // handlers
      const { setValidationErrors, handleLandChange, onCancel } =
        result.current[6]

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: true,
        id: '1',
        landkode: 'FRA',
        sluttdato: '12.12.2025',
        startdato: '12.12.2021',
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
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': 'something-random',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': 'something-random',
        'utenlandsopphold-startdato': 'something-random',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        arbeidetUtenlands: undefined,
        id: '1',
        landkode: 'ETH',
        startdato: '12.12.2021',
        sluttdato: '12.12.2025',
      })

      act(() => {
        onCancel()
      })

      // validationErrors
      expect(result.current[4]).toStrictEqual({
        'utenlandsopphold-arbeidet-utenlands': '',
        'utenlandsopphold-land': '',
        'utenlandsopphold-sluttdato': '',
        'utenlandsopphold-startdato': '',
        'utenlandsopphold-overlappende-land': '',
        'utenlandsopphold-overlappende-periodeslutt': '',
        'utenlandsopphold-overlappende-periodestart': '',
      })

      // localUtenlandsperiode
      expect(result.current[0]).toStrictEqual({
        sluttdato: undefined,
        startdato: undefined,
      })

      expect(onSubmitCallbackMock).toHaveBeenCalled()
      expect(closeMock).toHaveBeenCalled()
    })
  })
})
