import { memo } from 'react'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { HelpText, Ingress } from '@navikt/ds-react'

import Piggybank from '../../assets/piggybank.svg'
import { ResponsiveCard } from '@/components/components/ResponsiveCard'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'

import styles from './TidligsMuligUttaksalder.module.scss'

interface Props {
  uttaksalder: Uttaksalder
}

export const TidligstMuligUttaksalder: React.FC<Props> = memo(
  ({ uttaksalder }) => {
    return (
      <ResponsiveCard data-testid="tidligst-mulig-uttak">
        <div className={styles.wrapper}>
          <img
            className={styles.wrapperImage}
            src={Piggybank}
            alt="Illustrasjon av sparegris"
          />
          <div className={styles.wrapperText}>
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
      </ResponsiveCard>
    )
  }
)
