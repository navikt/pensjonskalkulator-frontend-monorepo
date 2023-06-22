import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { AFP } from './sections/AFP'
import { Alderspensjon } from './sections/Alderspensjon'
import { Inntekt } from './sections/Inntekt'
import { Pensjonsavtaler } from './sections/Pensjonsavtaler'
import { Sivilstand } from './sections/Sivilstand'
import { TidligstMuligUttak } from './sections/TidligstMuligUttak'
import { Uttaksgrad } from './sections/Uttaksgrad'
import { Utenlandsopphold } from './sections/Utenlandsopphold'
import { SectionSkeleton } from './sections/components/SectionSkeleton'
import { useGetPensjonsavtalerQuery } from '@/state/api/apiSlice'

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

export function Grunnlag({ tidligstMuligUttak }: Props) {
  const inntekt = useInntekt()
  const alderspensjon = useAlderspensjon()
  const uttaksgrad = useUttaksgrad()
  const {
    data: pensjonsavtaler,
    isSuccess,
    isLoading,
  } = useGetPensjonsavtalerQuery()

  return (
    <Card className={styles.section}>
      <div className={styles.description}>
        <Heading level="2" size="medium">
          Grunnlaget for prognosen
        </Heading>
        <BodyLong>
          Alle summer er oppgitt i dagens kroneverdi før skatt.
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
        {isLoading && <SectionSkeleton />}
        {isSuccess && <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />}
      </Accordion>
    </Card>
  )
}
