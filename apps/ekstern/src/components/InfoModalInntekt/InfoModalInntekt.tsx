import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Label, Link, Modal } from '@navikt/ds-react'

import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './InfoModalInntekt.module.scss'

export const InfoModalInntekt = () => {
  const intl = useIntl()

  const infoModalRef = React.useRef<HTMLDialogElement>(null)

  const openInfoModal = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e?.preventDefault()
    logger('modal åpnet', {
      tekst: 'Grunnlag: info om pensjonsgivende inntekt',
    })
    infoModalRef.current?.showModal()
  }

  return (
    <>
      <Modal
        ref={infoModalRef}
        header={{
          heading: intl.formatMessage({
            id: 'inntekt.info_modal.title',
          }),
        }}
        width="medium"
      >
        <Modal.Body>
          <Label as="h2">
            <FormattedMessage id="inntekt.info_modal.subtitle" />
          </Label>
          <ul>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item1" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item2" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item3" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item4" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item5" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item6" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item7" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item8" />
            </li>
            <li>
              <FormattedMessage id="inntekt.info_modal.list_item9" />
            </li>
          </ul>
          <BodyLong>
            <FormattedMessage
              id="inntekt.info_modal.ingress"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={() => infoModalRef.current?.close()}>
            {intl.formatMessage({ id: 'inntekt.info_modal.lukk' })}
          </Button>
        </Modal.Footer>
      </Modal>

      <Link href="#" className={styles.link} onClick={openInfoModal} inlineText>
        <FormattedMessage id="inntekt.info_modal.open.link" />
      </Link>
    </>
  )
}
