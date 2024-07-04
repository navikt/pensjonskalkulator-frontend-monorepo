import React from 'react'
import { useIntl } from 'react-intl'

import { PlusCircleIcon } from '@navikt/aksel-icons'
import { Button, Modal, VStack } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface Props {
  buttonLabel?: string
}
export const OmOppholdetDitt: React.FC<Props> = ({ buttonLabel }) => {
  const intl = useIntl()

  const oppholdModalRef = React.useRef<HTMLDialogElement>(null)

  const openOmOppholdetDittModal = () => {
    logger('modal åpnet', {
      tekst: `Modal: Om oppholdet ditt`,
    })
    oppholdModalRef.current?.showModal()
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
  }

  const onCancel = (): void => {
    if (oppholdModalRef.current?.open) {
      oppholdModalRef.current?.close()
    }
  }

  return (
    <>
      <Modal
        ref={oppholdModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'utenlandsopphold.om_oppholdet_ditt_modal.title',
          }),
        }}
        onClose={onCancel}
        width="small"
      >
        <Modal.Body>
          <form id="om-oppholdet-ditt" method="dialog" onSubmit={onSubmit}>
            <VStack gap="4">
              <p>lorem ipsum</p>
            </VStack>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button form="oppdatere-inntekt">
            {intl.formatMessage({
              id: 'utenlandsopphold.om_oppholdet_ditt_modal.button',
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
        icon={<PlusCircleIcon aria-hidden />}
        onClick={openOmOppholdetDittModal}
      >
        {intl.formatMessage({
          id: buttonLabel,
        })}
      </Button>
    </>
  )
}
