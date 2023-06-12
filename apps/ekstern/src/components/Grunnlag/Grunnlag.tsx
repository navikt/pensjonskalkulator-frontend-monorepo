import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { AFP } from '@/components/Grunnlag/accordion-items/AFP'
import { Alderspensjon } from '@/components/Grunnlag/accordion-items/Alderspensjon'
import { Inntekt } from '@/components/Grunnlag/accordion-items/Inntekt'
import { Pensjonsavtaler } from '@/components/Grunnlag/accordion-items/Pensjonsavtaler'
import { Sivilstand } from '@/components/Grunnlag/accordion-items/Sivilstand'
import { TidligstMuligUttak } from '@/components/Grunnlag/accordion-items/TidligstMuligUttak'
import { Uttaksgrad } from '@/components/Grunnlag/accordion-items/Uttaksgrad'
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
  const { data: pensjonsavtaler, isSuccess } = useGetPensjonsavtalerQuery()
  const uttaksgrad = useUttaksgrad()
  {
    // TODO skrive tester
    // TODO bør vi vise en feilmelding her dersom pensjonsvtalene ikke kunne hentes?
  }
  return (
    <Card className={styles.section}>
      <Heading level="2" size="medium">
        Grunnlaget for prognosen
      </Heading>
      <BodyLong>Alle summer er oppgitt i dagens kroneverdi før skatt.</BodyLong>
      <Accordion>
        <TidligstMuligUttak uttaksalder={tidligstMuligUttak} />
        <Uttaksgrad uttaksgrad={uttaksgrad} />
        <Inntekt inntekt={inntekt} />
        <Sivilstand />
        <Alderspensjon alderspensjon={alderspensjon} />
        <AFP />
        {/* c8 ignore next 3 */}
        {isSuccess && <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />}
      </Accordion>
    </Card>
  )
}
