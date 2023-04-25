import React from 'react'

import { BodyLong } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { formatUttaksalder } from '@/components/Pensjonsberegning/utils'

interface Props {
  uttak: Uttaksalder
}

export function TidligstMuligUttak({ uttak }: Props) {
  return (
    <Card data-testid="tidligst-mulig-uttak">
      <BodyLong>
        Du kan tidligst ta ut alderspensjon når du er {formatUttaksalder(uttak)}
        . Hvis du går av senere, får du høyere pensjon i året.
      </BodyLong>
    </Card>
  )
}
