import React from 'react'

import { useDatepicker } from '@navikt/ds-react'
import { add, parse, format, isValid } from 'date-fns'

import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'

import {
  UtenlandsoppholdFormNames,
  UTENLANDSOPPHOLD_FORM_NAMES,
  UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS,
} from './utils'

// TODO skrive tester
export const useFormLocalState = (initialValues: {
  modalRef: React.RefObject<HTMLDialogElement>
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

  const maxDate = React.useMemo(() => {
    return foedselsdato
      ? add(parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date()), {
          years: 100,
        })
      : add(new Date(), { years: 100 })
  }, [foedselsdato])

  const datepickerStartdato = useDatepicker({
    fromDate: foedselsdato
      ? parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
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
          ? parse(foedselsdato as string, DATE_BACKEND_FORMAT, new Date())
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
    setLocalUtenlandsperiode({ ...utenlandsperiode })
    datepickerStartdato.setSelected(undefined)
    datepickerSluttdato.setSelected(undefined)
    setValidationErrors(UTENLANDSOPPHOLD_INITIAL_FORM_VALIDATION_ERRORS)
    onSubmitCallback()
    if (modalRef.current?.open) {
      modalRef.current?.close()
    }
  }

  React.useEffect(() => {
    setLocalUtenlandsperiode({ ...utenlandsperiode })
    if (utenlandsperiode?.startdato) {
      datepickerStartdato.setSelected(
        parse(utenlandsperiode?.startdato, DATE_ENDUSER_FORMAT, new Date())
      )
    }
    if (utenlandsperiode?.sluttdato) {
      datepickerSluttdato.setSelected(
        parse(utenlandsperiode?.sluttdato, DATE_ENDUSER_FORMAT, new Date())
      )
    }
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
    datepickerStartdato,
    datepickerSluttdato,
    validationErrors,
    maxDate,
    handlers,
  ] as const
}
