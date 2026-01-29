import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Modal } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { logger, wrapLogger } from '@/utils/logging'

import styles from './LightBlueFooter.module.scss'

const TEST_IDS = {
  trigger: 'stegvisning.tilbake_start',
  confirm: 'stegvisning.tilbake_start.modal.bekreft',
  cancel: 'stegvisning.tilbake_start.modal.avbryt',
}

export function LightBlueFooter() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const avbrytModalRef = React.useRef<HTMLDialogElement>(null)

  const onClick = (): void => {
    avbrytModalRef.current?.showModal()
  }

  return (
    <>
      <Modal
        ref={avbrytModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'stegvisning.tilbake_start.modal.title',
          }),
        }}
        width="medium"
      >
        <Modal.Footer>
          <Button
            data-testid={TEST_IDS.confirm}
            type="button"
            onClick={() => {
              // TODO: fjern når amplitude er ikke i bruk lenger
              logger('button klikk', { tekst: 'Tilbake til start' })
              logger('knapp klikket', { tekst: 'Tilbake til start' })
              dispatch(userInputActions.flush())
              avbrytModalRef.current?.close()
              navigate(paths.start)
            }}
          >
            {intl.formatMessage({
              id: 'stegvisning.tilbake_start.modal.bekreft',
            })}
          </Button>
          <Button
            data-testid={TEST_IDS.cancel}
            type="button"
            variant="secondary"
            onClick={() => {
              avbrytModalRef.current?.close()
            }}
          >
            {intl.formatMessage({
              id: 'stegvisning.tilbake_start.modal.avbryt',
            })}
          </Button>
        </Modal.Footer>
      </Modal>
      <section className={styles.section}>
        <div className={styles.innerwrapper}>
          <Button
            data-testid={TEST_IDS.trigger}
            variant="tertiary"
            className={styles.button}
            onClick={wrapLogger('knapp klikket', {
              tekst: 'Tilbake til start modal',
            })(onClick)}
          >
            <FormattedMessage id="stegvisning.tilbake_start" />
          </Button>
        </div>
      </section>
    </>
  )
}
