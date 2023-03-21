import { BodyShort } from '@navikt/ds-react'
import '@navikt/ds-css'
import clsx from 'clsx'

import { formatAsDecimal } from '../utils/currency'

import styles from './BarChart.module.scss'

export type ChartData = {
  label: string
  value: number
}

const getHeight = (
  value: number,
  maxValue: number,
  maxHeight: number = 128
) => {
  return (value / maxValue) * maxHeight
}

const findMaxValue = (data: ChartData[]): number => {
  return data.reduce((max, { value }) => (max > value ? max : value), 0)
}

interface Props {
  data: ChartData[]
  asTable?: boolean
}

export function BarChart({ data, asTable = false }: Props) {
  const maxValue = findMaxValue(data)
  return (
    <table
      className={clsx(
        asTable ? styles.table : styles.chart,
        asTable && 'navds-table'
      )}
    >
      <thead>
        <tr>
          {data.map(({ label }) => (
            <th className={styles.header} key={label}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {data.map(({ value }, i) => (
            <td
              className={styles.cell}
              style={{ '--height': `${getHeight(value, maxValue)}px` }}
              key={i}
            >
              <BodyShort>{formatAsDecimal(value)}</BodyShort>
              {!asTable && <figure className={styles.bar} />}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
