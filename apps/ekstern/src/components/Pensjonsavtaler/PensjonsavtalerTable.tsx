import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Heading, Table, VStack } from '@navikt/ds-react'
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
      <>
        <Table.Row shadeOnHover={false}>
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
      </>
    )
  })
}

interface IAvtaleGruppeProps {
  avtale: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<IAvtaleGruppeProps> = ({
  avtale,
  pensjonsavtaler,
}) => {
  return (
    <div>
      <Heading size="small">{capitalize(avtale)}</Heading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.left" />
            </Table.HeaderCell>
            <Table.HeaderCell style={{ width: '15em' }}>
              <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.middle" />
            </Table.HeaderCell>
            <Table.HeaderCell align="right" style={{ width: '7em' }}>
              <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.right" />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pensjonsavtaler.map((pensjonsavtale) => (
            <PensjonsavtaleRad pensjonsavtale={pensjonsavtale} />
          ))}
        </Table.Body>
      </Table>
    </div>
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
    <VStack gap="5">
      {Object.entries(gruppertePensjonsavtaler).map(
        ([avtaleGruppe, gruppePensjonsavtaler]) => (
          <AvtaleGruppe
            avtale={avtaleGruppe}
            pensjonsavtaler={gruppePensjonsavtaler}
          />
        )
      )}
    </VStack>
  )
}
