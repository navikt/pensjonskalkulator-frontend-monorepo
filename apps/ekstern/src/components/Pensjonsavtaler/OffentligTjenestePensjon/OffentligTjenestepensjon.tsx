import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Alert,
  BodyLong,
  Heading,
  HeadingProps,
  Link,
  Table,
  VStack,
} from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import { Loader } from '@/components/common/Loader'
import { isOffentligTpFoer1963 } from '@/state/api/typeguards'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import {
  useNextHeadingLevel,
  useOffentligTjenestePensjonAlertList,
} from '../hooks'
import {
  formatLeverandoerList,
  getInfoOmAfpOgBetingetTjenestepensjon,
  getLeverandoerHeading,
} from './utils'

import styles from './OffentligTjenestepensjon.module.scss'

export const OffentligTjenestepensjon = (props: {
  isLoading: boolean
  isError: boolean
  headingLevel: HeadingProps['level']
  erOffentligTpFoer1963?: boolean
  offentligTp?: OffentligTp | OffentligTpFoer1963
}) => {
  const {
    isLoading,
    isError,
    offentligTp,
    headingLevel,
    erOffentligTpFoer1963,
  } = props

  const { tpLeverandoer, tpNummer } = offentligTp?.simulertTjenestepensjon || {}
  const intl = useIntl()
  const isMobile = useIsMobile()
  const afp = useAppSelector(selectAfp)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const loggedStatusesRef = React.useRef<Set<string>>(new Set())

  const offentligTpGirNullIUtbetaling =
    erOffentligTpFoer1963 && isOffentligTpFoer1963(offentligTp)
      ? offentligTp?.feilkode === 'BEREGNING_GIR_NULL_UTBETALING'
      : false

  const tekstInfoIkkeAfP = intl.formatMessage({
    id: 'pensjonsavtaler.offentligtp.foer1963.info_ikke_afp',
  })

  const handleAfpOffentligLinkClick: React.MouseEventHandler<
    HTMLAnchorElement
  > = (e): void => {
    e.preventDefault()
    const afpOffentligHeader = document.getElementById('afp-offentlig-heading')
    if (afpOffentligHeader) {
      // Get absolute position from top of document
      let element = afpOffentligHeader
      let offsetTop = 0

      while (element) {
        offsetTop += element.offsetTop
        element = element.offsetParent as HTMLElement
      }

      window.scrollTo({
        top: offsetTop - 15,
        behavior: 'smooth',
      })
    }
  }

  const alerts = useOffentligTjenestePensjonAlertList({ isError, offentligTp })

  const subHeadingLevel = useNextHeadingLevel(headingLevel)

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
    offentligTp?.simuleringsresultatStatus === 'OK' && tpNummer !== undefined

  return (
    <VStack gap="3">
      <Divider smallMargin />
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.offentligtp.title' })}
      </Heading>

      {alerts &&
        alerts.map((alert, index) => {
          if (!loggedStatusesRef.current.has(alert.status)) {
            logger(ALERT_VIST, {
              tekst: alert.logTekst,
              variant: 'warning',
            })
            loggedStatusesRef.current.add(alert.status)
          }

          const leverandoerList = offentligTp?.muligeTpLeverandoerListe
          const chunk =
            alert.hasLeverandoerList && leverandoerList?.length
              ? formatLeverandoerList(intl.locale, leverandoerList)
              : undefined

          return (
            <Alert
              key={`offentligtp-alert-${index}`}
              inline
              variant={alert.variant}
              data-testid={alert.testId}
            >
              <FormattedMessage
                id={alert.alertTextId}
                values={{ chunk: chunk ? `(${chunk})` : '' }}
              />
            </Alert>
          )
        })}

      {showResults && (
        <>
          {isMobile ? (
            <>
              <Heading
                id="tpo-subheading"
                level={headingLevel}
                size="xsmall"
                data-testid={`tpo-subheading-${tpLeverandoer}`}
              >
                {getLeverandoerHeading(intl, tpNummer, tpLeverandoer)}
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
                                utbetalingsperiode.startAlder,
                                offentligTpGirNullIUtbetaling
                              )}
                        </th>
                        <td align="right" className={styles.valueCell}>
                          {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                          <FormattedMessage id="pensjonsavtaler_mobil.kr_pr_aar" />
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
                            {getLeverandoerHeading(
                              intl,
                              tpNummer,
                              tpLeverandoer
                            )}
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
                                utbetalingsperiode.startAlder,
                                offentligTpGirNullIUtbetaling
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
          {isOffentligTpFoer1963(offentligTp) &&
            (offentligTp.simulertTjenestepensjon?.simuleringsresultat
              .utbetalingsperioder.length ?? 0) > 0 &&
            !offentligTp.feilkode && (
              <>
                <BodyLong size="small">
                  {tekstInfoIkkeAfP}
                  <FormattedMessage
                    id="pensjonsavtaler.offentligtp.foer1963.info"
                    values={{ ...getFormatMessageValues() }}
                  />
                </BodyLong>
                {skalBeregneAfpKap19 && (
                  <div>
                    <Heading level={subHeadingLevel} size="xsmall">
                      <FormattedMessage
                        id="pensjonsavtaler.offentligtp.subtitle.afp_fra_spk"
                        values={{
                          ...getFormatMessageValues(),
                        }}
                      />
                    </Heading>
                    <BodyLong size="medium">
                      <FormattedMessage
                        id="pensjonsavtaler.offentligtp.text.afp_fra_spk"
                        values={{
                          // eslint-disable-next-line react/no-unstable-nested-components
                          scrollTo: (chunk) => (
                            <Link
                              href="#"
                              data-testid="afp-offentlig-alert-link"
                              onClick={handleAfpOffentligLinkClick}
                            >
                              {chunk}
                            </Link>
                          ),
                        }}
                      />
                    </BodyLong>
                  </div>
                )}
              </>
            )}

          {!isOffentligTpFoer1963(offentligTp) && (
            <BodyLong size="small">
              <FormattedMessage
                id={getInfoOmAfpOgBetingetTjenestepensjon(
                  tpNummer,
                  afp,
                  offentligTp.simulertTjenestepensjon?.simuleringsresultat
                    .betingetTjenestepensjonErInkludert
                )}
                values={getFormatMessageValues()}
              />
            </BodyLong>
          )}
        </>
      )}
    </VStack>
  )
}
