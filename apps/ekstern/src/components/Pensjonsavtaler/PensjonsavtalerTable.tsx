import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Table, VStack } from '@navikt/ds-react'
import clsx from 'clsx'

import { formatWithoutDecimal } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import {
  formaterLivsvarigString,
  formaterSluttAlderString,
  groupPensjonsavtalerByType,
} from './utils'

import styles from './PensjonsavtalerTable.module.scss'

interface IPensjonsavtalerRad {
  pensjonsavtale: Pensjonsavtale
}

const PensjonsavtaleRad: React.FC<IPensjonsavtalerRad> = ({
  pensjonsavtale,
}) => {
  const intl = useIntl()
  return pensjonsavtale.utbetalingsperioder.map((utbetalingsperiode, i) => {
    const isLastRow = pensjonsavtale.utbetalingsperioder.length - 1 > i
    return (
      <Table.Row
        shadeOnHover={false}
        key={`${JSON.stringify(utbetalingsperiode)}-row`}
      >
        {i === 0 && (
          <Table.HeaderCell
            scope="row"
            className={styles.TableRader__alignTop}
            rowSpan={pensjonsavtale.utbetalingsperioder.length}
          >
            {pensjonsavtale.produktbetegnelse}
          </Table.HeaderCell>
        )}
        <Table.DataCell
          className={clsx({
            [styles.TableRader__noBottomBorder]: isLastRow,
          })}
        >
          {utbetalingsperiode.sluttAlder
            ? formaterSluttAlderString(intl)(
                utbetalingsperiode.startAlder,
                utbetalingsperiode.sluttAlder
              )
            : formaterLivsvarigString(intl)(utbetalingsperiode.startAlder)}
        </Table.DataCell>
        <Table.DataCell
          align="right"
          className={clsx({
            [styles.TableRader__noBottomBorder]: isLastRow,
          })}
        >
          {formatWithoutDecimal(utbetalingsperiode.aarligUtbetaling)} kr
        </Table.DataCell>
      </Table.Row>
    )
  })
}

interface IAvtaleGruppeProps {
  avtaleGruppeNavn: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<IAvtaleGruppeProps> = ({
  avtaleGruppeNavn,
  pensjonsavtaler,
}) => {
  return (
    <>
      <Heading size="small">{capitalize(avtaleGruppeNavn)}</Heading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <FormattedMessage id="pensjonsavtaler.tabell.title.left" />
            </Table.HeaderCell>
            <Table.HeaderCell style={{ width: '15em' }}>
              <FormattedMessage id="pensjonsavtaler.tabell.title.middle" />
            </Table.HeaderCell>
            <Table.HeaderCell align="right" style={{ width: '7em' }}>
              <FormattedMessage id="pensjonsavtaler.tabell.title.right" />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pensjonsavtaler.map((pensjonsavtale) => (
            <PensjonsavtaleRad
              key={`${pensjonsavtale.key}-table-rad`}
              pensjonsavtale={pensjonsavtale}
            />
          ))}
        </Table.Body>
      </Table>
    </>
  )
}

interface IProps {
  pensjonsavtaler: Pensjonsavtale[]
}
export const PensjonsavtalerTable: React.FC<IProps> = ({ pensjonsavtaler }) => {
  const gruppertePensjonsavtaler = React.useMemo(() => {
    return groupPensjonsavtalerByType(pensjonsavtaler)
  }, [pensjonsavtaler])

  return (
    <VStack gap="6">
      <VStack gap="2" data-testid="pensjonsavtaler-table">
        {Object.entries(gruppertePensjonsavtaler).map(
          ([avtaleGruppeNavn, gruppePensjonsavtaler]) => (
            <AvtaleGruppe
              key={`${avtaleGruppeNavn}-gruppe-table`}
              avtaleGruppeNavn={avtaleGruppeNavn}
              pensjonsavtaler={gruppePensjonsavtaler}
            />
          )
        )}
      </VStack>
      {(pensjonsavtaler?.length ?? 0) > 0 && (
        <BodyLong>
          <FormattedMessage id="pensjonsavtaler.fra_og_med_forklaring" />
        </BodyLong>
      )}
    </VStack>
  )
}
