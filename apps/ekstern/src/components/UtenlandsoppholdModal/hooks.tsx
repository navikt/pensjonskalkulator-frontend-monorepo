import { add, format, isValid, parse } from 'date-fns'
import React from 'react'

import { useDatepicker } from '@navikt/ds-react'

import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { harKravOmArbeidFromLandkode } from '@/utils/land'

import {
  UTENLANDSOPPHOLD_FORM_NAMES,
  UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS,
  UtenlandsoppholdFormNames,
} from './utils'

export const useUtenlandsoppholdLocalState = (initialValues: {
  modalRef: React.RefObject<HTMLDialogElement | null>
  foedselsdato?: string
  utenlandsperiode?: Utenlandsperiode
  onSubmitCallback: () => void
}) => {
  const { modalRef, foedselsdato, utenlandsperiode, onSubmitCallback } =
    initialValues

  const [localUtenlandsperiode, setLocalUtenlandsperiode] = React.useState<
    RecursivePartial<Utenlandsperiode>
  >({ ...utenlandsperiode })
  const [validationErrors, setValidationErrors] = React.useState<
    Record<UtenlandsoppholdFormNames, string>
  >(UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS)

  const harLocalLandKravOmArbeid = React.useMemo(() => {
    return localUtenlandsperiode?.landkode
      ? harKravOmArbeidFromLandkode(localUtenlandsperiode?.landkode)
      : undefined
  }, [localUtenlandsperiode])

  const maxDate = React.useMemo(() => {
    return foedselsdato
      ? add(parse(foedselsdato, DATE_BACKEND_FORMAT, new Date()), {
          years: 100,
        })
      : add(new Date(), { years: 100 })
  }, [foedselsdato])

  const datepickerStartdato = useDatepicker({
    fromDate: foedselsdato
      ? parse(foedselsdato, DATE_BACKEND_FORMAT, new Date())
      : add(new Date(), { years: -100 }),
    toDate: maxDate,
    defaultSelected: localUtenlandsperiode?.startdato
      ? parse(localUtenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          startdato: value ? format(value, DATE_ENDUSER_FORMAT) : undefined,
        }
      })
    },
    onValidate: () => {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.startdato]: '',
        }
      })
    },
  })

  const datepickerSluttdato = useDatepicker({
    fromDate:
      localUtenlandsperiode?.startdato &&
      isValid(
        parse(localUtenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      )
        ? parse(
            localUtenlandsperiode?.startdato,
            DATE_ENDUSER_FORMAT,
            new Date()
          )
        : foedselsdato
          ? parse(foedselsdato, DATE_BACKEND_FORMAT, new Date())
          : new Date(),
    toDate: maxDate,
    defaultSelected: localUtenlandsperiode?.sluttdato
      ? parse(localUtenlandsperiode?.sluttdato, DATE_ENDUSER_FORMAT, new Date())
      : undefined,
    onDateChange: (value): void => {
      setLocalUtenlandsperiode((previous) => {
        return {
          ...previous,
          sluttdato: value ? format(value, DATE_ENDUSER_FORMAT) : undefined,
        }
      })
    },
    onValidate: () => {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          [UTENLANDSOPPHOLD_FORM_NAMES.sluttdato]: '',
        }
      })
    },
  })

  const handleLandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.land]: '',
      }
    })
    setLocalUtenlandsperiode((previous) => {
      return {
        ...previous,
        landkode: e.target.value,
        arbeidetUtenlands: undefined,
      }
    })
  }

  const handleArbeidetUtenlandsChange = (s: BooleanRadio) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [UTENLANDSOPPHOLD_FORM_NAMES.arbeidetUtenlands]: '',
      }
    })
    setLocalUtenlandsperiode((previous) => {
      return {
        ...previous,
        arbeidetUtenlands: s === 'ja',
      }
    })
  }

  const onCancel = (): void => {
    setLocalUtenlandsperiode({})
    // Datoene nullstilles eksplisitt her, slik at datepickeren ikke husker dem til neste utenlandsperiode
    datepickerStartdato.setSelected(undefined)
    datepickerSluttdato.setSelected(undefined)
    setValidationErrors(UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS)
    onSubmitCallback()
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
  }

  React.useEffect(() => {
    setLocalUtenlandsperiode(utenlandsperiode ? { ...utenlandsperiode } : {})
    datepickerStartdato.setSelected(
      utenlandsperiode?.startdato
        ? parse(utenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
        : undefined
    )
    datepickerSluttdato.setSelected(
      utenlandsperiode?.sluttdato
        ? parse(utenlandsperiode?.sluttdato, DATE_ENDUSER_FORMAT, new Date())
        : undefined
    )
  }, [utenlandsperiode])

  const handlers = React.useMemo(
    () => ({
      setValidationErrors: setValidationErrors,
      handleLandChange: handleLandChange,
      handleArbeidetUtenlandsChange: handleArbeidetUtenlandsChange,
      onCancel: onCancel,
    }),
    []
  )

  return [
    localUtenlandsperiode,
    harLocalLandKravOmArbeid,
    datepickerStartdato,
    datepickerSluttdato,
    validationErrors,
    maxDate,
    handlers,
  ] as const
}
