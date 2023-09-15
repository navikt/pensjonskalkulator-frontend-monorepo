import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { Accordion, BodyLong, BodyShort } from '@navikt/ds-react'
import clsx from 'clsx'

import { GrunnlagSection } from '../GrunnlagSection'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'
import { formatMessageValues } from '@/utils/translations'

import { groupPensjonsavtalerByType, getMaanedString } from './utils'

import styles from './GrunnlagPensjonsavtaler.module.scss'

// TODO legge til key
export function GrunnlagPensjonsavtaler() {
  const intl = useIntl()
  const harSamtykket = useAppSelector(selectSamtykke)
  const { startAlder, startMaaned } = useAppSelector(selectCurrentSimulation)

  const {
    data: pensjonsavtaler,
    isLoading,
    isError,
    isSuccess,
  } = usePensjonsavtalerQuery(
    generatePensjonsavtalerRequestBody({
      aar: startAlder as number,
      maaned: startMaaned ?? 1,
    }),
    {
      skip: !harSamtykket || !startAlder,
    }
  )

  // PEK-97 TODO håndtere delvis reponse fra backend
  return (
    <Accordion.Item data-testid="pensjonsavtaler">
      <GrunnlagSection
        headerTitle={intl.formatMessage({
          id: 'grunnlag.pensjonsavtaler.title',
        })}
        headerValue={
          !harSamtykket
            ? intl.formatMessage({
                id: 'grunnlag.pensjonsavtaler.title.error.samtykke',
              })
            : isError
            ? intl.formatMessage({
                id: 'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler',
              })
            : `${pensjonsavtaler?.length}`
        }
        isLoading={isLoading}
      >
        <>
          {!harSamtykket && (
            <BodyLong>
              <FormattedMessage
                id="grunnlag.pensjonsavtaler.ingress.error.samtykke"
                values={{
                  ...formatMessageValues,
                }}
              />
            </BodyLong>
          )}
          {isError && (
            <div className={styles.error}>
              <ExclamationmarkTriangleFillIcon
                className={styles.errorIcon}
                fontSize="1.5rem"
              />
              <BodyLong className={styles.errorText}>
                <FormattedMessage id="grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler" />
              </BodyLong>
            </div>
          )}
          {harSamtykket && isSuccess && (
            <>
              <table className={styles.tabell}>
                <thead>
                  <tr>
                    <th className={styles.tabellHeader}>
                      <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.left" />
                    </th>
                    <th
                      className={clsx(
                        styles.tabellHeader,
                        styles.tabellHeader__Right
                      )}
                    >
                      <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.right" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    groupPensjonsavtalerByType(pensjonsavtaler)
                  ).map(([avtaleType, avtaler], i) => (
                    <React.Fragment key={`table-left-${avtaleType}`}>
                      <tr>
                        <td colSpan={2}>
                          <BodyShort
                            className={clsx(styles.tabellMellomtittel, {
                              [styles.tabellMellomtittel__First]: i < 1,
                            })}
                          >
                            {capitalize(avtaleType)}
                          </BodyShort>
                        </td>
                      </tr>
                      {avtaler.map((avtale) => (
                        <React.Fragment key={`table-right-${avtale.key}`}>
                          <tr>
                            <td colSpan={2}>
                              <BodyShort className={styles.tabellSubtittel}>
                                {avtale.produktbetegnelse}
                              </BodyShort>
                            </td>
                          </tr>
                          {avtale.utbetalingsperioder.map(
                            (utbetalingsperiode) => {
                              return (
                                <tr
                                  key={`${avtale.key}-${utbetalingsperiode.startAlder}-${utbetalingsperiode.startMaaned}`}
                                >
                                  <td className={styles.tabellCell__Small}>
                                    {utbetalingsperiode.sluttAlder
                                      ? `Fra ${
                                          utbetalingsperiode.startAlder
                                        } år${getMaanedString(
                                          utbetalingsperiode.startMaaned
                                        )} til ${
                                          utbetalingsperiode.sluttAlder
                                        } år${
                                          utbetalingsperiode.sluttMaaned &&
                                          utbetalingsperiode.sluttMaaned > 1
                                            ? getMaanedString(
                                                utbetalingsperiode.sluttMaaned
                                              )
                                            : ''
                                        }`
                                      : `Livsvarig fra ${
                                          utbetalingsperiode.startAlder
                                        } år${
                                          utbetalingsperiode.startMaaned > 1
                                            ? getMaanedString(
                                                utbetalingsperiode.startMaaned
                                              )
                                            : ''
                                        }`}
                                  </td>
                                  <td
                                    className={clsx(
                                      styles.tabellCell__Small,
                                      styles.tabellCell__Right
                                    )}
                                  >
                                    {`${formatAsDecimal(
                                      utbetalingsperiode.aarligUtbetaling
                                    )} kr`}
                                  </td>
                                </tr>
                              )
                            }
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <BodyLong className={styles.paragraph} size="small">
                <FormattedMessage
                  id="grunnlag.pensjonsavtaler.ingress"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </BodyLong>
            </>
          )}
        </>
      </GrunnlagSection>
    </Accordion.Item>
  )
}
