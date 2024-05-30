import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Alert, BodyLong, Link } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { paths } from '@/router/constants'
import { useGetOmstillingsstoenadOgGjenlevendeQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatUttaksalder } from '@/utils/alder'
import { isAlderOverMinUttaksaar } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './TidligstMuligUttaksalder.module.scss'

interface Props {
  tidligstMuligUttak?: Alder
  ufoeregrad: number
  hasAfpOffentlig: boolean
  show1963Text: boolean
}

export const TidligstMuligUttaksalder: React.FC<Props> = ({
  tidligstMuligUttak,
  ufoeregrad,
  hasAfpOffentlig,
  show1963Text,
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: omstillingsstoenadOgGjenlevende } =
    useGetOmstillingsstoenadOgGjenlevendeQuery()

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningAvansert)
  }

  return (
    <div className={styles.wrapper} data-testid="tidligst-mulig-uttak">
      <div className={styles.wrapperCard} aria-live="polite">
        {!ufoeregrad && !tidligstMuligUttak && (
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id="tidligstmuliguttak.error"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        )}

        {ufoeregrad && (
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id={
                ufoeregrad === 100
                  ? 'omufoeretrygd.hel.ingress'
                  : 'omufoeretrygd.gradert.ingress'
              }
              values={{
                ...getFormatMessageValues(intl),
                grad: ufoeregrad,
                link: (
                  <Link href="#" onClick={goToAvansert}>
                    <FormattedMessage id="omufoeretrygd.avansert_link" />
                  </Link>
                ),
              }}
            />
          </BodyLong>
        )}

        {tidligstMuligUttak && (
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
            {
              // TODO PEK-387: Fjerne logikk og hasAfpOffentlig prop
            }
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
        )}

        {omstillingsstoenadOgGjenlevende?.harLoependeSak && (
          <Alert className={styles.alert} variant="info" aria-live="polite">
            <FormattedMessage
              id="tidligstmuliguttak.info_omstillinngsstoenad_og_gjenlevende"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </Alert>
        )}

        {ufoeregrad ? (
          <ReadMore
            name="Om ufoeretrygd og alderspensjon"
            className={styles.readmore}
            header={<FormattedMessage id="omufoeretrygd.readmore.title" />}
          >
            <FormattedMessage
              id={
                ufoeregrad === 100
                  ? 'omufoeretrygd.readmore.hel.ingress'
                  : 'omufoeretrygd.readmore.gradert.ingress'
              }
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </ReadMore>
        ) : (
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
        )}
      </div>
    </div>
  )
}
