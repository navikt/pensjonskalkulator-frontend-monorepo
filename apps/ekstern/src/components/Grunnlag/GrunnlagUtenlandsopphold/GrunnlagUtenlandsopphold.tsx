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
import {
  selectHarUtenlandsopphold,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './GrunnlagUtenlandsopphold.module.scss'

interface Props {
  harForLiteTrygdetid?: boolean
}

export const GrunnlagUtenlandsopphold: React.FC<Props> = ({
  harForLiteTrygdetid,
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const { formatertUttaksalderReadOnly } = useAppSelector(
    selectCurrentSimulation
  )

  const oppholdUtenforNorge = React.useMemo(():
    | 'mindre_enn_5_aar'
    | 'mer_enn_5_aar'
    | 'for_lite_trygdetid' => {
    if (harForLiteTrygdetid) {
      return 'for_lite_trygdetid'
    }
    return harUtenlandsopphold ? 'mer_enn_5_aar' : 'mindre_enn_5_aar'
  }, [harForLiteTrygdetid, harUtenlandsopphold])

  React.useEffect(() => {
    if (oppholdUtenforNorge === 'for_lite_trygdetid') {
      logger('grunnlag for beregningen', {
        tekst: 'trygdetid',
        data: 'under 5 år',
      })
    } else {
      logger('grunnlag for beregningen', {
        tekst: 'trygdetid',
        data: harUtenlandsopphold ? '5-40 år' : 'over 40 år',
      })
    }
  }, [formatertUttaksalderReadOnly])

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
              <UtenlandsoppholdListe erVisningIGrunnlag />
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
