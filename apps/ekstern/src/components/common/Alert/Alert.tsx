import clsx from 'clsx'
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { ArrowCirclepathIcon } from '@navikt/aksel-icons'
import { BodyLong, Button } from '@navikt/ds-react'

import styles from './Alert.module.scss'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  onRetry?: () => void
}

export const Alert = ({
  className,
  children,
  onRetry,
  ...rest
}: AlertProps) => (
  <div {...rest} className={clsx(styles.alert, className)} role="alert">
    <BodyLong as="div" className={styles.alertWrapper}>
      {children}
    </BodyLong>
    {onRetry && (
      <Button
        size="small"
        iconPosition="right"
        variant="tertiary"
        onClick={onRetry}
        icon={<ArrowCirclepathIcon aria-hidden />}
      >
        <FormattedMessage id="application.global.retry" />
      </Button>
    )}
  </div>
)

export default Alert
