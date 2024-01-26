import React, { forwardRef } from 'react'

import { BodyShort, Label, Select } from '@navikt/ds-react'

import { Alert as AlertDashBorder } from '@/components/common/Alert'

export interface AgePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  description?: string
  info?: string
  form?: string
  // children: React.ReactNode
}

import styles from './AgePicker.module.scss'

export const AgePicker = forwardRef<HTMLDivElement, AgePickerProps>(
  ({ label, description, info, form, ...rest }, ref) => {
    return (
      <div className={styles.wrapper}>
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
          <Select form={form} label="Velg år" className={styles.selectAar}>
            <option value="62">62</option>
            <option value="63">63</option>
            <option value="64">64</option>
          </Select>
          <Select
            form={form}
            label="Velg måned"
            className={styles.selectMaaned}
          >
            <option value="0" disabled>
              0
            </option>
            <option value="1" disabled>
              1
            </option>
            <option value="2" disabled>
              2
            </option>
            <option value="3" disabled>
              3
            </option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
          </Select>
        </div>
        {info && <AlertDashBorder>{info}</AlertDashBorder>}
      </div>
    )
  }
)

export default AgePicker
