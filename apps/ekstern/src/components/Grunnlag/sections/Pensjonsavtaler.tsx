import React from 'react'

import { Accordion, BodyLong, BodyShort, Link } from '@navikt/ds-react'

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
        <div className={styles.pensjonsavtaler}>
          <BodyShort>Pensjonsavtale</BodyShort>
          <BodyShort>Årlig utbetaling</BodyShort>
          {pensjonsavtaler.map((avtale, i) => (
            <React.Fragment key={i}>
              <div className={styles.pensjonsavtale}>
                <BodyShort>{capitalize(avtale.type)}</BodyShort>
                <BodyShort size="small">Fra {avtale.fra}</BodyShort>
                <BodyShort size="small">
                  {avtale.utbetalesTilAlder
                    ? `Utbetales fra ${avtale.utbetalesFraAlder} til ${avtale.utbetalesTilAlder} år`
                    : `Livsvarig utbetaling fra ${avtale.utbetalesFraAlder} år`}
                </BodyShort>
              </div>
              <BodyShort>
                {formatAsDecimal(avtale.aarligUtbetaling)} kr
              </BodyShort>
            </React.Fragment>
          ))}
        </div>
        <br />
        <BodyLong>
          Alle private avtaler er hentet fra{' '}
          <Link href="https://norskpensjon.no/">Norsk Pensjon</Link>. Du kan ha
          andre avtaler enn det som finnes i Norsk Pensjon. Kontakt aktuell
          pensjonsordning.
        </BodyLong>
      </Accordion.Content>
    </Accordion.Item>
  )
}
