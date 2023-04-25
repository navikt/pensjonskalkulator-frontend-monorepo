import React from 'react'

import { Accordion, BodyLong, Heading, Link } from '@navikt/ds-react'

import { AFP } from '@/components/Grunnlag/sections/AFP'
import { Alderspensjon } from '@/components/Grunnlag/sections/Alderspensjon'
import { Inntekt } from '@/components/Grunnlag/sections/Inntekt'
import { Pensjonsavtaler } from '@/components/Grunnlag/sections/Pensjonsavtaler'
import { Sivilstand } from '@/components/Grunnlag/sections/Sivilstand'
import { TidligstMuligUttak } from '@/components/Grunnlag/sections/TidligstMuligUttak'
import { Uttaksgrad } from '@/components/Grunnlag/sections/Uttaksgrad'

import styles from './Grunnlag.module.scss'

const useInntekt = (): number => {
  return 543031
}

const useAlderspensjon = (): number => {
  return 204573
}

const usePensjonsavtaler = (): Pensjonsavtale[] => {
  return [
    {
      type: 'tjenestepensjon',
      fra: 'Nordea Liv',
      utbetalesFraAlder: 67,
      utbetalesTilAlder: 77,
      aarligUtbetaling: 231298,
    },
    {
      type: 'tjenestepensjon',
      fra: 'Storebrand',
      utbetalesFraAlder: 67,
      utbetalesTilAlder: 77,
      aarligUtbetaling: 39582,
    },
    {
      type: 'fripolise',
      fra: 'DNB',
      utbetalesFraAlder: 67,
      utbetalesTilAlder: 77,
      aarligUtbetaling: 37264,
    },
    {
      type: 'offentlig tjenestepensjon',
      fra: 'Oslo Pensjonsforsikring',
      utbetalesFraAlder: 67,
      aarligUtbetaling: 103264,
    },
  ]
}

const useUttaksgrad = (): number => {
  return 100
}

const useSivilstand = (): Sivilstand => {
  return {
    gift: false,
    samboer: false,
  }
}

interface Props {
  tidligstMuligUttak: Uttaksalder
}

export function Grunnlag({ tidligstMuligUttak }: Props) {
  const inntekt = useInntekt()
  const alderspensjon = useAlderspensjon()
  const pensjonsavtaler = usePensjonsavtaler()
  const uttaksgrad = useUttaksgrad()
  const sivilstand = useSivilstand()

  return (
    <section className={styles.section}>
      <section>
        <Heading level="2" size="medium">
          Grunnlaget for prognosen
        </Heading>
        <BodyLong>
          Alle summer er oppgitt i dagens kroneverdi før skatt
        </BodyLong>
      </section>

      <section>
        <Heading level="3" size="medium">
          Forbehold
        </Heading>
        <BodyLong>
          Pensjonen er beregnet med de opplysningene vi har om deg, i tillegg
          til de opplysningene du har oppgitt selv, på tidspunktet for
          beregningen. Dette er derfor en foreløpig beregning av hva du kan
          forvente deg i pensjon. Pensjonsberegningen er vist i dagens
          kroneverdi før skatt. Beregningen er ikke juridisk bindende.
        </BodyLong>
        <Link>Alle forbehold</Link>
      </section>

      <section>
        <Accordion>
          <Inntekt inntekt={inntekt} />
          <Alderspensjon alderspensjon={alderspensjon} />
          <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />
          <Uttaksgrad uttaksgrad={uttaksgrad} />
          <Sivilstand sivilstand={sivilstand} />
          <AFP />
          <TidligstMuligUttak uttak={tidligstMuligUttak} />
        </Accordion>
      </section>
    </section>
  )
}
