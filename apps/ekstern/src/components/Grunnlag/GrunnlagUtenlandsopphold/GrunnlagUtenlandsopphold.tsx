import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Link } from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectHarUtenlandsopphold } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './GrunnlagUtenlandsopphold.module.scss'

export const GrunnlagUtenlandsopphold: React.FC = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)

  const cachedQueries = useAppSelector(
    (state) => state[apiSlice.reducerPath].queries
  )

  const harForLiteTrygdetid = React.useMemo(() => {
    const latestAlerspensjonQuery = Object.entries(cachedQueries || {}).find(
      ([key]) => key.includes('alderspensjon')
    ) || [null, null]
    return latestAlerspensjonQuery[1]?.data
      ? (latestAlerspensjonQuery[1]?.data as AlderspensjonResponseBody)
          .harForLiteTrygdetid
      : null
  }, [cachedQueries])

  const oppholdUtenforNorge = React.useMemo(():
    | 'mindre_enn_5_aar'
    | 'mer_enn_5_aar'
    | 'for_lite_trygdetid' => {
    if (harForLiteTrygdetid) {
      return 'for_lite_trygdetid'
    }
    return harUtenlandsopphold ? 'mer_enn_5_aar' : 'mindre_enn_5_aar'
  }, [])

  const goToUtenlandsoppholdStep: React.MouseEventHandler<HTMLAnchorElement> = (
    e
  ) => {
    e.preventDefault()
    navigate(paths.utenlandsopphold)
  }

  return (
    <>
      <AccordionItem name="Grunnlag: Utenlandsopphold">
        <GrunnlagSection
          headerTitle={intl.formatMessage({
            id: `grunnlag.opphold.title.${oppholdUtenforNorge}`,
          })}
          headerValue={intl.formatMessage({
            id: `grunnlag.opphold.value.${oppholdUtenforNorge}`,
          })}
        >
          <>
            {oppholdUtenforNorge === 'mindre_enn_5_aar' && (
              <BodyLong spacing>
                <FormattedMessage
                  id="grunnlag.opphold.ingress.mindre_enn_5_aar"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              </BodyLong>
            )}

            {harUtenlandsopphold && (
              <UtenlandsoppholdListe harRedigeringsmuligheter={false} />
            )}

            {oppholdUtenforNorge === 'for_lite_trygdetid' && (
              <div className={styles.info}>
                <ExclamationmarkTriangleFillIcon
                  className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
                  fontSize="1.5rem"
                  aria-hidden
                />
                <BodyLong className={styles.infoText}>
                  <FormattedMessage
                    id="grunnlag.opphold.ingress.for_lite_trygdetid"
                    values={{
                      ...getFormatMessageValues(intl),
                    }}
                  />
                </BodyLong>
              </div>
            )}

            <BodyLong>
              <FormattedMessage
                id="grunnlag.opphold.ingress.endre_opphold"
                values={{
                  ...getFormatMessageValues(intl),
                  link: (
                    <Link href="#" onClick={goToUtenlandsoppholdStep}>
                      <FormattedMessage id="grunnlag.opphold.ingress.endre_opphold.link" />
                    </Link>
                  ),
                }}
              />
            </BodyLong>

            {(harUtenlandsopphold ||
              oppholdUtenforNorge === 'for_lite_trygdetid') && (
              <BodyLong className={styles.bunntekst}>
                <FormattedMessage
                  id="grunnlag.opphold.bunntekst"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              </BodyLong>
            )}
          </>
        </GrunnlagSection>
      </AccordionItem>
    </>
  )
}
