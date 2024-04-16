import React, { forwardRef } from 'react'
import { useIntl } from 'react-intl'

import { BodyShort, Label, Select } from '@navikt/ds-react'
import clsx from 'clsx'

import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import {
  formatUttaksalder,
  transformUttaksalderToDate,
  transformMaanedToDate,
  DEFAULT_TIDLIGST_UTTAKSALDER,
  DEFAULT_SENEST_UTTAKSALDER,
} from '@/utils/alder'

export interface AgePickerProps {
  form?: string
  name: string
  label: string | JSX.Element
  description?: string | JSX.Element
  value?: Partial<Alder>
  minAlder?: Alder
  maxAlder?: Alder
  info?: string
  onChange?: (alder: Partial<Alder> | undefined) => void
  error?: string | JSX.Element
}

import styles from './AgePicker.module.scss'

export const AgePicker = forwardRef<HTMLDivElement, AgePickerProps>(
  (
    {
      name,
      form,
      label,
      description,
      value,
      minAlder = { ...DEFAULT_TIDLIGST_UTTAKSALDER },
      maxAlder = { ...DEFAULT_SENEST_UTTAKSALDER },
      info,
      onChange,
      error,
    },
    ref
  ) => {
    const intl = useIntl()

    const { data: person, isSuccess } = useGetPersonQuery()

    const [valgtAlder, setValgtAlder] = React.useState<Partial<Alder>>(
      value ? value : { aar: undefined, maaneder: undefined }
    )

    React.useEffect(() => {
      setValgtAlder(value ? value : { aar: undefined, maaneder: undefined })
    }, [value])

    const yearsArray = React.useMemo(() => {
      const arr = []
      for (let i = minAlder.aar; i <= maxAlder.aar; i++) {
        arr.push(i)
      }
      return arr
    }, [minAlder, maxAlder])

    const monthsArray = React.useMemo(() => {
      const arr = []
      for (let i = 0; i <= 11; i++) {
        arr.push(i)
      }
      return arr
    }, [])

    const transformertDate = React.useMemo(() => {
      if (
        isSuccess &&
        person.foedselsdato &&
        valgtAlder.aar &&
        valgtAlder.maaneder !== undefined
      ) {
        return transformUttaksalderToDate(
          valgtAlder as Alder,
          person.foedselsdato
        )
      } else {
        return ''
      }
    }, [valgtAlder, isSuccess])

    return (
      <div ref={ref} data-testid={`age-picker-${name}`}>
        <Label className={!description ? styles.label : ''}>{label}</Label>
        {description && (
          <BodyShort
            className={styles.description}
            size="medium"
            textColor="subtle"
          >
            {description}
          </BodyShort>
        )}

        <div className={styles.selectWrapper}>
          <Select
            data-testid={`age-picker-${name}-aar`}
            form={form}
            name={`${name}-aar`}
            label="Velg år"
            className={clsx(styles.selectAar, {
              [styles.select__hasError]: !!error && !valgtAlder.aar,
            })}
            value={valgtAlder.aar ? valgtAlder.aar : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const aar = e.target.value
                ? parseInt(e.target.value, 10)
                : undefined

              const shouldResetMonth =
                (aar === minAlder.aar &&
                  valgtAlder?.maaneder !== undefined &&
                  valgtAlder?.maaneder < minAlder.maaneder) ||
                (aar === maxAlder.aar &&
                  valgtAlder?.maaneder !== undefined &&
                  valgtAlder?.maaneder > maxAlder.maaneder)

              setValgtAlder((prevState) => {
                return {
                  aar,
                  maaneder: shouldResetMonth ? undefined : prevState.maaneder,
                }
              })
              onChange &&
                onChange({
                  aar,
                  maaneder: shouldResetMonth ? undefined : valgtAlder.maaneder,
                })
            }}
            aria-describedby={error ? `${name}-error` : undefined}
            aria-invalid={!!error && !valgtAlder.aar}
            aria-required
          >
            <option disabled selected value="">
              {' '}
            </option>
            {yearsArray.map((year) => {
              return (
                <option key={year} value={year}>
                  {formatUttaksalder(intl, { aar: year, maaneder: 0 })}
                </option>
              )
            })}
          </Select>
          <Select
            data-testid={`age-picker-${name}-maaneder`}
            form={form}
            name={`${name}-maaneder`}
            label="Velg måned"
            className={clsx(styles.selectMaaned, {
              [styles.select__hasError]:
                !!error && valgtAlder.maaneder === undefined,
            })}
            value={valgtAlder.maaneder !== undefined ? valgtAlder.maaneder : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const maaneder = e.target.value
                ? parseInt(e.target.value, 10)
                : undefined
              setValgtAlder((prevState) => {
                return {
                  ...prevState,
                  maaneder,
                }
              })
              onChange && onChange({ aar: valgtAlder.aar, maaneder })
            }}
            disabled={!valgtAlder.aar}
            aria-describedby={error ? `${name}-error` : undefined}
            aria-invalid={!!error && valgtAlder.maaneder === undefined}
            aria-required
          >
            <option disabled selected value="">
              {' '}
            </option>
            {monthsArray.map((month) => {
              const isYearAboveMinAndBelowMax =
                valgtAlder?.aar &&
                valgtAlder?.aar > minAlder?.aar &&
                valgtAlder?.aar < maxAlder?.aar
              const isMinYearAndMonthAboveOrEqualMin =
                minAlder?.aar !== maxAlder?.aar &&
                valgtAlder?.aar === minAlder?.aar &&
                month >= minAlder?.maaneder
              const isMaxYearAndMonthBelowOrEqualMax =
                minAlder?.aar !== maxAlder?.aar &&
                valgtAlder?.aar === maxAlder?.aar &&
                month <= maxAlder?.maaneder
              const isMinAndMaxYearAndMonthBetween =
                minAlder?.aar === maxAlder?.aar &&
                month >= minAlder?.maaneder &&
                month <= maxAlder?.maaneder

              if (
                valgtAlder?.aar &&
                (isYearAboveMinAndBelowMax ||
                  isMinYearAndMonthAboveOrEqualMin ||
                  isMaxYearAndMonthBelowOrEqualMax ||
                  isMinAndMaxYearAndMonthBetween)
              ) {
                return (
                  <option key={month} value={month}>
                    {`${month} ${intl.formatMessage({ id: 'alder.md' })} (${person?.foedselsdato ? transformMaanedToDate(month, person?.foedselsdato, intl.locale as Locales) : ''})`}
                  </option>
                )
              }
            })}
          </Select>

          <span className={styles.date}>{transformertDate}</span>
        </div>
        {error && (
          <div
            id={`${name}-error`}
            aria-relevant="additions removals"
            aria-live="polite"
          >
            <p className={styles.selectErrorMessage}>{error}</p>
          </div>
        )}
        {info && <AlertDashBorder>{info}</AlertDashBorder>}
      </div>
    )
  }
)

export default AgePicker
