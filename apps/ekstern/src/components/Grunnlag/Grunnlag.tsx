import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { AFP } from './sections/AFP'
import { Alderspensjon } from './sections/Alderspensjon'
import { Inntekt } from './sections/Inntekt'
import { Pensjonsavtaler } from './sections/Pensjonsavtaler'
import { Sivilstand } from './sections/Sivilstand'
import { TidligstMuligUttak } from './sections/TidligstMuligUttak'
import { Utenlandsopphold } from './sections/Utenlandsopphold'
import { Uttaksgrad } from './sections/Uttaksgrad'

import styles from './Grunnlag.module.scss'

interface Props {
  tidligstMuligUttak: Uttaksalder
}

// TODO refaktorere og koble til inntekt data
export function Grunnlag({ tidligstMuligUttak }: Props) {
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
        <TidligstMuligUttak uttaksalder={tidligstMuligUttak} />
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
