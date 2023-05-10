import React from 'react'

import { Accordion, BodyLong, BodyShort, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { groupPensjonsavtalerByType } from '@/components/Grunnlag/sections/Pensjonsavtaler-utils'
import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'

import { SectionHeader } from './components/SectionHeader'

import styles from './Pensjonsavtaler.module.scss'

interface Props {
  pensjonsavtaler: Pensjonsavtale[]
}

export function Pensjonsavtaler({ pensjonsavtaler }: Props) {
  if (pensjonsavtaler.length === 0) {
    return null
  }

  return (
    <Accordion.Item>
      <SectionHeader
        label="Pensjonsavtaler"
        value={`${pensjonsavtaler.length}`}
      />
      <Accordion.Content>
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
            {Object.entries(groupPensjonsavtalerByType(pensjonsavtaler)).map(
              ([avtaleType, avtaler]) => (
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
                        <BodyShort>Fra {avtale.fra}</BodyShort>
                        <BodyShort className={styles.utbetaling}>
                          {avtale.utbetalesTilAlder
                            ? `Utbetales fra ${avtale.utbetalesFraAlder} til ${avtale.utbetalesTilAlder} år`
                            : `Livsvarig utbetaling fra ${avtale.utbetalesFraAlder} år`}
                        </BodyShort>
                      </td>
                      <td
                        className={clsx(
                          styles.tabellCell,
                          styles.tabellCell__Right
                        )}
                      >
                        <BodyShort>
                          {formatAsDecimal(avtale.aarligUtbetaling)} kr
                        </BodyShort>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            )}
          </tbody>
        </table>
        <BodyLong className={styles.paragraph} size="small">
          Alle avtaler i privat sektor er hentet fra{' '}
          <Link href="https://norskpensjon.no/">Norsk Pensjon</Link>. Du kan ha
          andre avtaler enn det som finnes i Norsk Pensjon. Kontakt aktuell
          pensjonsordning.
        </BodyLong>
      </Accordion.Content>
    </Accordion.Item>
  )
}
