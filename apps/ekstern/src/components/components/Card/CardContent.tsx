import { FormattedMessage, useIntl } from 'react-intl'

import { Ingress, Button, Heading } from '@navikt/ds-react'

import { Loader } from '@/components/components/Loader'

import styles from './CardContent.module.scss'

export interface CardContentProps {
  isLoading?: boolean
  onPrimaryButtonClick: () => void
  onSecondaryButtonClick: () => void
  onCancel?: () => void
  text?: {
    loading?: string
    header?: string
    ingress?: string
    primaryButton?: string
    secondaryButton?: string
    tertiaryButton?: string
  }
}

export function CardContent({
  isLoading,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  onCancel,
  text,
}: CardContentProps) {
  const intl = useIntl()
  if (isLoading) {
    return (
      <Loader
        data-testid="loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: text?.loading,
        })}
      />
    )
  }
  return (
    <>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id={text?.header} />
      </Heading>
      <Ingress className={styles.ingress}>
        <FormattedMessage id={text?.ingress} values={{ br: <br /> }} />
      </Ingress>

      <Button
        type="button"
        className={styles.button}
        variant="primary"
        onClick={onPrimaryButtonClick}
      >
        <FormattedMessage id={text?.primaryButton} />
      </Button>

      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={onSecondaryButtonClick}
      >
        <FormattedMessage id={text?.secondaryButton} />
      </Button>

      {onCancel && (
        <Button
          type="button"
          className={styles.button}
          variant="tertiary"
          onClick={onCancel}
        >
          <FormattedMessage id={text?.tertiaryButton} />
        </Button>
      )}
    </>
  )
}
