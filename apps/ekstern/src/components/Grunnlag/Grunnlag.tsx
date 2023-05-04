import React from 'react'

import { Accordion, BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/Card'
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
      type: 'privat tjenestepensjon',
      fra: 'Nordea Liv',
      utbetalesFraAlder: 67,
      utbetalesTilAlder: 77,
      aarligUtbetaling: 231298,
    },
    {
      type: 'privat tjenestepensjon',
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
    {
      type: 'egen sparing',
      fra: 'IPS',
      utbetalesFraAlder: 67,
      utbetalesTilAlder: 77,
      aarligUtbetaling: 241802,
    },
  ]
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
  const pensjonsavtaler = usePensjonsavtaler()
  const uttaksgrad = useUttaksgrad()

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
        <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />
      </Accordion>
    </Card>
  )
}
