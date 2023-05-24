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
            Din opptjening i folketrygden gjør at du tidligst kan ta ut
            alderspensjon når du er:
            <br />
            <span className={styles.ingressHighlighted}>
              {formatUttaksalder(uttaksalder)}
            </span>
          </>
        </Ingress>
        <Ingress className={styles.ingress}>
          <>Du får høyere pensjon per år, hvis du tar den ut senere.</>
        </Ingress>
      </Card>
    )
  }
)
