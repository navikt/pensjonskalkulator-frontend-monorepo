import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  Heading,
  HeadingProps,
  Table,
  VStack,
} from '@navikt/ds-react'
import clsx from 'clsx'

import { Divider } from '@/components/common/Divider'
import { Loader } from '@/components/common/Loader'
import { useGetTpOffentligFeatureToggleQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectAfp } from '@/state/userInput/selectors'
import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import styles from './OffentligTjenestepensjon.module.scss'

export const OffentligTjenestepensjon = (props: {
  isLoading: boolean
  isError: boolean
  offentligTp?: OffentligTp
  headingLevel: HeadingProps['level']
  showDivider?: boolean
}) => {
  const { isLoading, isError, offentligTp, headingLevel, showDivider } = props
  const intl = useIntl()
  const isMobile = useIsMobile()
  const afp = useAppSelector(selectAfp)

  const [leverandoererString, setleverandoererString] =
    React.useState<string>('')
  const { data: tpOffentligFeatureToggle } =
    useGetTpOffentligFeatureToggleQuery()
  React.useEffect(() => {
    if (
      offentligTp?.muligeTpLeverandoerListe &&
      offentligTp.muligeTpLeverandoerListe.length > 0
    ) {
      const joinedLeverandoerer =
        offentligTp?.muligeTpLeverandoerListe.join(', ')
      setleverandoererString(joinedLeverandoerer)
    }
  }, [offentligTp])

  const subHeadingLevel = React.useMemo(() => {
    return headingLevel
      ? ((
          parseInt(headingLevel as string, 10) + 1
        ).toString() as HeadingProps['level'])
      : '4'
  }, [headingLevel])

  const infoOmAfpOgBetingetTjenestepensjon = React.useMemo(() => {
    if (afp === 'ja_offentlig' || afp === 'ja_privat') {
      return 'pensjonsavtaler.offentligtp.afp_ja'
    } else if (afp === 'vet_ikke') {
      return 'pensjonsavtaler.offentligtp.afp_vet_ikke'
    } else {
      if (
        offentligTp?.simulertTjenestepensjon?.simuleringsresultat
          .betingetTjenestepensjonErInkludert
      ) {
        return 'pensjonsavtaler.offentligtp.afp_nei.med_betinget'
      } else {
        return 'pensjonsavtaler.offentligtp.afp_nei.uten_betinget'
      }
    }
  }, [afp, offentligTp])

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

  // Når brukeren ikke har noe tp-medlemskap ikke vis noe som helst
  if (
    !isLoading &&
    !isError &&
    offentligTp?.muligeTpLeverandoerListe.length === 0
  ) {
    return
  }

  return (
    <VStack gap="3">
      {showDivider && <Divider smallMargin />}
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.offentligtp.title' })}
      </Heading>

      {tpOffentligFeatureToggle?.enabled ? (
        <>
          {isMobile ? (
            <>
              <Heading
                id="tpo-subheading"
                level={subHeadingLevel}
                size="xsmall"
              >
                {intl.formatMessage({
                  id: 'pensjonsavtaler.offentligtp.subtitle.spk',
                })}
              </Heading>
              <table
                className={styles.mobileTable}
                data-testid="offentlig-tjenestepensjon-mobile"
              >
                <tbody>
                  {offentligTp?.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.map(
                    (utbetalingsperiode: UtbetalingsperiodeWithoutGrad) => (
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
                {offentligTp?.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.map(
                  (utbetalingsperiode: UtbetalingsperiodeWithoutGrad, i) => {
                    const isLastRow =
                      (offentligTp?.simulertTjenestepensjon?.simuleringsresultat
                        .utbetalingsperioder.length ?? 0) -
                        1 >
                      i
                    return (
                      <Table.Row
                        shadeOnHover={false}
                        key={`${JSON.stringify(utbetalingsperiode)}-row`}
                      >
                        {i === 0 && (
                          <Table.HeaderCell
                            scope="row"
                            className={styles.desktopTableRader__alignTop}
                            rowSpan={
                              offentligTp?.simulertTjenestepensjon
                                ?.simuleringsresultat.utbetalingsperioder.length
                            }
                          >
                            {intl.formatMessage({
                              id: 'pensjonsavtaler.offentligtp.subtitle.spk',
                            })}
                          </Table.HeaderCell>
                        )}
                        <Table.DataCell
                          className={clsx({
                            [styles.desktopTableRader__noBottomBorder]:
                              isLastRow,
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
                            [styles.desktopTableRader__noBottomBorder]:
                              isLastRow,
                          })}
                        >
                          {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                          kr
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
              id={infoOmAfpOgBetingetTjenestepensjon}
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        </>
      ) : (
        <div className={styles.info}>
          <ExclamationmarkTriangleFillIcon
            className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.infoText}>
            {
              //  Ved feil vis feilmelding om tp-offentlig
              isError && (
                <FormattedMessage id="pensjonsavtaler.offentligtp.error" />
              )
            }
            {
              //  Ved success vis info om at brukeren kan ha rett på tp-offentlig
              !isError &&
                offentligTp?.muligeTpLeverandoerListe &&
                offentligTp.muligeTpLeverandoerListe.length > 0 && (
                  <FormattedMessage
                    id="pensjonsavtaler.offentligtp.er_medlem"
                    values={{
                      chunk: leverandoererString,
                    }}
                  />
                )
            }
          </BodyLong>
        </div>
      )}
    </VStack>
  )
}
