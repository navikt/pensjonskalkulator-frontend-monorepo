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
}) => {
  const { isLoading, isError, offentligTp, headingLevel } = props
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
  }, [
    afp,
    offentligTp?.simulertTjenestepensjon?.simuleringsresultat
      .betingetTjenestepensjonErInkludert,
  ])

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

  return (
    <VStack gap="3">
      <Divider smallMargin />
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.offentligtp.title' })}
      </Heading>
      {
        // Ved feil når /simuler-oftp kalles
        !isLoading && isError && (
          <Alert inline variant="warning">
            <FormattedMessage id="pensjonsavtaler.offentligtp.error" />
          </Alert>
        )
      }
      {
        // Når brukeren ikke er medlem av noe offentlig tp-ordning
        (offentligTp?.simuleringsresultatStatus ===
          'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING' ||
          (!isLoading &&
            !isError &&
            offentligTp?.muligeTpLeverandoerListe.length === 0)) && (
          <Alert inline variant="info">
            <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
          </Alert>
        )
      }
      {
        // Når brukeren er medlem av en annen ordning
        (tpOffentligFeatureToggle?.enabled &&
          offentligTp?.simuleringsresultatStatus ===
            'TP_ORDNING_STOETTES_IKKE') ||
          (!tpOffentligFeatureToggle?.enabled &&
            !isError &&
            offentligTp?.muligeTpLeverandoerListe &&
            offentligTp.muligeTpLeverandoerListe.length > 0 && (
              <Alert inline variant="warning">
                <FormattedMessage
                  id="pensjonsavtaler.offentligtp.er_medlem_annen_ordning"
                  values={{
                    chunk: leverandoererString,
                  }}
                />
              </Alert>
            ))
      }
      {
        // Ved feil hos SPK
        tpOffentligFeatureToggle?.enabled &&
          offentligTp?.simuleringsresultatStatus === 'TEKNISK_FEIL' && (
            <Alert inline variant="warning">
              <FormattedMessage id="pensjonsavtaler.offentligtp.spk_error" />
            </Alert>
          )
      }
      {
        // Ved tomt svar hos SPK
        tpOffentligFeatureToggle?.enabled &&
          offentligTp?.simuleringsresultatStatus ===
            'TOM_SIMULERING_FRA_TP_ORDNING' && (
            <Alert inline variant="warning">
              <FormattedMessage id="pensjonsavtaler.offentligtp.spk_empty" />
            </Alert>
          )
      }

      {tpOffentligFeatureToggle?.enabled &&
        offentligTp?.simuleringsresultatStatus === 'OK' && (
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
                        <tr
                          key={`${JSON.stringify(utbetalingsperiode)}-mobile`}
                        >
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
                        (offentligTp?.simulertTjenestepensjon
                          ?.simuleringsresultat.utbetalingsperioder.length ??
                          0) -
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
                                  ?.simuleringsresultat.utbetalingsperioder
                                  .length
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
        )}
    </VStack>
  )
}
