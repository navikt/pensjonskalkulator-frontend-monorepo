import { useIntl, FormattedMessage } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'

import styles from './Start.module.scss'

interface Props {
  fornavn: string
  onCancel: () => void
  onNext: () => void
}

export function Start({ fornavn, onCancel, onNext }: Props) {
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
      <Heading className={styles.title} size="large" level="2" spacing>
        {`${intl.formatMessage({
          id: 'stegvisning.stegvisning.start.title',
        })} ${fornavn}!`}
      </Heading>
      <Ingress>
        <FormattedMessage id="stegvisning.stegvisning.start.ingress" />
      </Ingress>
      <Button className={styles.button} onClick={onNext}>
        <FormattedMessage id="stegvisning.stegvisning.start.start" />
      </Button>
      <Button variant="tertiary" onClick={onCancel}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}
