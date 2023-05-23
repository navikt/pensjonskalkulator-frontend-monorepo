import React from 'react'

import { Ingress } from '@navikt/ds-react'

import { Card } from '@/components/Card'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import styles from './TidligsMuligUttaksalder.module.scss'

interface Props {
  uttaksalder: Uttaksalder
}

export const TidligstMuligUttaksalder: React.FC<Props> = React.memo(
  ({ uttaksalder }) => {
    return (
      <Card data-testid="tidligst-mulig-uttak">
        <Ingress className={styles.ingress}>
          <>
            Du kan tidligst ta ut alderspensjon når du er{' '}
            {formatUttaksalder(uttaksalder)}. Hvis du går av senere, får du
            høyere pensjon i året.
          </>
        </Ingress>
      </Card>
    )
  }
)
