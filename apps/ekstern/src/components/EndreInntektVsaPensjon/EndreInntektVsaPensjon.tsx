import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, Label, Modal, TextField } from '@navikt/ds-react'

import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatUttaksalder, validateAlder } from '@/utils/alder'
import { formatWithoutDecimal, validateInntekt } from '@/utils/inntekt'

import styles from './EndreInntektVsaPensjon.module.scss'

interface Props {
  temporaryUttaksalder?: Alder
}

// TODO legge til Amplitude logging
export const EndreInntektVsaPensjon: React.FC<Props> = ({
  temporaryUttaksalder,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const inntektVsaPensjonModalRef = React.useRef<HTMLDialogElement>(null)
  const { aarligInntektVsaHelPensjon } = useAppSelector(selectCurrentSimulation)

  const [inntektBeloepVsaPensjon, setInntektBeloepVsaPensjon] =
    React.useState<string>(aarligInntektVsaHelPensjon?.beloep?.toString() ?? '')
  const [sluttAlder, setSluttAlder] = React.useState<Alder | null>(
    aarligInntektVsaHelPensjon?.sluttAlder ?? null
  )
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    'inntekt-vsa-pensjon': '',
    'sluttalder-inntekt-vsa-pensjon': '',
  })

  const handleTextfieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setInntektBeloepVsaPensjon(e.target.value)
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        'inntekt-vsa-pensjon': '',
      }
    })
  }

  const alderVelgerChange = (alder: Alder | undefined): void => {
    setSluttAlder(alder ?? null)
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        'sluttalder-inntekt-vsa-pensjon': '',
      }
    })
  }

  const openInntektVsaPensjonModal = () => {
    // logger('modal åpnet', {
    //   tekst: 'Modal: Endring av pensjonsgivende inntekt',
    // })
    inntektVsaPensjonModalRef.current?.showModal()
  }

  const updateValidationErrorInputTextMessage = (id: string) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        'inntekt-vsa-pensjon': id,
      }
    })
  }

  const updateValidationAlderVelgerTextMessage = (id: string) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        'sluttalder-inntekt-vsa-pensjon': id,
      }
    })
  }

  const validateInntektVsaPensjon = (): void => {
    if (
      validateInntekt(
        inntektBeloepVsaPensjon,
        updateValidationErrorInputTextMessage
      ) &&
      validateAlder(sluttAlder, updateValidationAlderVelgerTextMessage)
    ) {
      dispatch(
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon({
          beloep: parseInt(inntektBeloepVsaPensjon.replace(/ /g, ''), 10),
          sluttAlder: { ...(sluttAlder as Alder) },
        })
      )
      if (inntektVsaPensjonModalRef.current?.open) {
        setInntektBeloepVsaPensjon('')
        inntektVsaPensjonModalRef.current?.close()
      }
    }
  }

  const onCancel = (): void => {
    setInntektBeloepVsaPensjon(
      aarligInntektVsaHelPensjon?.beloep
        ? aarligInntektVsaHelPensjon?.beloep?.toString()
        : ''
    )
    setSluttAlder(aarligInntektVsaHelPensjon?.sluttAlder ?? null)
    setValidationErrors({
      'inntekt-vsa-pensjon': '',
      'sluttalder-inntekt-vsa-pensjon': '',
    })
    if (inntektVsaPensjonModalRef.current?.open) {
      inntektVsaPensjonModalRef.current?.close()
    }
  }

  const onDelete = (): void => {
    dispatch(
      userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(undefined)
    )
    setInntektBeloepVsaPensjon('')
    setSluttAlder(null)
    setValidationErrors({
      'inntekt-vsa-pensjon': '',
      'sluttalder-inntekt-vsa-pensjon': '',
    })
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
            error={
              validationErrors['inntekt-vsa-pensjon']
                ? intl.formatMessage({
                    id: validationErrors['inntekt-vsa-pensjon'],
                  })
                : undefined
            }
            onChange={handleTextfieldChange}
            value={inntektBeloepVsaPensjon}
            max={5}
          />
          <div className={styles.spacer} />
          <TemporaryAlderVelgerAvansert
            name="sluttalder-inntekt-vsa-pensjon"
            label="Til hvilken alder forventer du å ha inntekten?"
            description=""
            value={sluttAlder}
            onChange={alderVelgerChange}
            maxAlder={{ aar: 75, maaneder: 11 }}
            hasValidationError={
              validationErrors['sluttalder-inntekt-vsa-pensjon'] !== ''
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={validateInntektVsaPensjon}>
            {intl.formatMessage({
              id: aarligInntektVsaHelPensjon
                ? 'inntekt.endre_inntekt_vsa_pensjon_modal.button.endre'
                : 'inntekt.endre_inntekt_vsa_pensjon_modal.button.legg_til',
            })}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.spacer} />
      {aarligInntektVsaHelPensjon ? (
        <>
          <Label>
            <FormattedMessage id="inntekt.endre_inntekt_vsa_pensjon_modal.label" />
          </Label>
          <p>{`${formatWithoutDecimal(
            aarligInntektVsaHelPensjon.beloep
          )} kr ${intl.formatMessage({
            id: 'beregning.fra',
          })} ${
            temporaryUttaksalder
              ? formatUttaksalder(intl, temporaryUttaksalder)
              : 'PLACEHOLDER'
          } ${intl.formatMessage({
            id: 'beregning.til',
          })} ${formatUttaksalder(
            intl,
            aarligInntektVsaHelPensjon.sluttAlder
          )}.`}</p>
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
              id: 'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette',
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
