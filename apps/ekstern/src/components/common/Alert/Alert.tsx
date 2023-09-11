import React, { forwardRef } from 'react'

import { ArrowCirclepathIcon } from '@navikt/aksel-icons'
import { BodyLong, Button } from '@navikt/ds-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onRetry?: () => void
}

import styles from './Alert.module.scss'

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, onRetry, ...rest }, ref) => {
    return (
      <div {...rest} ref={ref} className={styles.alert}>
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
            Prøv på nytt
          </Button>
        )}
      </div>
    )
  }
)

export default Alert
