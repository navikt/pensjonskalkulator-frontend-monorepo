import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, BodyLong } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { useGetDetaljertFaneFeatureToggleQuery } from '@/state/api/apiSlice'
import { formatUttaksalder } from '@/utils/alder'
import { isAlderOverMinUttaksaar } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
  hasAfpOffentlig: boolean
  show1963Text: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  hasAfpOffentlig,
  show1963Text,
}) => {
  const intl = useIntl()
  const { data: detaljertFaneFeatureToggle } =
    useGetDetaljertFaneFeatureToggleQuery()

  return (
    <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
      <div className={styles.wrapperCard} aria-live="polite">
        {tidligstMuligUttak ? (
          <>
            <BodyLong size="medium" className={`${styles.ingress}`}>
              <FormattedMessage
                id={`tidligstmuliguttak.${
                  show1963Text ? '1963' : '1964'
                }.ingress_1`}
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
            {hasAfpOffentlig && isAlderOverMinUttaksaar(tidligstMuligUttak) && (
              <Alert
                className={styles.alert}
                size="small"
                variant="info"
                aria-live="polite"
              >
                <FormattedMessage
                  id="tidligstmuliguttak.info_afp"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              </Alert>
            )}
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
          name="Om tidspunkter for uttak"
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
            id={`tidligstmuliguttak.readmore_ingress.${
              detaljertFaneFeatureToggle?.enabled ? 'avansert' : 'enkelt'
            }`}
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </ReadMore>
      </div>
    </div>
  )
}
