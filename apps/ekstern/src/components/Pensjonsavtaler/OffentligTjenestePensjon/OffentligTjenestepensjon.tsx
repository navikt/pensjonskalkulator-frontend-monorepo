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
import { useGetOtpKlpFeatureToggleQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectAfp } from '@/state/userInput/selectors'
import type { Translations } from '@/translations/nb'
import {
  formaterLivsvarigString,
  formaterSluttAlderString,
} from '@/utils/alder'
import { formatInntekt } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import styles from './OffentligTjenestepensjon.module.scss'

const leverandørMessageKeyMap = {
  'Statens pensjonskasse': 'pensjonsavtaler.offentligtp.subtitle.spk',
  'Kommunal Landspensjonskasse': 'pensjonsavtaler.offentligtp.subtitle.klp',
}

export const OffentligTjenestepensjon = (props: {
  isLoading: boolean
  isError: boolean
  offentligTp?: OffentligTp
  headingLevel: Exclude<HeadingProps['level'], undefined>
}) => {
  const { isLoading, isError, offentligTp, headingLevel } = props
  const tpLeverandør = offentligTp?.simulertTjenestepensjon?.tpLeverandoer
  const intl = useIntl()
  const isMobile = useIsMobile()
  const afp = useAppSelector(selectAfp)

  const { data: otpKlpFeatureToggle } = useGetOtpKlpFeatureToggleQuery()

  const subHeadingLevel = React.useMemo(() => {
    return (
      parseInt(headingLevel as string, 10) + 1
    ).toString() as HeadingProps['level']
  }, [headingLevel])

  const infoOmAfpOgBetingetTjenestepensjon: keyof Translations = (() => {
    if (tpLeverandør === 'Kommunal Landspensjonskasse') {
      if (afp === 'ja_offentlig' || afp === 'ja_privat') {
        return 'pensjonsavtaler.offentligtp.klp.afp_ja'
      }
      return 'pensjonsavtaler.offentligtp.klp.afp_nei+vetikke'
    }

    // SPK
    if (afp === 'ja_offentlig' || afp === 'ja_privat') {
      return 'pensjonsavtaler.offentligtp.spk.afp_ja'
    } else if (afp === 'vet_ikke') {
      return 'pensjonsavtaler.offentligtp.spk.afp_vet_ikke'
    } else {
      if (
        offentligTp?.simulertTjenestepensjon?.simuleringsresultat
          .betingetTjenestepensjonErInkludert
      ) {
        return 'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget'
      } else {
        return 'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget'
      }
    }
  })()

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

  const visResultat =
    offentligTp?.simuleringsresultatStatus === 'OK' &&
    offentligTp.simulertTjenestepensjon !== undefined &&
    (tpLeverandør === 'Statens pensjonskasse' ||
      (otpKlpFeatureToggle?.enabled &&
        tpLeverandør === 'Kommunal Landspensjonskasse'))

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
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.error"
              values={getFormatMessageValues(intl)}
            />
          </Alert>
        )
      }
      {
        // Når brukeren ikke er medlem av noe offentlig tp-ordning
        offentligTp?.simuleringsresultatStatus ===
          'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING' && (
          <Alert inline variant="info">
            <FormattedMessage
              id="pensjonsavtaler.ingress.ingen"
              values={getFormatMessageValues(intl)}
            />
          </Alert>
        )
      }
      {
        // Når brukeren er medlem av en annen ordning
        (offentligTp?.simuleringsresultatStatus ===
          'TP_ORDNING_STOETTES_IKKE' ||
          (offentligTp?.simuleringsresultatStatus === 'OK' &&
            !visResultat)) && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.er_medlem_annen_ordning"
              values={{
                chunk: offentligTp.muligeTpLeverandoerListe.join(', '),
              }}
            />
          </Alert>
        )
      }
      {
        // Ved feil hos SPK
        offentligTp?.simuleringsresultatStatus === 'TEKNISK_FEIL' && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.spk_error"
              values={getFormatMessageValues(intl)}
            />
          </Alert>
        )
      }
      {
        // Ved tomt svar hos SPK
        offentligTp?.simuleringsresultatStatus ===
          'TOM_SIMULERING_FRA_TP_ORDNING' && (
          <Alert inline variant="warning">
            <FormattedMessage
              id="pensjonsavtaler.offentligtp.spk_empty"
              values={getFormatMessageValues(intl)}
            />
          </Alert>
        )
      }

      {visResultat && (
        <>
          {isMobile ? (
            <>
              <Heading
                id="tpo-subheading"
                level={subHeadingLevel}
                size="xsmall"
              >
                {intl.formatMessage({
                  id: leverandørMessageKeyMap[tpLeverandør],
                })}
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
                            {intl.formatMessage({
                              id: leverandørMessageKeyMap[tpLeverandør],
                            })}
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
              id={infoOmAfpOgBetingetTjenestepensjon}
              values={getFormatMessageValues(intl)}
            />
          </BodyLong>
        </>
      )}
    </VStack>
  )
}
