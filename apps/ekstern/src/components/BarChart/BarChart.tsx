import { BodyShort } from '@navikt/ds-react'
import '@navikt/ds-css'
import clsx from 'clsx'

import { formatAsDecimal } from '../../utils/currency'

import { getBarChartHeight, findMaxValue } from './utils'

import styles from './BarChart.module.scss'

export type ChartData = {
  label: string
  value: number
}

interface Props {
  data: ChartData[]
}

export function BarChart({ data }: Props) {
  const maxValue = findMaxValue(data)
  return (
    <table className={clsx(styles.chart)}>
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
              style={{ '--height': `${getBarChartHeight(value, maxValue)}px` }}
              key={i}
            >
              <BodyShort>{formatAsDecimal(value)}</BodyShort>
              <figure className={styles.bar} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
