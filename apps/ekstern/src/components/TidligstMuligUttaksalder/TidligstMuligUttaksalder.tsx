import { memo } from 'react'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { BodyLong, HelpText } from '@navikt/ds-react'

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
            <BodyLong
              size="large"
              className={`${styles.ingress} ${styles.ingress__isInline}`}
            >
              Din opptjening i folketrygden gjør at du tidligst kan ta <br />
              ut alderspensjon når du er{' '}
            </BodyLong>
            <span className={styles.highlighted}>
              {formatUttaksalder(uttaksalder)}
              <HelpText wrapperClassName={styles.helptext}>
                For å starte uttak mellom 62 og 67 år må opptjeningen være høy
                nok. Tidspunktet er et estimat.
              </HelpText>
            </span>
            <BodyLong size="large" className={styles.ingress}>
              Jo lenger du venter, desto mer får du i året.
            </BodyLong>
            <div className={styles.info}>
              <InformationSquareFillIcon
                className={styles.infoIcon}
                fontSize="1.5rem"
                aria-hidden
              />
              <p className={styles.infoText}>
                Din AFP kan gjøre at tidspunktet blir tidligere
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
