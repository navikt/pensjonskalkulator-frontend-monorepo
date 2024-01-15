import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, Label, Modal, TextField } from '@navikt/ds-react'

import { validateInntektInput } from '../EndreInntekt/utils'
// import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatWithoutDecimal } from '@/utils/currency'

import styles from './EndreInntektVsaPensjon.module.scss'

interface Props {
  temporaryStartAlder?: string
}

// TODO logger
export const EndreInntektVsaPensjon: React.FC<Props> = ({
  temporaryStartAlder,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const inntektVsaPensjonModalRef = React.useRef<HTMLDialogElement>(null)
  const { aarligInntektVsaHelPensjon } = useAppSelector(selectCurrentSimulation)

  const [validationError, setValidationError] = React.useState<string>('')
  const [inntektBeloepVsaPensjon, setInntektBeloepVsaPensjon] =
    React.useState<string>(aarligInntektVsaHelPensjon?.beloep?.toString() ?? '')

  const handleTextfieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setInntektBeloepVsaPensjon(e.target.value)
    setValidationError('')
  }

  const openInntektVsaPensjonModal = () => {
    // logger('modal åpnet', {
    //   tekst: 'Modal: Endring av pensjonsgivende inntekt',
    // })
    inntektVsaPensjonModalRef.current?.showModal()
  }

  const updateValidationErrorMessage = (id: string) => {
    setValidationError(
      intl.formatMessage({
        id,
      })
    )
  }

  const validateInntektVsaPensjon = (): void => {
    if (
      validateInntektInput(
        inntektBeloepVsaPensjon,
        updateValidationErrorMessage
      )
    ) {
      dispatch(
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon({
          beloep: parseInt(inntektBeloepVsaPensjon.replace(/ /g, ''), 10),
          sluttAlder: { aar: 0, maaneder: 0 },
        })
      )
      // logger('button klikk', {
      //   tekst: 'endrer pensjonsgivende inntekt',
      // })
      /* c8 ignore next 3 */
      if (inntektVsaPensjonModalRef.current?.open) {
        setInntektBeloepVsaPensjon('')
        inntektVsaPensjonModalRef.current?.close()
      }
    }
  }

  const onCancel = (): void => {
    setInntektBeloepVsaPensjon('')
    setValidationError('')
    if (inntektVsaPensjonModalRef.current?.open) {
      inntektVsaPensjonModalRef.current?.close()
    }
  }

  const onDelete = (): void => {
    setInntektBeloepVsaPensjon('')
    setValidationError('')
    dispatch(
      userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(undefined)
    )
  }

  return (
    <>
      <Modal
        ref={inntektVsaPensjonModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'inntekt.endre_inntekt_vsa_pensjon_modal.title',
          }),
        }}
        onClose={onCancel}
        width="small"
      >
        <Modal.Body>
          <TextField
            data-testid="inntekt-vsa-pensjon-textfield"
            type="text"
            inputMode="numeric"
            name="inntekt-vsa-pensjon"
            label={intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.label',
            })}
            description={intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.description',
            })}
            error={validationError}
            onChange={handleTextfieldChange}
            value={inntektBeloepVsaPensjon}
            max={5}
          />
          {/* <TemporaryAlderVelgerAvansert
            defaultValue={
              temporaryGradertUttaksperiode?.uttaksalder ?? undefined
            }
            grad={temporaryGradertUttaksperiode.grad}
            hasValidationError={validationErrors['uttaksalder-gradert-pensjon']}
          /> */}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={validateInntektVsaPensjon}>
            {intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.button',
            })}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <hr className={styles.separator} />
      {aarligInntektVsaHelPensjon ? (
        <>
          <Label>
            <FormattedMessage id="inntekt.endre_inntekt_vsa_pensjon_modal.label" />
          </Label>
          <p>{`${formatWithoutDecimal(
            aarligInntektVsaHelPensjon.beloep
          )} kr ${intl.formatMessage({
            id: 'beregning.avansert.resultatkort.fra',
          })} ${
            temporaryStartAlder && !/^[^0-9]+$/.test(temporaryStartAlder)
              ? temporaryStartAlder
              : 'PLACEHOLDER'
          } ${intl.formatMessage({
            id: 'beregning.avansert.resultatkort.til',
          })} ${intl.formatMessage({
            id: 'beregning.avansert.resultatkort.livsvarig',
          })}.`}</p>
          <Button
            className={styles.button}
            variant="tertiary"
            icon={<PencilIcon aria-hidden />}
            onClick={openInntektVsaPensjonModal}
          >
            {intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre',
            })}
          </Button>
          <Button
            className={styles.button}
            variant="tertiary"
            icon={<TrashIcon aria-hidden />}
            onClick={onDelete}
          >
            {intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.slette',
            })}
          </Button>
        </>
      ) : (
        <>
          <p>
            <FormattedMessage id="inntekt.endre_inntekt_vsa_pensjon_modal.ingress_2" />
          </p>
          <Button variant="secondary" onClick={openInntektVsaPensjonModal}>
            {intl.formatMessage({
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til',
            })}
          </Button>
        </>
      )}
    </>
  )
}
