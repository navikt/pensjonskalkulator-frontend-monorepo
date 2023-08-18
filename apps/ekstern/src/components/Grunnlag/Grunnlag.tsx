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

const useInntekt = (): number => {
  return 543031
}

const useAlderspensjon = (): number => {
  return 204573
}

const useUttaksgrad = (): number => {
  return 100
}

interface Props {
  tidligstMuligUttak: Uttaksalder
}

// TODO refaktorere og koble til faktisk data
export function Grunnlag({ tidligstMuligUttak }: Props) {
  const inntekt = useInntekt()
  const alderspensjon = useAlderspensjon()
  const uttaksgrad = useUttaksgrad()

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
        <Uttaksgrad uttaksgrad={uttaksgrad} />
        <Inntekt inntekt={inntekt} />
        <Sivilstand />
        <Utenlandsopphold />
        <Alderspensjon alderspensjon={alderspensjon} />
        <AFP />
        <Pensjonsavtaler />
      </Accordion>
    </section>
  )
}
