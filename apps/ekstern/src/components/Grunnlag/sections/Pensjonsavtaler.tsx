import React from 'react'
import { useNavigate } from 'react-router-dom'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { Accordion, BodyLong, BodyShort, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'

import { SectionContent } from './components/SectionContent'
import { SectionHeader } from './components/SectionHeader'
import {
  groupPensjonsavtalerByType,
  getPensjonsavtalerTittel,
  getMaanedString,
} from './utils'

import styles from './Pensjonsavtaler.module.scss'

interface Props {
  pensjonsavtaler: Pensjonsavtale[]
  showError: boolean
}

export function Pensjonsavtaler({ pensjonsavtaler, showError }: Props) {
  const navigate = useNavigate()
  const harSamtykket = useAppSelector(selectSamtykke)

  if (!showError && pensjonsavtaler.length === 0) {
    return null
  }

  // PEK-97 TODO håndtere delvis reponse fra backend
  return (
    <Accordion.Item data-testid="pensjonsavtaler">
      <SectionHeader
        label="Pensjonsavtaler"
        value={getPensjonsavtalerTittel(
          !!harSamtykket,
          showError,
          `${pensjonsavtaler.length}`
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
        {showError && (
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
        {harSamtykket && !showError && (
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
                    Årlig utbetaling
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
                    {avtaler.map((avtale, i) => (
                      <tr key={i}>
                        <td className={styles.tabellCell}>
                          <BodyShort>Fra {avtale.produktbetegnelse}</BodyShort>
                          <BodyShort className={styles.utbetaling}>
                            {avtale.utbetalingsperiode.sluttAlder
                              ? `Utbetales fra ${
                                  avtale.utbetalingsperiode.startAlder
                                } år ${getMaanedString(
                                  avtale.utbetalingsperiode.startMaaned
                                )} til ${
                                  avtale.utbetalingsperiode.sluttAlder
                                } år ${getMaanedString(
                                  avtale.utbetalingsperiode.sluttMaaned
                                )}`
                              : `Livsvarig utbetaling fra ${
                                  avtale.utbetalingsperiode.startAlder
                                } år ${getMaanedString(
                                  avtale.utbetalingsperiode.startMaaned
                                )}`}
                          </BodyShort>
                        </td>
                        <td
                          className={clsx(
                            styles.tabellCell,
                            styles.tabellCell__Right
                          )}
                        >
                          <BodyShort>
                            {formatAsDecimal(
                              avtale.utbetalingsperiode.aarligUtbetaling
                            )}
                            kr
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
