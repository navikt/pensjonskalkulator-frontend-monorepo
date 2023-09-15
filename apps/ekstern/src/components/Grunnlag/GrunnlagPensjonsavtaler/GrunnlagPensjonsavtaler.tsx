import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { Accordion, BodyLong, BodyShort, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { GrunnlagSection } from '../GrunnlagSection'
import { paths } from '@/router'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'

import {
  groupPensjonsavtalerByType,
  getPensjonsavtalerTittel,
  getMaanedString,
} from './utils'

import styles from './GrunnlagPensjonsavtaler.module.scss'

// TODO legge til key
// TODO legge til tekster i nb fila
export function GrunnlagPensjonsavtaler() {
  const intl = useIntl()
  const navigate = useNavigate()
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
        headerValue={getPensjonsavtalerTittel(
          !!harSamtykket,
          isError,
          `${pensjonsavtaler?.length}`
        )}
        isLoading={isLoading}
      >
        <>
          {!harSamtykket && (
            <BodyLong>
              Du har ikke samtykket til å hente inn pensjonsavtaler om
              tjenestepensjon.{' '}
              <Link onClick={() => navigate(paths.start)}>
                Start en ny beregning
              </Link>{' '}
              dersom du ønsker å få dette i beregningen.
            </BodyLong>
          )}
          {isError && (
            <div className={styles.error}>
              <ExclamationmarkTriangleFillIcon
                className={styles.errorIcon}
                fontSize="1.5rem"
              />
              <BodyLong className={styles.errorText}>
                Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon.
                Prøv igjen senere.
              </BodyLong>
            </div>
          )}
          {harSamtykket && isSuccess && (
            <>
              <table className={styles.tabell}>
                <thead>
                  <tr>
                    <th className={styles.tabellHeader}>Pensjonsavtale</th>
                    <th
                      className={clsx(
                        styles.tabellHeader,
                        styles.tabellHeader__Right
                      )}
                    >
                      Årlig beløp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    groupPensjonsavtalerByType(pensjonsavtaler)
                  ).map(([avtaleType, avtaler], i) => (
                    <React.Fragment key={avtaleType}>
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
                        <>
                          <tr key={avtale.key}>
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
                                  key={`${utbetalingsperiode.startAlder}-${utbetalingsperiode.startMaaned}`}
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
                        </>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <BodyLong className={styles.paragraph} size="small">
                Alle avtaler i privat sektor er hentet fra{' '}
                <Link href="https://norskpensjon.no/">Norsk Pensjon</Link>. Du
                kan ha andre avtaler enn det som finnes i Norsk Pensjon. Kontakt
                aktuell pensjonsordning.
                <br />
                <br />
                Vi kan ikke hente pensjonsavtaler fra offentlig sektor. Sjekk
                aktuell tjenestepensjonsordning.
              </BodyLong>
            </>
          )}
        </>
      </GrunnlagSection>
    </Accordion.Item>
  )
}
