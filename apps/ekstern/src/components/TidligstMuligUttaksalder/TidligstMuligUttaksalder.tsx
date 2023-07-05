import { memo } from 'react'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { HelpText, Ingress } from '@navikt/ds-react'

import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import styles from './TidligsMuligUttaksalder.module.scss'

interface Props {
  uttaksalder: Uttaksalder
}

export const TidligstMuligUttaksalder: React.FC<Props> = memo(
  ({ uttaksalder }) => {
    return (
      <section className={styles.card} data-testid="tidligst-mulig-uttak">
        <Ingress className={styles.ingress}>
          Din opptjening i folketrygden gjør at du tidligst kan ta ut
          alderspensjon når du er:
        </Ingress>
        <div className={styles.highlighted}>
          {formatUttaksalder(uttaksalder)}
          <HelpText wrapperClassName={styles.helptext}>
            For å starte uttak mellom 62 og 67 år må opptjeningen være høy nok.
            Tidspunktet er et estimat.
          </HelpText>
        </div>
        <Ingress className={styles.ingress}>
          Jo lenger du venter, desto mer får du i året.
        </Ingress>
        <div className={styles.info}>
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
          />
          <p className={styles.infoText}>
            Din AFP kan gjøre at tidspunktet blir tidligere
          </p>
        </div>
      </section>
    )
  }
)
