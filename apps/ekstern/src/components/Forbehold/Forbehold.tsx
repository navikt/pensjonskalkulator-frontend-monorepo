import { Link as ReactRouterLink } from 'react-router-dom'

import { BodyLong, Heading, Link } from '@navikt/ds-react'

import { paths } from '@/routes'

import styles from './Forbehold.module.scss'

// TODO skrive tester
export function Forbehold() {
  return (
    <section className={styles.section}>
      <Heading level="2" size="medium" className={styles.heading}>
        Forbehold
      </Heading>

      <BodyLong className={styles.text}>
        Pensjonen er beregnet med de opplysningene vi har om deg, i tillegg til
        de opplysningene du har oppgitt selv, på tidspunktet for beregningen.
        Dette er derfor en foreløpig beregning av hva du kan forvente deg i
        pensjon. Pensjonsberegningen er vist i dagens kroneverdi før skatt.
        Beregningen er ikke juridisk bindende.
      </BodyLong>
      <Link as={ReactRouterLink} to={paths.forbehold}>
        Alle forbehold
      </Link>
    </section>
  )
}
