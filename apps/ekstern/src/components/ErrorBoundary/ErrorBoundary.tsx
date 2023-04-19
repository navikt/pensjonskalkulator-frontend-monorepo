import React, { ReactNode } from 'react'

import { Alert, Heading } from '@navikt/ds-react'
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react'
import clsx from 'clsx'

import frameStyles from '../../scss/Frame/Frame.module.scss'

interface Props {
  children: ReactNode
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <SentryErrorBoundary
      fallback={
        <div className={clsx(frameStyles.frame, frameStyles.frame_hasPadding)}>
          <Alert variant="error">
            <Heading spacing size="small" level="1">
              Oisann!
            </Heading>
            Det har oppstått en feil. Prøv igjen senere.
          </Alert>
        </div>
      }
    >
      {children}
    </SentryErrorBoundary>
  )
}
