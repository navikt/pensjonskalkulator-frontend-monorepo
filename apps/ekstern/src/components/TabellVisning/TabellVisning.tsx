import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Table } from '@navikt/ds-react'
import clsx from 'clsx'
import { SeriesColumnOptions } from 'highcharts'

import { ReadMore } from '../common/ReadMore'
import { formatWithoutDecimal } from '@/utils/currency'
import { logger } from '@/utils/logging'

import { useTableData } from './hooks'

interface Props {
  series: SeriesColumnOptions[]
  aarArray?: string[]
  showAfp?: boolean
  showPensjonsavtaler?: boolean
}

import styles from './TabellVisning.module.scss'

const logOnExpandOpenAndClose = (alder: string) => (open: boolean) => {
  if (open) {
    logger('table expand åpnet', {
      tekst: 'detaljert beregning',
      data: alder,
    })
  } else {
    logger('table expand lukket', {
      tekst: 'detaljert beregning',
      data: alder,
    })
  }
}

export function TabellVisning({
  series,
  aarArray,
  showAfp = false,
  showPensjonsavtaler = false,
}: Props) {
  const intl = useIntl()
  const tableData = useTableData(series, aarArray)
  const [isVisTabellOpen, setVisTabellOpen] = React.useState<boolean>(false)
  return (
    <ReadMore
      name="Tabell av beregningen"
      header={
        isVisTabellOpen
          ? intl.formatMessage({ id: 'beregning.tabell.lukk' })
          : intl.formatMessage({ id: 'beregning.tabell.vis' })
      }
      className={styles.visTabell}
      open={isVisTabellOpen}
      onClick={() => {
        setVisTabellOpen(!isVisTabellOpen)
      }}
    >
      <Table className={styles.table}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className={styles.tableMobileOnly} />
            <Table.HeaderCell scope="col">Alder</Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.detailsItemRight}>
              <FormattedMessage id="beregning.tabell.sum" />
              <span className={styles.tableMobileOnly}> (kr)</span>
            </Table.HeaderCell>
            <Table.HeaderCell
              scope="col"
              className={clsx(styles.detailsItemRight, styles.tableDesktopOnly)}
            >
              <FormattedMessage id="beregning.highcharts.serie.inntekt.name" />
            </Table.HeaderCell>
            {showAfp && (
              <Table.HeaderCell
                scope="col"
                className={clsx(
                  styles.detailsItemRight,
                  styles.tableDesktopOnly
                )}
              >
                <FormattedMessage id="beregning.highcharts.serie.afp.name" />
              </Table.HeaderCell>
            )}
            {showPensjonsavtaler && (
              <Table.HeaderCell
                scope="col"
                className={clsx(
                  styles.detailsItemRight,
                  styles.tableDesktopOnly
                )}
              >
                <FormattedMessage id="beregning.highcharts.serie.tp.name" />
              </Table.HeaderCell>
            )}
            <Table.HeaderCell
              scope="col"
              className={clsx(styles.detailsItemRight, styles.tableDesktopOnly)}
            >
              <FormattedMessage id="beregning.highcharts.serie.alderspensjon.name" />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body className={styles.tableMobileOnly}>
          {tableData.map(({ alder, sum, detaljer }, i) => {
            const detaljerGrid = (
              <dl key={i} className={styles.details}>
                {detaljer.map(({ name, subSum }, j) => (
                  <React.Fragment key={j}>
                    <dt>{name}</dt>
                    <dd className={styles.detailsItemRight}>
                      {formatWithoutDecimal(subSum)}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            )
            return (
              <Table.ExpandableRow
                key={i}
                content={detaljerGrid}
                expandOnRowClick
                onOpenChange={logOnExpandOpenAndClose(alder)}
              >
                <Table.DataCell>{alder}</Table.DataCell>
                <Table.DataCell className={styles.detailsItemRight}>
                  {formatWithoutDecimal(sum)}
                </Table.DataCell>
              </Table.ExpandableRow>
            )
          })}
        </Table.Body>
        <Table.Body className={styles.tableDesktopOnly}>
          {tableData.map(({ alder, sum, detaljer }, i) => {
            return (
              <Table.Row key={i}>
                <Table.HeaderCell>{alder}</Table.HeaderCell>
                <Table.DataCell
                  className={clsx(
                    styles.detailsItemRight,
                    styles.detailsItemBold
                  )}
                >
                  {sum > 0 ? `${formatWithoutDecimal(sum)} kr` : ''}
                </Table.DataCell>
                {detaljer.map(({ subSum }, j) => (
                  <Table.DataCell key={j} className={styles.detailsItemRight}>
                    {subSum > 0 ? `${formatWithoutDecimal(subSum)} kr` : ''}
                  </Table.DataCell>
                ))}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </ReadMore>
  )
}
