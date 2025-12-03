import clsx from 'clsx'
import React from 'react'
import { useIntl } from 'react-intl'

import { BodyShort, ErrorMessage, Label, Select } from '@navikt/ds-react'

import { Alert as AlertDashBorder } from '@/components/common/Alert'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectNedreAldersgrense,
  selectOevreAldersgrense,
} from '@/state/userInput/selectors'
import {
  formatUttaksalder,
  transformMaanedToDate,
  transformUttaksalderToDate,
} from '@/utils/alder'

import styles from './AgePicker.module.scss'

const isMonthValidForSelectedYear = (
  month: number,
  selectedYear: number | undefined,
  minAlder: Alder,
  maxAlder: Alder
): boolean => {
  if (!selectedYear) return false

  // Year is between min and max (exclusive)
  if (selectedYear > minAlder.aar && selectedYear < maxAlder.aar) {
    return true
  }

  // Same min and max year
  if (minAlder.aar === maxAlder.aar && selectedYear === minAlder.aar) {
    return month >= minAlder.maaneder && month <= maxAlder.maaneder
  }

  // Selected year is minimum year
  if (selectedYear === minAlder.aar && minAlder.aar !== maxAlder.aar) {
    return month >= minAlder.maaneder
  }

  // Selected year is maximum year
  if (selectedYear === maxAlder.aar && minAlder.aar !== maxAlder.aar) {
    return month <= maxAlder.maaneder
  }

  return false
}

export interface AgePickerProps {
  form?: string
  name: string
  label: string | React.JSX.Element
  description?: string | React.JSX.Element
  value?: Partial<Alder>
  minAlder?: Alder
  maxAlder?: Alder
  info?: string
  onChange?: (alder: Partial<Alder> | undefined) => void
  error?: string | React.JSX.Element
  testId?: string
}

export const AgePicker = ({
  name,
  form,
  label,
  description,
  value,
  minAlder = { ...useAppSelector(selectNedreAldersgrense) },
  maxAlder = { ...useAppSelector(selectOevreAldersgrense) },
  info,
  onChange,
  error,
  testId,
}: AgePickerProps) => {
  const intl = useIntl()

  const { data: person, isSuccess } = useGetPersonQuery()

  const [valgtAlder, setValgtAlder] = React.useState<Partial<Alder>>(
    value ?? { aar: undefined, maaneder: undefined }
  )
  const [isMonthAutoSelected, setIsMonthAutoSelected] = React.useState(false)

  React.useEffect(() => {
    setValgtAlder(value ?? { aar: undefined, maaneder: undefined })
  }, [value])

  const yearsArray = React.useMemo(() => {
    const arr = []
    for (let i = minAlder.aar; i <= maxAlder.aar; i++) {
      arr.push(i)
    }
    return arr
  }, [minAlder, maxAlder])

  const monthsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const hasError = React.useMemo(() => {
    if (!error) {
      return { aar: false, maaneder: false }
    }

    const hasYear = !!valgtAlder.aar
    const hasMonth = valgtAlder.maaneder !== undefined
    const hasManuallySelectedMonth = hasMonth && !isMonthAutoSelected

    // Both fields show error when both are empty
    if (!hasYear && !hasMonth) {
      return { aar: true, maaneder: true }
    }

    // Both fields show error when both are manually filled
    if (hasYear && hasManuallySelectedMonth) {
      return { aar: true, maaneder: true }
    }

    // Only the empty field shows error when one is filled
    return {
      aar: !hasYear,
      maaneder: !hasManuallySelectedMonth,
    }
  }, [error, valgtAlder, isMonthAutoSelected])

  const transformertDate = React.useMemo(() => {
    if (
      isSuccess &&
      person?.foedselsdato &&
      valgtAlder.aar &&
      valgtAlder.maaneder !== undefined
    ) {
      return transformUttaksalderToDate(
        valgtAlder as Alder,
        person.foedselsdato
      )
    }
    return ''
  }, [valgtAlder, isSuccess, person?.foedselsdato])

  return (
    <div data-testid={testId || `age-picker-${name}`}>
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
            [styles.select__hasError]: hasError.aar,
          })}
          value={valgtAlder.aar ? valgtAlder.aar : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const aar = e.target.value
              ? parseInt(e.target.value, 10)
              : undefined

            // Determine the first valid month for the selected year
            let firstValidMonth: number | undefined = undefined
            if (aar !== undefined) {
              if (minAlder?.aar === maxAlder?.aar && aar === minAlder?.aar) {
                // Same min and max year
                firstValidMonth = minAlder?.maaneder
              } else if (aar === minAlder?.aar) {
                // Selected year is the minimum year
                firstValidMonth = minAlder?.maaneder
              } else if (aar === maxAlder?.aar) {
                // Selected year is the maximum year
                firstValidMonth = 0
              } else if (aar > minAlder?.aar && aar < maxAlder?.aar) {
                // Selected year is between min and max
                firstValidMonth = 0
              }
            }

            // Calculate new month value
            const newMaaneder = aar !== undefined ? firstValidMonth : undefined

            setValgtAlder({
              aar,
              maaneder: newMaaneder,
            })

            // Mark month as auto-selected when we auto-select it
            setIsMonthAutoSelected(
              aar !== undefined && firstValidMonth !== undefined
            )

            // Call onChange after state update
            if (onChange) {
              onChange({
                aar,
                maaneder: newMaaneder,
              })
            }
          }}
          aria-describedby={hasError.maaneder ? `${name}-error` : undefined}
          aria-invalid={hasError.aar}
        >
          <option disabled value="">
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
            [styles.select__hasError]: hasError.maaneder,
          })}
          value={valgtAlder.maaneder !== undefined ? valgtAlder.maaneder : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const maaneder = e.target.value
              ? parseInt(e.target.value, 10)
              : undefined
            setValgtAlder((prevState) => ({
              ...prevState,
              maaneder,
            }))
            // Mark month as manually selected
            setIsMonthAutoSelected(false)
            if (onChange) {
              onChange({ aar: valgtAlder.aar, maaneder })
            }
          }}
          disabled={!valgtAlder.aar}
          aria-describedby={hasError.maaneder ? `${name}-error` : undefined}
          aria-invalid={hasError.maaneder}
        >
          {monthsArray.map((month) => {
            if (
              isMonthValidForSelectedYear(
                month,
                valgtAlder?.aar,
                minAlder,
                maxAlder
              )
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
          <ErrorMessage showIcon className={styles.selectErrorMessage}>
            {error}
          </ErrorMessage>
        </div>
      )}

      {info && <AlertDashBorder>{info}</AlertDashBorder>}
    </div>
  )
}

export default AgePicker
