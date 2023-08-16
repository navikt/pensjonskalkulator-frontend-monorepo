import { FormattedMessage, useIntl } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import { Loader } from '@/components/components/Loader'

import styles from './ErrorStep.module.scss'

interface Props {
  isLoading: boolean
  onCancel: () => void
  onReload: () => void
}

export function ErrorStep({ isLoading, onCancel, onReload }: Props) {
  const intl = useIntl()
  if (isLoading) {
    return (
      <Loader
        data-testid="loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'loading.person',
        })}
      />
    )
  }
  return (
    <section className={styles.section}>
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="error.global.title" />
      </Heading>
      <Ingress className={styles.ingress}>
        <FormattedMessage id="error.global.ingress" />
      </Ingress>

      <Button
        type="button"
        className={styles.button}
        variant="primary"
        onClick={onReload}
      >
        <FormattedMessage id="error.global.button.reload" />
      </Button>
      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={onCancel}
      >
        <FormattedMessage id="error.global.button.avbryt" />
      </Button>
    </section>
  )
}
