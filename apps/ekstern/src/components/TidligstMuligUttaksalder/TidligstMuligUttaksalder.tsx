import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { formatUttaksalder } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
  show1963Text: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  show1963Text,
}) => {
  const intl = useIntl()

  return (
    <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
      <div className={styles.wrapperCard} aria-live="polite">
        {tidligstMuligUttak ? (
          <>
            <BodyLong size="medium" className={`${styles.ingress}`}>
              <FormattedMessage
                id="tidligstmuliguttak.ingress_1"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
            <BodyLong size="medium" className={styles.highlighted}>
              {formatUttaksalder(intl, tidligstMuligUttak)}.
            </BodyLong>
            <BodyLong size="medium" className={`${styles.ingress}`}>
              <FormattedMessage
                id={`tidligstmuliguttak.${
                  show1963Text ? '1963' : '1964'
                }.ingress_2`}
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </>
        ) : (
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id="tidligstmuliguttak.error"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        )}
        <ReadMore
          name="Om pensjonsalder enkelt"
          className={styles.readmore}
          header={<FormattedMessage id="tidligstmuliguttak.readmore_title" />}
        >
          {tidligstMuligUttak !== undefined && (
            <FormattedMessage
              id="tidligstmuliguttak.readmore_ingress.optional"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          )}
          <FormattedMessage
            id="tidligstmuliguttak.readmore_ingress.enkelt"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </ReadMore>
      </div>
    </div>
  )
}
