import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Link, Modal } from '@navikt/ds-react'

import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { AccordionItem } from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectHarUtenlandsopphold,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagSection } from '../GrunnlagSection'
import { useOppholdUtenforNorge } from './hooks'

import styles from './GrunnlagUtenlandsopphold.module.scss'

interface Props {
  harForLiteTrygdetid?: boolean
  trygdetid?: number
}

export const GrunnlagUtenlandsopphold: React.FC<Props> = ({
  harForLiteTrygdetid,
  trygdetid,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const avbrytModalRef = React.useRef<HTMLDialogElement>(null)
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const { uttaksalder } = useAppSelector(selectCurrentSimulation)

  const oppholdUtenforNorge = useOppholdUtenforNorge({ harForLiteTrygdetid })

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
  }, [uttaksalder?.aar, uttaksalder?.maaneder])

  const goToUtenlandsoppholdStep: React.MouseEventHandler<HTMLAnchorElement> = (
    e
  ) => {
    e.preventDefault()
    avbrytModalRef.current?.showModal()
  }

  return (
    <>
      <Modal
        ref={avbrytModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'grunnlag.opphold.avbryt_modal.title',
          }),
        }}
        width="medium"
      >
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              // TODO: fjern når amplitude er ikke i bruk lenger
              logger('button klikk', { tekst: 'Tilbake til utenlandsopphold' })
              logger('knapp klikket', { tekst: 'Tilbake til utenlandsopphold' })
              dispatch(userInputActions.flushCurrentSimulation())
              avbrytModalRef.current?.close()
              navigate(paths.utenlandsopphold)
            }}
          >
            {intl.formatMessage({
              id: 'grunnlag.opphold.avbryt_modal.bekreft',
            })}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              avbrytModalRef.current?.close()
            }}
          >
            {intl.formatMessage({
              id: 'grunnlag.opphold.avbryt_modal.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <AccordionItem name="Grunnlag: Utenlandsopphold">
        <GrunnlagSection
          headerTitle={intl.formatMessage({
            id: `grunnlag.opphold.title.${oppholdUtenforNorge}`,
          })}
          headerValue={intl.formatMessage({
            id: `grunnlag.opphold.value.${oppholdUtenforNorge}`,
          })}
          headerValueTestId={`grunnlag.opphold.value.${oppholdUtenforNorge}`}
        >
          <>
            {oppholdUtenforNorge === 'endring' && (
              <BodyLong data-testid="grunnlag.opphold.ingress.endring">
                <FormattedMessage
                  id="grunnlag.opphold.ingress.endring"
                  values={{
                    ...getFormatMessageValues(),
                  }}
                />
              </BodyLong>
            )}

            {oppholdUtenforNorge === 'mindre_enn_5_aar' && (
              <BodyLong spacing>
                <FormattedMessage
                  id="grunnlag.opphold.ingress.mindre_enn_5_aar"
                  values={{
                    ...getFormatMessageValues(),
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
                  className={clsx(styles.infoIcon, styles.infoIcon__orange)}
                  fontSize="1.5rem"
                  aria-hidden
                />
                <BodyLong className={styles.infoText}>
                  <FormattedMessage
                    id="grunnlag.opphold.ingress.for_lite_trygdetid"
                    values={{
                      ...getFormatMessageValues(),
                    }}
                  />
                </BodyLong>
              </div>
            )}

            {oppholdUtenforNorge !== 'endring' && (
              <BodyLong>
                <FormattedMessage
                  id="grunnlag.opphold.ingress.endre_opphold"
                  values={{
                    ...getFormatMessageValues(),
                    link: (
                      <Link href="#" onClick={goToUtenlandsoppholdStep}>
                        <FormattedMessage id="grunnlag.opphold.ingress.endre_opphold.link" />
                      </Link>
                    ),
                  }}
                />
                {trygdetid !== undefined && (
                  <>
                    <br /> <br />
                    <FormattedMessage
                      id="grunnlag.opphold.ingress.trygdetid"
                      values={{
                        ...getFormatMessageValues(),
                        aar: trygdetid,
                      }}
                    />
                  </>
                )}
              </BodyLong>
            )}

            {(harUtenlandsopphold ||
              oppholdUtenforNorge === 'for_lite_trygdetid') && (
              <BodyLong className={styles.bunntekst}>
                <FormattedMessage
                  id="grunnlag.opphold.bunntekst"
                  values={{
                    ...getFormatMessageValues(),
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
