import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, BodyLong, HelpText } from '@navikt/ds-react'

import Piggybank from '../../assets/piggybank.svg'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'
import { logger } from '@/utils/logging'
import { formatMessageValues } from '@/utils/translations'

import { isUttaksalderOver62 } from './utils'

import styles from './TidligsMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak: Alder
  hasAfpOffentlig: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = React.memo(
  ({ tidligstMuligUttak, hasAfpOffentlig }) => {
    const intl = useIntl()
    const [hasHelpTextBeenClicked, setHasHelpTextBeenClicked] =
      React.useState(false)
    const logHelpTextClick = () => {
      if (!hasHelpTextBeenClicked) {
        logger('help text åpnet', {
          tekst: 'Tidligst mulig uttak',
        })
      }
      setHasHelpTextBeenClicked(true)
    }

    return (
      <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
        <div className={styles.wrapperCard}>
          <img className={styles.wrapperImage} src={Piggybank} alt="" />
          <div className={styles.wrapperText} aria-live="polite">
            <BodyLong
              size="large"
              className={`${styles.ingress} ${styles.ingress__isInline}`}
            >
              <FormattedMessage
                id="tidligsteuttaksalder.ingress_1"
                values={{
                  ...formatMessageValues,
                }}
              />
            </BodyLong>
            <span className={styles.highlighted}>
              {formatUttaksalder(intl, tidligstMuligUttak)}
              <HelpText
                onClick={logHelpTextClick}
                wrapperClassName={styles.helptext}
              >
                <FormattedMessage
                  id="tidligsteuttaksalder.help"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </HelpText>
            </span>
            {hasAfpOffentlig && isUttaksalderOver62(tidligstMuligUttak) && (
              <Alert
                className={styles.alert}
                size="small"
                variant="info"
                aria-live="polite"
              >
                <FormattedMessage
                  id="tidligsteuttaksalder.info_afp"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              </Alert>
            )}
            <BodyLong size="large" className={styles.ingress}>
              <FormattedMessage
                id="tidligsteuttaksalder.ingress_2"
                values={{
                  ...formatMessageValues,
                }}
              />
            </BodyLong>
          </div>
        </div>
      </div>
    )
  }
)
