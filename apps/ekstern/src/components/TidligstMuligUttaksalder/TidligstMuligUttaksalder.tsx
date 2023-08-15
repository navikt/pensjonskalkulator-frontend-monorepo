import { memo } from 'react'

import { HelpText, Ingress } from '@navikt/ds-react'

import Piggybank from '../../assets/piggybank.svg'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import styles from './TidligsMuligUttaksalder.module.scss'

interface Props {
  uttaksalder: Uttaksalder
}

export const TidligstMuligUttaksalder: React.FC<Props> = memo(
  ({ uttaksalder }) => {
    return (
      <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
        <div className={styles.wrapperCard}>
          <img className={styles.wrapperImage} src={Piggybank} alt="" />
          <div className={styles.wrapperText} aria-live="polite">
            <Ingress
              className={`${styles.ingress} ${styles.ingress__isInline}`}
            >
              Din opptjening i folketrygden gjør at du tidligst kan
              <br /> ta ut alderspensjon når du er{' '}
            </Ingress>
            <span className={styles.highlighted}>
              {formatUttaksalder(uttaksalder)}
              <HelpText wrapperClassName={styles.helptext}>
                For å starte uttak mellom 62 og 67 år må opptjeningen være høy
                nok. Tidspunktet er et estimat.
              </HelpText>
            </span>
            <Ingress className={styles.ingress}>
              Jo lenger du venter, desto mer får du i året.
            </Ingress>
          </div>
        </div>
      </div>
    )
  }
)
