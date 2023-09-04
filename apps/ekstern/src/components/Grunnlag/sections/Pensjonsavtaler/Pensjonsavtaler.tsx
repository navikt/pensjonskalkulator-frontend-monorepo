import React from 'react'
import { useNavigate } from 'react-router-dom'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { Accordion, BodyLong, BodyShort, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { SectionContent } from '../components/SectionContent'
import { SectionHeader } from '../components/SectionHeader'
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

import styles from './Pensjonsavtaler.module.scss'

export function Pensjonsavtaler() {
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
      aar: startAlder ?? 0,
      maaned: startMaaned ?? 0,
    }),
    {
      skip: !harSamtykket || !startAlder,
    }
  )

  // PEK-97 TODO håndtere delvis reponse fra backend
  return (
    <Accordion.Item data-testid="pensjonsavtaler">
      <SectionHeader
        label="Pensjonsavtaler"
        isLoading={isLoading}
        value={getPensjonsavtalerTittel(
          !!harSamtykket,
          isError,
          `${pensjonsavtaler?.length}`
        )}
      />
      <SectionContent>
        {!harSamtykket && (
          <BodyLong>
            Du har ikke samtykket til å hente inn pensjonsavtaler om
            tjenestepensjon.{' '}
            <Link onClick={() => navigate('/start')}>
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
                ).map(([avtaleType, avtaler]) => (
                  <React.Fragment key={avtaleType}>
                    <tr>
                      <td colSpan={2} className={styles.tabellCell}>
                        <BodyShort className={styles.mellomtittel}>
                          {capitalize(avtaleType)}
                        </BodyShort>
                      </td>
                    </tr>
                    {avtaler.map((avtale) => (
                      <tr key={avtale.key}>
                        <td className={styles.tabellCell}>
                          <BodyShort>Fra {avtale.produktbetegnelse}</BodyShort>

                          {avtale.utbetalingsperioder.map(
                            (utbetalingsperiode) => {
                              return (
                                <BodyShort className={styles.utbetaling}>
                                  {utbetalingsperiode.sluttAlder
                                    ? `${formatAsDecimal(
                                        utbetalingsperiode.aarligUtbetaling
                                      )} kr utbetales fra
                                  ${
                                    utbetalingsperiode.startAlder
                                  } år ${getMaanedString(
                                    utbetalingsperiode.startMaaned
                                  )} til ${
                                    utbetalingsperiode.sluttAlder
                                  } år ${getMaanedString(
                                    utbetalingsperiode.sluttMaaned
                                  )}.`
                                    : `Livsvarig utbetaling fra ${
                                        utbetalingsperiode.startAlder
                                      } år ${getMaanedString(
                                        utbetalingsperiode.startMaaned
                                      )}.`}
                                </BodyShort>
                              )
                            }
                          )}
                        </td>
                        <td
                          className={clsx(
                            styles.tabellCell,
                            styles.tabellCell__Right
                          )}
                        >
                          <BodyShort>
                            {`${formatAsDecimal(
                              avtale.utbetalingsperioder.reduce(function (
                                acc,
                                v
                              ) {
                                return acc + v.aarligUtbetaling
                              }, 0)
                            )} kr`}
                          </BodyShort>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <BodyLong className={styles.paragraph} size="small">
              Alle avtaler i privat sektor er hentet fra{' '}
              <Link href="https://norskpensjon.no/">Norsk Pensjon</Link>. Du kan
              ha andre avtaler enn det som finnes i Norsk Pensjon. Kontakt
              aktuell pensjonsordning.
            </BodyLong>
          </>
        )}
      </SectionContent>
    </Accordion.Item>
  )
}
