import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, BodyLong } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'
import { formatMessageValues } from '@/utils/translations'

import { isUttaksalderOver62 } from './utils'

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak: Alder
  hasAfpOffentlig: boolean
  show1963Text: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = React.memo(
  ({ tidligstMuligUttak, hasAfpOffentlig, show1963Text }) => {
    const intl = useIntl()

    return (
      <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
        <div className={styles.wrapperCard} aria-live="polite">
          <BodyLong size="small" className={`${styles.ingress}`}>
            <FormattedMessage
              id={`tidligsteuttaksalder.${
                show1963Text ? '1963' : '1964'
              }.ingress_1`}
              values={{
                ...formatMessageValues,
              }}
            />
          </BodyLong>
          <BodyLong size="small" className={styles.highlighted}>
            {formatUttaksalder(intl, tidligstMuligUttak)}.
          </BodyLong>

          <BodyLong size="small" className={`${styles.ingress}`}>
            <FormattedMessage
              id={`tidligsteuttaksalder.${
                show1963Text ? '1963' : '1964'
              }.ingress_2`}
              values={{
                ...formatMessageValues,
              }}
            />
          </BodyLong>
          <ReadMore
            name="Om tidspunkter for uttak"
            className={styles.readmore}
            header={
              <FormattedMessage id="tidligsteuttaksalder.readmore_title" />
            }
          >
            <FormattedMessage
              id="tidligsteuttaksalder.readmore_ingress"
              values={{
                ...formatMessageValues,
              }}
            />
          </ReadMore>
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
        </div>
      </div>
    )
  }
)
