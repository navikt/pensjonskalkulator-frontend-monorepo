import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Link } from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectHarUtenlandsopphold } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './GrunnlagUtenlandsopphold.module.scss'

// interface Props {}

export const GrunnlagUtenlandsopphold: React.FC = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  // const dispatch = useAppDispatch()
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)

  const oppholdUtenforNorge = React.useMemo(():
    | 'mindre_enn_5_aar'
    | 'mer_enn_5_aar'
    | 'for_lite_trygdetid' => {
    // "mindre_enn_5_aar" = hvis harUtenlandsopphold er false
    // "mer_enn_5_aar" = hvis harUtenlandsopphold er true
    // "for_lite_trygdetid" = hvis harUtenlandsopphold er true + avhengig av backend
    // TODO logikk for 5 år eller mindre / Mer enn 5 år og Mindre enn 5 år
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
            {
              // TODO ved legg til,endring eller sletting av opphold bør det trigges nytt kall til TMU, simulering og NP
              // TODO avklare visning
            }
            {oppholdUtenforNorge === 'mindre_enn_5_aar' ? (
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.opphold.ingress.mindre_enn_5_aar"
                  values={{
                    ...getFormatMessageValues(intl),
                    link: (
                      <Link href="#" onClick={goToUtenlandsoppholdStep}>
                        <FormattedMessage id="grunnlag.opphold.ingress.mindre_enn_5_aar.link" />
                      </Link>
                    ),
                  }}
                />
              </BodyLong>
            ) : (
              <UtenlandsoppholdListe />
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

            {harUtenlandsopphold && (
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
