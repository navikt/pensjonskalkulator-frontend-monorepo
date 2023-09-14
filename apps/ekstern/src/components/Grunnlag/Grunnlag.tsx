import { Accordion, BodyLong, Heading, Link } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import { AFP } from './sections/AFP'
import { Alderspensjon } from './sections/Alderspensjon'
import { SectionContent } from './sections/components/SectionContent'
import { SectionHeader } from './sections/components/SectionHeader'
import { Inntekt } from './sections/Inntekt'
import { Pensjonsavtaler } from './sections/Pensjonsavtaler'
import { Sivilstand } from './sections/Sivilstand'
import { Utenlandsopphold } from './sections/Utenlandsopphold'
import { Uttaksgrad } from './sections/Uttaksgrad'

import styles from './Grunnlag.module.scss'
interface Props {
  tidligstMuligUttak?: Uttaksalder | UttaksalderForenklet
}

// TODO refaktorere og koble til inntekt data
export const Grunnlag: React.FC<Props> = ({ tidligstMuligUttak }) => {
  return (
    <section className={styles.section}>
      <div className={styles.description}>
        <Heading level="2" size="medium">
          Grunnlaget for beregningen
        </Heading>
        <BodyLong>
          Pensjonsberegningen er gjort med dagens regelverk og er vist i dagens
          kroneverdi før skatt.
        </BodyLong>
      </div>
      <Accordion>
        <AccordionItem name="Grunnlag: Tidligst mulig uttak">
          <SectionHeader
            label="Tidligst mulig uttak"
            value={
              tidligstMuligUttak
                ? formatUttaksalder(tidligstMuligUttak, { compact: true })
                : 'Ikke funnet'
            }
          />
          <SectionContent>
            {!tidligstMuligUttak && (
              <BodyLong>
                Vi klarte ikke å finne tidspunkt for når du tidligst kan ta ut
                alderspensjon. Prøv igjen senere.
                <br /> <br />
              </BodyLong>
            )}
            <BodyLong>
              For å starte uttak før 67 år må opptjeningen være høy nok. Alle
              kan derfor ikke starte uttak ved 62 år. Tidspunktet er et estimat
              på når du tidligst kan ta ut 100 % alderspensjon. I{' '}
              <Link href="https://www.nav.no/pselv/simulering.jsf">
                detaljert kalkulator
              </Link>{' '}
              kan du sjekke om du kan ta ut alderspensjon tidligere med en
              lavere uttaksgrad.
              <br />
              <br />
              Når du velger uttaksalder, bruker vi måneden etter du fyller år.
              Velger du for eksempel 62 år, betyr det måneden etter du fyller 62
              år.
            </BodyLong>
          </SectionContent>
        </AccordionItem>
        <Uttaksgrad uttaksgrad={100} />
        <Inntekt inntekt={0} />
        <Sivilstand />
        <Utenlandsopphold />
        <Alderspensjon />
        <AFP />
        <Pensjonsavtaler />
      </Accordion>
    </section>
  )
}
