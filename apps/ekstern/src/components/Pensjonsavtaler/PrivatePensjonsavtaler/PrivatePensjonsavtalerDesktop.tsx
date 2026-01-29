import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Heading, HeadingProps, Table, VStack } from '@navikt/ds-react'

import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { capitalize } from '@/utils/string'

import { groupPensjonsavtalerByType } from '../utils'

import styles from './PrivatePensjonsavtalerDesktop.module.scss'

interface IAvtaleGruppeProps {
  headingLevel: HeadingProps['level']
  avtaleGruppeNavn: string
  pensjonsavtaler: Pensjonsavtale[]
}

const AvtaleGruppe: React.FC<IAvtaleGruppeProps> = ({
  headingLevel,
  avtaleGruppeNavn,
  pensjonsavtaler,
}) => {
  const intl = useIntl()

  return (
    <>
      <Heading level={headingLevel} className={styles.TableHeader} size="small">
        {capitalize(avtaleGruppeNavn)}
      </Heading>
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
          {pensjonsavtaler.map((pensjonsavtale: Pensjonsavtale) => (
            <React.Fragment key={`${pensjonsavtale.key}-table-rad`}>
              {pensjonsavtale.utbetalingsperioder.map(
                (utbetalingsperiode: Utbetalingsperiode, i) => {
                  const isLastRow =
                    pensjonsavtale.utbetalingsperioder.length - 1 > i
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
                          ? formaterSluttAlderString(
                              intl,
                              utbetalingsperiode.startAlder,
                              utbetalingsperiode.sluttAlder
                            )
                          : formaterLivsvarigString(
                              intl,
                              utbetalingsperiode.startAlder
                            )}
                      </Table.DataCell>
                      <Table.DataCell
                        align="right"
                        className={clsx({
                          [styles.TableRader__noBottomBorder]: isLastRow,
                        })}
                      >
                        {formatInntekt(utbetalingsperiode.aarligUtbetaling)} kr
                      </Table.DataCell>
                    </Table.Row>
                  )
                }
              )}
            </React.Fragment>
          ))}
        </Table.Body>
      </Table>
    </>
  )
}

interface Props {
  headingLevel: HeadingProps['level']
  pensjonsavtaler: Pensjonsavtale[]
}
export const PrivatePensjonsavtalerDesktop: React.FC<Props> = ({
  headingLevel,
  pensjonsavtaler,
}) => {
  const gruppertePensjonsavtaler = React.useMemo(() => {
    return groupPensjonsavtalerByType(pensjonsavtaler)
  }, [pensjonsavtaler])

  return (
    <VStack gap="2" data-testid="private-pensjonsavtaler-desktop">
      {Object.entries(gruppertePensjonsavtaler).map(
        ([avtaleGruppeNavn, gruppePensjonsavtaler]) => (
          <AvtaleGruppe
            headingLevel={headingLevel}
            key={`${avtaleGruppeNavn}-gruppe-table`}
            avtaleGruppeNavn={avtaleGruppeNavn}
            pensjonsavtaler={gruppePensjonsavtaler}
          />
        )
      )}
    </VStack>
  )
}
