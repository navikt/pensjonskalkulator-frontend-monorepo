import React from 'react'

import { BodyLong, Heading, Link } from '@navikt/ds-react'

import { Card } from '@/components/Card'

export function Forbehold() {
  return (
    <Card>
      <Heading level="3" size="medium">
        Forbehold
      </Heading>
      <BodyLong>
        Pensjonen er beregnet med de opplysningene vi har om deg, i tillegg til
        de opplysningene du har oppgitt selv, på tidspunktet for beregningen.
        Dette er derfor en foreløpig beregning av hva du kan forvente deg i
        pensjon. Pensjonsberegningen er vist i dagens kroneverdi før skatt.
        Beregningen er ikke juridisk bindende.
      </BodyLong>
      <Link>Alle forbehold</Link>
    </Card>
  )
}
