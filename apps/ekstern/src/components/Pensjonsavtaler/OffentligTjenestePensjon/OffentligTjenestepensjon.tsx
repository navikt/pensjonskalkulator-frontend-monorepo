import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Alert,
  BodyLong,
  Heading,
  HeadingProps,
  Table,
  VStack,
} from '@navikt/ds-react'
import clsx from 'clsx'

import { Divider } from '@/components/common/Divider'
import { Loader } from '@/components/common/Loader'
import { useAppSelector } from '@/state/hooks'
import { selectAfp } from '@/state/userInput/selectors'
import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import {
  getInfoOmAfpOgBetingetTjenestepensjon,
  getLeverandoerHeading,
  formatLeverandoerList,
} from './utils'

import styles from './OffentligTjenestepensjon.module.scss'

export const OffentligTjenestepensjon = (props: {
  isLoading: boolean
  isError: boolean
  offentligTp?: OffentligTp
  headingLevel: Exclude<HeadingProps['level'], undefined>
}) => {
  const { isLoading, isError, offentligTp, headingLevel } = props
  const tpLeverandoer = offentligTp?.simulertTjenestepensjon?.tpLeverandoer
  const intl = useIntl()
  const isMobile = useIsMobile()
  const afp = useAppSelector(selectAfp)

  const subHeadingLevel = React.useMemo(() => {
    return (parseInt(headingLevel, 10) + 1).toString() as HeadingProps['level']
  }, [headingLevel])

  if (isLoading) {
    return (
      <Loader
        data-testid="offentligtp-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  const showResults =
    offentligTp?.simuleringsresultatStatus === 'OK' &&
    tpLeverandoer !== undefined

  return (
    <VStack gap="3">
      <Divider smallMargin />
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.offentligtp.title' })}
      </Heading>
      {
        // Ved feil når /simuler-oftp kalles
        isError && (
          <Alert inline variant="warning">
            <FormattedMessage id="pensjonsavtaler.offentligtp.error" />
          </Alert>
        )
      }
      {
        // Når brukeren ikke er medlem av noe offentlig tp-ordning
        offentligTp?.simuleringsresultatStatus ===
          'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING' && (
          <Alert inline variant="info">
            <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
          </Alert>
        )
      }
      {
        // Når brukeren er medlem av en annen ordning
        offentligTp?.simuleringsresultatStatus ===
          'TP_ORDNING_STOETTES_IKKE' && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.er_medlem_annen_ordning"
              values={{
                chunk: formatLeverandoerList(
                  intl.locale,
                  offentligTp.muligeTpLeverandoerListe
                ),
              }}
            />
          </Alert>
        )
      }
      {
        // Ved feil hos TP-leverandør
        offentligTp?.simuleringsresultatStatus === 'TEKNISK_FEIL' && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.teknisk_feil"
              values={{
                chunk: formatLeverandoerList(
                  intl.locale,
                  offentligTp.muligeTpLeverandoerListe
                ),
              }}
            />
          </Alert>
        )
      }
      {
        // Ved tomt svar fra TP-leverandør
        offentligTp?.simuleringsresultatStatus ===
          'TOM_SIMULERING_FRA_TP_ORDNING' && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.empty"
              values={getFormatMessageValues()}
            />
          </Alert>
        )
      }

      {showResults && (
        <>
          {isMobile ? (
            <>
              <Heading
                id="tpo-subheading"
                level={subHeadingLevel}
                size="xsmall"
              >
                {getLeverandoerHeading(intl, tpLeverandoer)}
              </Heading>
              <table
                className={styles.mobileTable}
                data-testid="offentlig-tjenestepensjon-mobile"
              >
                <tbody>
                  {offentligTp.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.map(
                    (utbetalingsperiode: UtbetalingsperiodeOffentligTP) => (
                      <tr key={`${JSON.stringify(utbetalingsperiode)}-mobile`}>
                        <th
                          style={{ fontWeight: 'normal' }}
                          scope="row"
                          align="left"
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
                          :
                        </th>
                        <td align="right">
                          {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                          <FormattedMessage id="pensjonsavtaler.kr_pr_aar" />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <Table data-testid="offentlig-tjenestepensjon-desktop">
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
                {offentligTp.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.map(
                  (
                    utbetalingsperiode: UtbetalingsperiodeOffentligTP,
                    i,
                    utbetalingsperioder
                  ) => {
                    const dataCellClassName = clsx({
                      [styles.desktopTableRader__noBottomBorder]:
                        utbetalingsperioder.length - 1 > i,
                    })
                    return (
                      <Table.Row
                        shadeOnHover={false}
                        key={`${JSON.stringify(utbetalingsperiode)}-row`}
                      >
                        {i === 0 && (
                          <Table.HeaderCell
                            scope="row"
                            className={styles.desktopTableRader__alignTop}
                            rowSpan={utbetalingsperioder.length}
                          >
                            {getLeverandoerHeading(intl, tpLeverandoer)}
                          </Table.HeaderCell>
                        )}
                        <Table.DataCell className={dataCellClassName}>
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
                          className={dataCellClassName}
                        >
                          {`${formatInntekt(utbetalingsperiode.aarligUtbetaling)} kr`}
                        </Table.DataCell>
                      </Table.Row>
                    )
                  }
                )}
              </Table.Body>
            </Table>
          )}
          <BodyLong size="small">
            <FormattedMessage
              id={getInfoOmAfpOgBetingetTjenestepensjon(
                tpLeverandoer,
                afp,
                offentligTp.simulertTjenestepensjon?.simuleringsresultat
                  .betingetTjenestepensjonErInkludert
              )}
              values={getFormatMessageValues()}
            />
          </BodyLong>
        </>
      )}
    </VStack>
  )
}
