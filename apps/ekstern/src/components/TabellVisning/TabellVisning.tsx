import { Fragment } from 'react'

import { Table } from '@navikt/ds-react'
import { SeriesColumnOptions } from 'highcharts'

import { formatAsDecimal } from '@/utils/currency'

import { useTableData } from './hooks'
interface Props {
  series: SeriesColumnOptions[]
  aarArray?: string[]
}

import styles from './TabellVisning.module.scss'

export function TabellVisning({ series, aarArray }: Props) {
  const tableData = useTableData(series, aarArray)

  return (
    <Table className={styles.table} aria-live="polite">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell scope="col">Alder</Table.HeaderCell>
          <Table.HeaderCell scope="col" className={styles.detailsItemRight}>
            Sum (kr)
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {tableData.map(({ alder, sum, detaljer }, i) => {
          const detaljerGrid = (
            <dl key={i} className={styles.details}>
              {detaljer.map(({ name, subSum }, j) => (
                <Fragment key={j}>
                  <dt>{name}</dt>
                  <dd className={styles.detailsItemRight}>
                    {formatAsDecimal(subSum)}
                  </dd>
                </Fragment>
              ))}
            </dl>
          )

          return (
            <Table.ExpandableRow
              key={i}
              content={detaljerGrid}
              expandOnRowClick
            >
              <Table.DataCell scope="row">{alder}</Table.DataCell>
              <Table.DataCell className={styles.detailsItemRight}>
                {formatAsDecimal(sum)}
              </Table.DataCell>
            </Table.ExpandableRow>
          )
        })}
      </Table.Body>
    </Table>
  )
}
