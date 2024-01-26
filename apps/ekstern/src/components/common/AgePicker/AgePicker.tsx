import React, { forwardRef } from 'react'
import { useIntl } from 'react-intl'

import { BodyShort, Label, Select } from '@navikt/ds-react'

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
  label: string
  description?: string
  value?: Partial<Alder>
  minAlder?: Alder
  maxAlder?: Alder
  info?: string
  onChange?: (alder: Partial<Alder> | undefined) => void
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
      minAlder,
      maxAlder,
      info,
      onChange,
    },
    ref
  ) => {
    const intl = useIntl()

    const { data: person, isSuccess } = useGetPersonQuery()

    const [valgtAlder, setValgtAlder] = React.useState<Partial<Alder>>(
      value ? value : { aar: undefined, maaneder: undefined }
    )

    const yearsArray = React.useMemo(() => {
      const arr = []
      const minYear = minAlder ? minAlder.aar : DEFAULT_TIDLIGST_UTTAKSALDER.aar
      const maxYear = maxAlder ? maxAlder.aar : DEFAULT_SENEST_UTTAKSALDER.aar

      for (let i = minYear; i <= maxYear; i++) {
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
      <div
        ref={ref}
        data-testid={`age-picker-${name}`}
        className={styles.wrapper}
      >
        <Label>{label}</Label>
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
            className={styles.selectAar}
            value={valgtAlder.aar}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const aar = e.target.value
                ? parseInt(e.target.value, 10)
                : undefined
              setValgtAlder((prevState) => {
                return {
                  ...prevState,
                  aar,
                }
              })
              onChange && onChange({ aar, maaneder: valgtAlder.maaneder })
            }}
          >
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
            className={styles.selectMaaned}
            value={valgtAlder.maaneder}
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
          >
            {monthsArray.map((month) => {
              return (
                <option key={month} value={month}>
                  {`${month} ${intl.formatMessage({ id: 'alder.md' })} (${person?.foedselsdato ? transformMaanedToDate(month, person?.foedselsdato, intl.locale as Locales) : ''})`}
                </option>
              )
            })}
          </Select>

          <span className={styles.date}>{transformertDate}</span>
        </div>
        {info && <AlertDashBorder>{info}</AlertDashBorder>}
      </div>
    )
  }
)

export default AgePicker
