import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyShort, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'

import styles from './Step1.module.scss'

export function Step1() {
  const intl = useIntl()
  const navigate = useNavigate()

  const onCancelClick = (): void => {
    navigate('/')
  }

  const onNextClick = (): void => {
    navigate('/stegvisning/2')
  }

  return (
    <section className={styles.section}>
      <img
        className={styles.image}
        src={FridaPortrett}
        alt={intl.formatMessage({ id: 'stegvisning.steg1.bildetekst' })}
      />
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="stegvisning.steg1.title" />
      </Heading>
      <BodyShort className={styles.ingress}>
        <FormattedMessage id="stegvisning.steg1.ingress" />
      </BodyShort>
      <Button className={styles.button} onClick={onNextClick}>
        <FormattedMessage id="stegvisning.steg1.start" />
      </Button>
      <Button variant="tertiary" onClick={onCancelClick}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}
