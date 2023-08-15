import { FormattedMessage, useIntl } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import { Loader } from '@/components/components/Loader'

import styles from './ErrorStep.module.scss'

interface Props {
  isLoading?: boolean
  onPrimaryButtonClick: () => void
  onSecondaryButtonClick: () => void
  onCancel?: () => void
  text?: {
    header: string
    ingress: string
    primaryButton: string
    secondaryButton: string
    tertiaryButton: string
  }
}
// TODO etter merge av PEK-90 - vurdere flytting/merge av tekst og komponent med ErrorPageUnexpected
export function ErrorStep({
  isLoading,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  onCancel,
  text,
}: Props) {
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
        <FormattedMessage id={text?.header ?? 'error.global.title'} />
      </Heading>
      <Ingress className={styles.ingress}>
        <FormattedMessage
          id={text?.ingress ?? 'error.global.ingress'}
          values={{ br: <br /> }}
        />
      </Ingress>

      <Button
        type="button"
        className={styles.button}
        variant="primary"
        onClick={onPrimaryButtonClick}
      >
        <FormattedMessage
          id={text?.primaryButton ?? 'error.global.button.primary'}
        />
      </Button>

      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={onSecondaryButtonClick}
      >
        <FormattedMessage
          id={text?.secondaryButton ?? 'error.global.button.secondary'}
        />
      </Button>

      {onCancel && (
        <Button
          type="button"
          className={styles.button}
          variant="tertiary"
          onClick={onCancel}
        >
          <FormattedMessage
            id={text?.tertiaryButton ?? 'error.global.button.tertiary'}
          />
        </Button>
      )}
    </section>
  )
}
