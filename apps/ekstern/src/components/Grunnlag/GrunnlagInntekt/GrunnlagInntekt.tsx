import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Link, Modal } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
import { AccordionItem } from '@/components/common/AccordionItem'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagSection } from '../GrunnlagSection'

import styles from './GrunnlagInntekt.module.scss'

interface Props {
  goToAvansert: React.MouseEventHandler<HTMLAnchorElement>
}

export const GrunnlagInntekt: React.FC<Props> = ({ goToAvansert }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const infoModalRef = React.useRef<HTMLDialogElement>(null)

  const openInfoModal = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e?.preventDefault()
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger('modal åpnet', {
      tekst: 'Grunnlag: info om pensjonsgivende inntekt',
    })
    logger('modal åpnet', {
      modalId: 'info-modal',
      tittel: 'Grunnlag: info om pensjonsgivende inntekt',
    })
    infoModalRef.current?.showModal()
  }

  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const aarligInntektFoerUttakBeloepFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )

  return (
    <AccordionItem name="Grunnlag: Inntekt">
      <GrunnlagSection
        headerTitle={intl.formatMessage({
          id: 'grunnlag.inntekt.title',
        })}
        headerValue={`${aarligInntektFoerUttakBeloep} kr`}
      >
        <>
          <BodyLong data-testid="grunnlag.inntekt.ingress">
            <FormattedMessage
              id="grunnlag.inntekt.ingress"
              values={{
                ...getFormatMessageValues(),
                beloep: aarligInntektFoerUttakBeloepFraSkatt?.beloep,
                aar: aarligInntektFoerUttakBeloepFraSkatt?.aar,
              }}
            />
            <br />
          </BodyLong>
          <Modal
            ref={infoModalRef}
            header={{
              heading: intl.formatMessage({
                id: 'grunnlag.inntekt.info_om_inntekt',
              }),
            }}
            width="medium"
          >
            <Modal.Body>
              <InfoOmInntekt />
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                onClick={() => infoModalRef.current?.close()}
              >
                {intl.formatMessage({
                  id: 'grunnlag.inntekt.info_om_inntekt.lukk',
                })}
              </Button>
            </Modal.Footer>
          </Modal>

          <Link
            href="#"
            className={styles.link}
            onClick={openInfoModal}
            inlineText
          >
            <FormattedMessage id="inntekt.info_om_inntekt.open.link" />
          </Link>

          <EndreInntekt
            visning="enkel"
            className={styles.button}
            value={aarligInntektFoerUttakBeloepFraBrukerInput}
            onSubmit={(uformatertInntekt) => {
              dispatch(
                userInputActions.setCurrentSimulationAarligInntektFoerUttakBeloep(
                  uformatertInntekt
                )
              )
              dispatch(userInputActions.setCurrentSimulationUttaksalder(null))
            }}
          />
          <BodyLong className={styles.link}>
            <FormattedMessage id="grunnlag.inntekt.avansert_kalkulator" />
            <Link href="#" onClick={goToAvansert}>
              <FormattedMessage id="grunnlag.inntekt.avansert_link" />
            </Link>
            .
          </BodyLong>
        </>
      </GrunnlagSection>
    </AccordionItem>
  )
}
