import { useIntl, FormattedMessage } from 'react-intl'

import { BodyShort, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'

import styles from './Start.module.scss'

interface Props {
  onCancel: () => void
  onNext: () => void
}

export function Start({ onCancel, onNext }: Props) {
  const intl = useIntl()

  return (
    <section className={styles.section}>
      <img
        className={styles.image}
        src={FridaPortrett}
        alt={intl.formatMessage({
          id: 'stegvisning.stegvisning.start.bildetekst',
        })}
      />
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="stegvisning.stegvisning.start.title" />
      </Heading>
      <BodyShort className={styles.ingress}>
        <FormattedMessage id="stegvisning.stegvisning.start.ingress" />
      </BodyShort>
      <Button className={styles.button} onClick={onNext}>
        <FormattedMessage id="stegvisning.stegvisning.start.start" />
      </Button>
      <Button variant="tertiary" onClick={onCancel}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}
