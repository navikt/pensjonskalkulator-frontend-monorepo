import { FormattedMessage } from 'react-intl'

import { Button, Heading, Ingress } from '@navikt/ds-react'

import styles from './AFP.module.scss'

interface Props {
  showJaOffentligChoice: boolean
  onCancel: () => void
  onPrevious: () => void
  onNext: () => void
}

export function AFP({
  showJaOffentligChoice,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  return (
    <section className={styles.section}>
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="stegvisning.stegvisning.afp.title" />
      </Heading>
      <Ingress spacing>
        <FormattedMessage id="stegvisning.stegvisning.afp.ingress" />
      </Ingress>
      {showJaOffentligChoice && <p>Show 4 radio buttons</p>}

      <Button className={styles.button} onClick={onNext}>
        <FormattedMessage id="stegvisning.neste" />
      </Button>
      <Button
        className={styles.button}
        variant="secondary"
        onClick={onPrevious}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>
      <Button variant="tertiary" onClick={onCancel}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}
