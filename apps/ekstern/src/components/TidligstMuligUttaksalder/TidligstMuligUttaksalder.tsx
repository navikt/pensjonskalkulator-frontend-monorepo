import { memo, useEffect, useRef } from 'react'

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
    const ingressRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      ingressRef.current?.focus()
    }, [])

    return (
      <ResponsiveCard data-testid="tidligst-mulig-uttak">
        <div className={styles.wrapper}>
          <img className={styles.wrapperImage} src={Piggybank} alt="" />
          <div
            className={styles.wrapperText}
            ref={ingressRef}
            tabIndex={-1}
            aria-live="polite"
          >
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
      </ResponsiveCard>
    )
  }
)
