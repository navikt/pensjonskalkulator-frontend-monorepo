import clsx from 'clsx'
import { SeriesColumnOptions } from 'highcharts'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Table } from '@navikt/ds-react'

import { SERIES_DEFAULT } from '@/components/Simulering/constants'
import { formatInntekt } from '@/utils/inntekt'

import { ReadMore } from '../common/ReadMore'
import { useTableData } from './hooks'

import styles from './TabellVisning.module.scss'

interface Props {
  series: SeriesColumnOptions[]
  aarArray?: string[]
}

export function TabellVisning({ series, aarArray }: Props) {
  const intl = useIntl()
  const tableData = useTableData(series, aarArray)
  const [isTabellVisible, setIsTabellVisible] = React.useState<boolean>(false)

  const showInntekt = React.useMemo(() => {
    return series.some(
      (serie) =>
        serie.name ===
        intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_INNTEKT.name,
        })
    )
  }, [series])

  const showAfp = React.useMemo(() => {
    return series.some(
      (serie) =>
        serie.name ===
        intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_AFP.name,
        })
    )
  }, [series])

  const showPensjonsavtaler = React.useMemo(() => {
    return series.some(
      (serie) =>
        serie.name ===
        intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_TP.name,
        })
    )
  }, [series])

  return (
    <ReadMore
      name="Tabell av beregningen"
      header={
        isTabellVisible
          ? intl.formatMessage({ id: 'beregning.tabell.lukk' })
          : intl.formatMessage({ id: 'beregning.tabell.vis' })
      }
      className={styles.visTabell}
      onOpenChange={setIsTabellVisible}
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
            {showInntekt && (
              <Table.HeaderCell
                scope="col"
                className={clsx(
                  styles.detailsItemRight,
                  styles.tableDesktopOnly
                )}
              >
                <FormattedMessage id="beregning.highcharts.serie.inntekt.name" />
              </Table.HeaderCell>
            )}

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
                      <span className="nowrap">{formatInntekt(subSum)}</span>
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
              >
                <Table.DataCell>{alder}</Table.DataCell>
                <Table.DataCell className={styles.detailsItemRight}>
                  <span className="nowrap">{formatInntekt(sum)}</span>
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
                  {sum > 0 ? `${formatInntekt(sum)} kr` : ''}
                </Table.DataCell>
                {detaljer.map(({ subSum, name }, j) => (
                  <Table.DataCell key={j} className={styles.detailsItemRight}>
                    {subSum > 0 ||
                    name ===
                      intl.formatMessage({
                        id: SERIES_DEFAULT.SERIE_AFP.name,
                      }) // Skal vise 0 kr, BARE hvis det er AFP som har 0 kr., ikke for andre felter med 0 kr.
                      ? `${subSum ? formatInntekt(subSum) : 0} kr`
                      : ''}
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
