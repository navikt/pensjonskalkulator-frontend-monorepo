import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { PencilIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Button,
  Modal,
  TextField,
  VStack,
} from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import {
  updateAndFormatInntektFromInputField,
  validateInntekt,
} from '@/utils/inntekt'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './EndreInntekt.module.scss'

interface Props {
  visning: BeregningVisning
  className?: string
  buttonLabel?: string
  value: string | null
  onSubmit: (inntekt: string) => void
  variant?: 'secondary' | 'tertiary'
}

const ENDRE_INNTEKT_FORM_NAME = 'endre-inntekt'

export const EndreInntekt: React.FC<Props> = ({
  visning,
  className,
  buttonLabel,
  value,
  onSubmit: onSubmitCallback,
  variant = 'tertiary',
}) => {
  const intl = useIntl()

  const inntektModalRef = React.useRef<HTMLDialogElement>(null)
  const inntektInputRef = React.useRef<HTMLInputElement>(null)

  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const aarligInntektFoerUttakBeloepFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )

  const [validationError, setValidationError] = React.useState<string>('')
  const [oppdatertInntekt, setOppdatertInntekt] = React.useState<string>(
    value ?? ''
  )

  React.useEffect(() => {
    setOppdatertInntekt(value ?? '')
  }, [value])

  const handleTextfieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateAndFormatInntektFromInputField(
      inntektInputRef.current,
      e.target.value,
      setOppdatertInntekt,
      setValidationError
    )
  }

  const openInntektModal = () => {
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger('modal åpnet', {
      tekst: `Modal: Endring av pensjonsgivende inntekt ${visning}`,
    })
    logger('modal åpnet', {
      modalId: 'inntekt-modal',
      tittel: `Modal: Endring av pensjonsgivende inntekt ${visning}`,
    })
    inntektModalRef.current?.showModal()
  }

  const updateValidationErrorMessage = (id: string) => {
    const tekst = intl.formatMessage({
      id,
    })
    logger('skjemavalidering feilet', {
      skjemanavn: ENDRE_INNTEKT_FORM_NAME,
      data: intl.formatMessage({
        id: 'inntekt.endre_inntekt_modal.textfield.label',
      }),
      tekst,
    })
    setValidationError(tekst)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)
    const inntektData = data.get('inntekt') as string | undefined
    const input = form.elements.namedItem('inntekt') as HTMLInputElement | null
    // Set focus on input field to show error message to screen reader users
    input?.focus()

    if (validateInntekt(inntektData, updateValidationErrorMessage)) {
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger('button klikk', {
        tekst: `endrer pensjonsgivende inntekt ${visning}`,
      })
      logger('knapp klikket', {
        tekst: `endrer pensjonsgivende inntekt ${visning}`,
      })
      window.scrollTo(0, 0)
      /* c8 ignore next 3 */
      if (inntektModalRef.current?.open) {
        setOppdatertInntekt('')
        inntektModalRef.current?.close()
      }
      onSubmitCallback(inntektData ?? '')
    }
  }

  const onCancel = (): void => {
    setOppdatertInntekt('')
    setValidationError('')
    if (inntektModalRef.current?.open) {
      inntektModalRef.current?.close()
    }
  }

  return (
    <>
      <Modal
        ref={inntektModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'inntekt.endre_inntekt_modal.title',
          }),
        }}
        onClose={onCancel}
        width="small"
      >
        <Modal.Body>
          {visning === 'avansert' && (
            <BodyLong>
              <FormattedMessage
                id="grunnlag.inntekt.ingress.endring"
                values={{
                  ...getFormatMessageValues(),
                  beloep: aarligInntektFoerUttakBeloepFraSkatt?.beloep,
                  aar: aarligInntektFoerUttakBeloepFraSkatt?.aar,
                }}
              />
              <br />
              <br />
            </BodyLong>
          )}

          <form id="oppdatere-inntekt" method="dialog" onSubmit={onSubmit}>
            <VStack gap="4">
              <TextField
                ref={inntektInputRef}
                data-testid="inntekt-textfield"
                type="text"
                inputMode="numeric"
                name="inntekt"
                className={styles.textfield}
                label={intl.formatMessage({
                  id: 'inntekt.endre_inntekt_modal.textfield.label',
                })}
                description={intl.formatMessage({
                  id: ufoeregrad
                    ? 'inntekt.endre_inntekt_modal.textfield.description.ufoere'
                    : 'inntekt.endre_inntekt_modal.textfield.description',
                })}
                error={validationError}
                onChange={handleTextfieldChange}
                value={oppdatertInntekt}
                max={5}
              />
              {visning === 'enkel' && (
                <BodyShort>
                  <FormattedMessage id="inntekt.endre_inntekt_modal.paragraph" />
                </BodyShort>
              )}
            </VStack>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            form="oppdatere-inntekt"
            data-testid="inntekt.endre_inntekt_modal.button"
          >
            {intl.formatMessage({
              id: 'inntekt.endre_inntekt_modal.button',
            })}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: 'stegvisning.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>

      <Button
        type="button"
        className={className ? className : ''}
        variant={variant}
        size="medium"
        icon={<PencilIcon aria-hidden />}
        onClick={openInntektModal}
        data-testid={buttonLabel ?? 'inntekt.endre_inntekt_modal.open.button'}
      >
        {intl.formatMessage({
          id: buttonLabel ?? 'inntekt.endre_inntekt_modal.open.button',
        })}
      </Button>
    </>
  )
}
