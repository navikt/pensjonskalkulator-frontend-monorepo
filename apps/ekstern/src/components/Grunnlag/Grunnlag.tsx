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

export function Grunnlag({ tidligstMuligUttak }: Props) {
  const inntekt = useInntekt()
  const alderspensjon = useAlderspensjon()
  const uttaksgrad = useUttaksgrad()
  const pensjonsavtaler: Pensjonsavtale[] = [
    {
      produktbetegnelse: 'Nordea Liv',
      kategori: 'PRIVAT_TP',
      startAlder: 67,
      startMaaned: 0,
      utbetalingsperiode: {
        startAlder: 67,
        startMaaned: 0,
        sluttAlder: 77,
        sluttMaaned: 0,
        aarligUtbetaling: 231_298,
        grad: 100,
      },
    },
    {
      produktbetegnelse: 'Storebrand',
      kategori: 'PRIVAT_TP',
      startAlder: 67,
      startMaaned: 0,
      utbetalingsperiode: {
        startAlder: 67,
        startMaaned: 0,
        sluttAlder: 77,
        sluttMaaned: 0,
        aarligUtbetaling: 39_582,
        grad: 100,
      },
    },
    {
      produktbetegnelse: 'DNB',
      kategori: 'FRIPOLISE',
      startAlder: 67,
      startMaaned: 0,
      utbetalingsperiode: {
        startAlder: 67,
        startMaaned: 0,
        sluttAlder: 77,
        sluttMaaned: 0,
        aarligUtbetaling: 103_264,
        grad: 100,
      },
    },
  ]

  return (
    <section className={styles.section}>
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
        <Pensjonsavtaler pensjonsavtaler={pensjonsavtaler} />
      </Accordion>
    </section>
  )
}
