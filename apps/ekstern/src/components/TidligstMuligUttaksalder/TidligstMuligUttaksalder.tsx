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
            Ditt tidligste mulige tidspunkt for uttak:
            <br />
            <span className={styles.ingressHighlighted}>
              {formatUttaksalder(uttaksalder)}
            </span>
          </>
        </Ingress>
        <Ingress className={styles.ingress}>
          <>Hvis du går av senere, får du høyere pensjon i året.</>
        </Ingress>
      </Card>
    )
  }
)
