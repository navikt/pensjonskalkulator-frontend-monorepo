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
    <table className={styles.barchart}>
      <thead>
        <tr className={styles.flexContainer}>
          {data.map(({ label }) => (
            <th className={styles.barchartCaption} key={label}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className={styles.flexContainer}>
          {data.map(({ value }, i) => (
            <td
              className={styles.barchartBar}
              style={{
                '--barheight': `${getBarChartHeight(value, maxValue)}px`,
              }}
              key={i}
            >
              <BodyShort>{formatAsDecimal(value)}</BodyShort>
              <figure
                className={clsx({
                  [styles.barchartFigure]: true,
                  [styles.barchartFigure_isFirst]: i === 0,
                })}
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
