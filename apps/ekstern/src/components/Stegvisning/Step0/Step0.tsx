import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyShort, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'

import styles from './Step0.module.scss'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()

  const onCancelClick = (): void => {
    navigate('/')
  }

  const onNextClick = (): void => {
    navigate('/stegvisning/1')
  }

  return (
    <section className={styles.section}>
      <img
        className={styles.image}
        src={FridaPortrett}
        alt={intl.formatMessage({ id: 'stegvisning.steg0.bildetekst' })}
      />
      <Heading size="large" level="2" spacing>
        {intl.formatMessage({ id: 'stegvisning.steg0.title' })}
      </Heading>
      <BodyShort>
        {intl.formatMessage({ id: 'stegvisning.steg0.ingress' })}
      </BodyShort>

      <Button className={styles.button} onClick={onNextClick}>
        {intl.formatMessage({ id: 'stegvisning.steg0.neste_button' })}
      </Button>
      <Button variant="tertiary" onClick={onCancelClick}>
        {intl.formatMessage({ id: 'stegvisning.steg0.avbryt_button' })}
      </Button>
    </section>
  )
}
